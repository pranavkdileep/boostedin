"use server";

import { cookies } from "next/headers";
import { randomBytes } from "crypto";

import { verifyUser } from "@/actions/auth/login";
import { db } from "@/lib/db/db";
import type { Billing, BillingStatus } from "@/lib/types/billing";
import type { User } from "@/lib/types/user";

const SESSION_COOKIE = "session";
const BILLINGS_COLLECTION = "billings";
const USERS_COLLECTION = "users";

interface GatewayOrderResponse {
  order_id: string | number;
  amount: string | number;
  status?: BillingStatus;
  paid_at?: string | null;
  created_at?: string;
}

interface GatewayCreateOrderResponse {
  amount: string | number;
  orderId?: string | number;
  order_id?: string | number;
  upiIntent: string;
}

export type ClientBilling = Omit<Billing, "time"> & {
  time: string;
};

interface PaymentStatusResult {
  billing: ClientBilling;
  gatewayOrder: GatewayOrderResponse;
}

export interface BillingOrderResult {
  billing: ClientBilling;
  upiIntent: string;
}

function getGatewayUrl(): string {
  const gatewayUrl = process.env.UPI_GATEWAY_URL;

  if (!gatewayUrl) {
    throw new Error("UPI_GATEWAY_URL is not defined in environment variables");
  }

  return gatewayUrl.replace(/\/$/, "");
}

function getGatewayHeaders(headers?: HeadersInit): HeadersInit {
  const secretKey = process.env.UPI_SECRET_KEY;

  if (!secretKey) {
    throw new Error("UPI_SECRET_KEY is not defined in environment variables");
  }

  return {
    ...headers,
    Authorization: `Bearer ${secretKey}`,
  };
}

async function getAuthenticatedUser(): Promise<User> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionToken) {
    throw new Error("Not authenticated");
  }

  const user = await verifyUser(sessionToken);
  if (!user) {
    throw new Error("Not authenticated");
  }

  return user;
}

function parseAmount(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  return amount;
}

function toClientBilling(billing: Billing): ClientBilling {
  return {
    billingId: billing.billingId,
    userId: billing.userId,
    amountPaid: billing.amountPaid,
    amountCredited: billing.amountCredited,
    time: new Date(billing.time).toISOString(),
    status: billing.status,
    orderId: billing.orderId,
  };
}

function normalizeGatewayOrder(payload: unknown): GatewayOrderResponse {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid gateway response");
  }

  const order = payload as Partial<GatewayOrderResponse>;

  if (order.order_id === undefined || order.amount === undefined) {
    throw new Error("Gateway response is missing order details");
  }

  return {
    ...order,
    order_id: order.order_id,
    amount: order.amount,
  };
}

function normalizeGatewayCreateOrder(payload: unknown): GatewayCreateOrderResponse {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid gateway response");
  }

  const order = payload as Partial<GatewayCreateOrderResponse>;
  const orderId = order.orderId ?? order.order_id;

  if (orderId === undefined || order.amount === undefined || !order.upiIntent) {
    throw new Error("Gateway response is missing order details");
  }

  return {
    amount: order.amount,
    orderId,
    upiIntent: order.upiIntent,
  };
}

function toBillingStatus(status: string | undefined): BillingStatus | null {
  if (
    status === "waiting" ||
    status === "waiting_for_webhook" ||
    status === "success" ||
    status === "timeout"
  ) {
    return status;
  }

  return null;
}

async function fetchGatewayOrder(orderId: string): Promise<GatewayOrderResponse> {
  const response = await fetch(`${getGatewayUrl()}/api/order/${orderId}`, {
    method: "GET",
    headers: getGatewayHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Gateway order not found");
    }

    const errorText = await response.text();
    throw new Error(`Gateway order status failed: ${errorText}`);
  }

  return normalizeGatewayOrder(await response.json());
}

async function creditBillingOrder(orderId: string): Promise<Billing> {
  const now = new Date();
  const billingsCollection = db.collection<Billing>(BILLINGS_COLLECTION);
  const usersCollection = db.collection<User>(USERS_COLLECTION);

  const billing = await billingsCollection.findOneAndUpdate(
    {
      orderId,
      status: { $ne: "success" },
    },
    {
      $set: {
        status: "success",
        time: now,
      },
    },
    { returnDocument: "after" }
  );

  if (!billing) {
    const existingBilling = await billingsCollection.findOne({ orderId });
    if (existingBilling?.status === "success") {
      return existingBilling as unknown as Billing;
    }

    throw new Error("Billing order not found");
  }

  await usersCollection.updateOne(
    { _id: billing.userId },
    {
      $inc: {
        credits: billing.amountCredited,
        totalCreditsPurchased: billing.amountCredited,
      },
      $set: { updatedAt: now },
    }
  );

  return billing as unknown as Billing;
}

export async function createBillingOrder(
  amountCredited: number
): Promise<BillingOrderResult> {
  const user = await getAuthenticatedUser();
  const requestedAmount = parseAmount(amountCredited);

  const response = await fetch(`${getGatewayUrl()}/api/create-order`, {
    method: "POST",
    headers: getGatewayHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ amount: requestedAmount }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gateway order creation failed: ${errorText}`);
  }

  const gatewayOrder = normalizeGatewayCreateOrder(await response.json());
  const gatewayAmount = Number(gatewayOrder.amount);

  if (!Number.isFinite(gatewayAmount) || gatewayAmount <= 0) {
    throw new Error("Gateway returned an invalid amount");
  }

  const billing: Billing = {
    billingId: randomBytes(16).toString("hex"),
    userId: user._id,
    amountPaid: gatewayAmount,
    amountCredited: requestedAmount,
    time: new Date(),
    status: "waiting",
    orderId: String(gatewayOrder.orderId),
  };

  await db.collection<Billing>(BILLINGS_COLLECTION).insertOne(
    billing as unknown as Billing
  );

  return {
    billing: toClientBilling(billing),
    upiIntent: gatewayOrder.upiIntent,
  };
}

export async function getBillingPaymentStatus(
  orderId: string
): Promise<PaymentStatusResult> {
  const user = await getAuthenticatedUser();
  const billingsCollection = db.collection<Billing>(BILLINGS_COLLECTION);
  const billing = await billingsCollection.findOne({ orderId, userId: user._id });

  if (!billing) {
    throw new Error("Billing order not found");
  }

  const gatewayOrder = await fetchGatewayOrder(orderId);
  const gatewayStatus = toBillingStatus(gatewayOrder.status);
  let nextBilling = billing as unknown as Billing;

  if (gatewayStatus === "success" && billing.status === "waiting") {
    await billingsCollection.updateOne(
      { orderId, userId: user._id, status: "waiting" },
      { $set: { status: "waiting_for_webhook" } }
    );
    nextBilling = { ...nextBilling, status: "waiting_for_webhook" };
  }

  if (gatewayStatus === "timeout" && billing.status !== "success") {
    await billingsCollection.updateOne(
      { orderId, userId: user._id, status: { $ne: "success" } },
      { $set: { status: "timeout" } }
    );
    nextBilling = { ...nextBilling, status: "timeout" };
  }

  return {
    billing: toClientBilling(nextBilling),
    gatewayOrder,
  };
}

export async function verifyBillingPayment(orderId: string): Promise<Billing> {
  const user = await getAuthenticatedUser();
  const billing = await db.collection<Billing>(BILLINGS_COLLECTION).findOne({
    orderId,
    userId: user._id,
  });

  if (!billing) {
    throw new Error("Billing order not found");
  }

  const gatewayOrder = await fetchGatewayOrder(orderId);

  if (gatewayOrder.status !== "success") {
    throw new Error("Payment is not successful yet");
  }

  return creditBillingOrder(orderId);
}

export async function processUpiPaymentSuccessWebhook(
  orderId: string,
  amountPaid: number
): Promise<Billing> {
  const billing = await db.collection<Billing>(BILLINGS_COLLECTION).findOne({
    orderId,
  });

  if (!billing) {
    throw new Error("Billing order not found");
  }

  if (billing.amountPaid !== amountPaid) {
    throw new Error("Webhook amount does not match billing order");
  }

  return creditBillingOrder(orderId);
}

export async function processUpiPaymentTimeoutWebhook(
  orderId: string
): Promise<Billing> {
  const now = new Date();
  const updated = await db.collection<Billing>(BILLINGS_COLLECTION).findOneAndUpdate(
    {
      orderId,
      status: { $ne: "success" },
    },
    {
      $set: {
        status: "timeout",
        time: now,
      },
    },
    { returnDocument: "after" }
  );

  if (!updated) {
    const existingBilling = await db
      .collection<Billing>(BILLINGS_COLLECTION)
      .findOne({ orderId });

    if (existingBilling) {
      return existingBilling as unknown as Billing;
    }

    throw new Error("Billing order not found");
  }

  return updated as unknown as Billing;
}

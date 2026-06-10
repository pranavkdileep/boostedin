import {
  processUpiPaymentSuccessWebhook,
  processUpiPaymentTimeoutWebhook,
} from "@/actions/user/billing";

interface UpiWebhookPayload {
  event?: string;
  order?: {
    order_id?: string | number;
    amount?: string | number;
    status?: string;
    paid_at?: string | null;
    created_at?: string;
  };
}

function getWebhookSecret(): string {
  const secret = process.env.UPI_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("UPI_WEBHOOK_SECRET is not defined in environment variables");
  }

  return secret;
}

function getOrderId(payload: UpiWebhookPayload): string {
  const orderId = payload.order?.order_id;

  if (orderId === undefined) {
    throw new Error("Webhook payload is missing order_id");
  }

  return String(orderId);
}

export async function POST(request: Request) {
  try {
    const requestSecret = request.headers.get("x-webhook-secret");
    if (!requestSecret || requestSecret !== getWebhookSecret()) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await request.json()) as UpiWebhookPayload;
    const orderId = getOrderId(payload);

    if (payload.event === "order.success") {
      const amountPaid = Number(payload.order?.amount);

      if (!Number.isFinite(amountPaid) || amountPaid <= 0) {
        return Response.json(
          { success: false, error: "Invalid order amount" },
          { status: 400 }
        );
      }

      await processUpiPaymentSuccessWebhook(orderId, amountPaid);
      return Response.json({ success: true });
    }

    if (payload.event === "order.timeout") {
      await processUpiPaymentTimeoutWebhook(orderId);
      return Response.json({ success: true });
    }

    return Response.json(
      { success: false, error: "Unsupported webhook event" },
      { status: 400 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook failed";
    return Response.json({ success: false, error: message }, { status: 400 });
  }
}

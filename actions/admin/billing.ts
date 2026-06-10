"use server";

import { db } from "@/lib/db/db";
import type { Billing, BillingStatus } from "@/lib/types/billing";
import type { User } from "@/lib/types/user";

const BILLINGS_COLLECTION = "billings";
const USERS_COLLECTION = "users";

export interface AdminBillingItem {
  billingId: string;
  userId: string;
  userName: string;
  userEmail: string;
  orderId: string;
  amountPaid: number;
  amountCredited: number;
  time: string;
  status: BillingStatus;
}

export interface AdminBillingResult {
  items: AdminBillingItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllBillings(
  page = 1,
  pageSize = 15,
  statusFilter?: BillingStatus | "all"
): Promise<AdminBillingResult> {
  const billingsCollection = db.collection<Billing>(BILLINGS_COLLECTION);
  const usersCollection = db.collection<User>(USERS_COLLECTION);

  const query: Record<string, unknown> = {};
  if (statusFilter && statusFilter !== "all") {
    query.status = statusFilter;
  }

  const total = await billingsCollection.countDocuments(query);
  const totalPages = Math.ceil(total / pageSize);
  const skip = (page - 1) * pageSize;

  const items = await billingsCollection
    .find(query, { sort: { _id: -1 }, skip, limit: pageSize })
    .toArray();

  const userIds = [...new Set(items.map((b) => b.userId))];
  const userDocs = await usersCollection
    .find({ _id: { $in: userIds } }, { projection: { _id: 1, name: 1, email: 1 } })
    .toArray();
  const userMap = new Map(userDocs.map((u) => [u._id, u]));

  return {
    items: (items as unknown as Billing[]).map((b) => {
      const user = userMap.get(b.userId);
      return {
        billingId: b.billingId,
        userId: b.userId,
        userName: user?.name ?? "Unknown",
        userEmail: user?.email ?? "Unknown",
        orderId: b.orderId,
        amountPaid: b.amountPaid,
        amountCredited: b.amountCredited,
        time: new Date(b.time).toISOString(),
        status: b.status,
      };
    }),
    total,
    page,
    pageSize,
    totalPages,
  };
}

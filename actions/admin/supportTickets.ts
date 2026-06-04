"use server";

import { db } from "@/lib/db/db";
import type { SupportTicket, TicketStatus } from "@/lib/types/supportTicket";

const TICKETS_COLLECTION = "supportTickets";

export interface AdminTicketItem {
  _id: string;
  subject: string;
  description: string;
  email: string;
  type: string;
  priority: string;
  status: string;
  attachmentLink?: string;
  createdAt: Date;
}

export interface AdminTicketResult {
  items: AdminTicketItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface TicketStats {
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  total: number;
}

export async function getAllTickets(
  page = 1,
  pageSize = 20,
  status?: TicketStatus | "all"
): Promise<AdminTicketResult> {
  const ticketsCollection =
    db.collection<SupportTicket>(TICKETS_COLLECTION);

  const query: Record<string, unknown> = {};

  if (status && status !== "all") {
    query.status = status;
  }

  const total = await ticketsCollection.countDocuments(query);
  const totalPages = Math.ceil(total / pageSize);
  const skip = (page - 1) * pageSize;

  const items = await ticketsCollection
    .find(query, {
      sort: { createdAt: -1 },
      skip,
      limit: pageSize,
    })
    .toArray();

  return {
    items: items as unknown as AdminTicketItem[],
    page,
    pageSize,
    total,
    totalPages,
  };
}

export async function getTicketStats(): Promise<TicketStats> {
  const ticketsCollection =
    db.collection<SupportTicket>(TICKETS_COLLECTION);

  const stats = await ticketsCollection
    .aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ])
    .toArray();

  const result: TicketStats = {
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    total: 0,
  };

  for (const item of stats) {
    const status = item._id as string;
    const count = item.count as number;
    if (status in result) {
      result[status as keyof TicketStats] = count;
    }
    result.total += count;
  }

  return result;
}

export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus
): Promise<void> {
  const ticketsCollection =
    db.collection<SupportTicket>(TICKETS_COLLECTION);

  const update: Record<string, unknown> = {
    $set: {
      status,
      updatedAt: new Date(),
    },
  };

  if (status === "closed" || status === "resolved") {
    (update.$set as Record<string, unknown>).closedAt = new Date();
  }

  await ticketsCollection.updateOne({ _id: ticketId }, update);
}

export async function deleteTicket(ticketId: string): Promise<void> {
  const ticketsCollection =
    db.collection<SupportTicket>(TICKETS_COLLECTION);

  await ticketsCollection.deleteOne({ _id: ticketId });
}

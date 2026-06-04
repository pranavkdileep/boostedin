"use server";

import { cookies } from "next/headers";
import { randomBytes } from "crypto";

import { verifyUser } from "@/actions/auth/login";
import { db } from "@/lib/db/db";
import type {
  SupportTicket,
  TicketCreateInput,
  TicketResult,
} from "@/lib/types/supportTicket";

const SESSION_COOKIE = "session";
const TICKETS_COLLECTION = "supportTickets";
const DEFAULT_PAGE_SIZE = 10;

async function getAuthenticatedUserId(): Promise<string> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionToken) {
    throw new Error("Not authenticated");
  }

  const user = await verifyUser(sessionToken);
  if (!user) {
    throw new Error("Not authenticated");
  }

  return user._id;
}

async function getAuthenticatedUser() {
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

export async function createTicket(
  input: TicketCreateInput
): Promise<SupportTicket> {
  const user = await getAuthenticatedUser();
  const now = new Date();

  const ticket: SupportTicket = {
    _id: randomBytes(16).toString("hex"),
    userId: user._id,
    email: user.email,
    type: input.type,
    subject: input.subject.trim(),
    description: input.description.trim(),
    attachmentLink: input.attachmentLink?.trim() || undefined,
    status: "open",
    priority: input.priority ?? "medium",
    createdAt: now,
    updatedAt: now,
  };

  const ticketsCollection =
    db.collection<SupportTicket>(TICKETS_COLLECTION);
  await ticketsCollection.insertOne(
    ticket as unknown as SupportTicket
  );

  return ticket;
}

export async function getUserTickets(
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<TicketResult> {
  const userId = await getAuthenticatedUserId();

  const ticketsCollection =
    db.collection<SupportTicket>(TICKETS_COLLECTION);
  const query = { userId };

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
    items: items as unknown as SupportTicket[],
    page,
    pageSize,
    total,
    totalPages,
  };
}

export async function getTicketById(
  ticketId: string
): Promise<SupportTicket> {
  const userId = await getAuthenticatedUserId();

  const ticketsCollection =
    db.collection<SupportTicket>(TICKETS_COLLECTION);
  const ticket = await ticketsCollection.findOne({
    _id: ticketId,
    userId,
  });

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  return ticket as unknown as SupportTicket;
}

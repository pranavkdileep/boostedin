export type TicketType =
  | "bug"
  | "feature_request"
  | "account"
  | "billing"
  | "other";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type TicketPriority = "low" | "medium" | "high";

export interface SupportTicket {
  _id: string;

  userId: string;
  email: string;

  type: TicketType;
  subject: string;
  description: string;

  attachmentLink?: string;

  status: TicketStatus;
  priority: TicketPriority;

  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

export interface TicketCreateInput {
  type: TicketType;
  subject: string;
  description: string;
  priority?: TicketPriority;
  attachmentLink?: string;
}

export interface TicketResult {
  items: SupportTicket[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

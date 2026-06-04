export type NotificationType =
  | "generation_success"
  | "generation_failure"
  | "publish_success"
  | "publish_failure"
  | "post_scheduled"
  | "post_unscheduled"
  | "token_expired";

export type NotificationStatus = "active" | "done";

export interface Notification {
  _id: string;

  userId: string;

  type: NotificationType;
  title: string;
  message: string;

  href?: string;
  postId?: string;

  status: NotificationStatus;

  createdAt: Date;
  doneAt?: Date;
}

export interface NotificationResult {
  items: Notification[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  unreadCount: number;
}

export interface NotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  href?: string;
  postId?: string;
}

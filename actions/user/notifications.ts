"use server";

import { cookies } from "next/headers";
import { randomBytes } from "crypto";

import { verifyUser } from "@/actions/auth/login";
import { db } from "@/lib/db/db";
import type {
  Notification,
  NotificationInput,
  NotificationResult,
} from "@/lib/types/notification";

const SESSION_COOKIE = "session";
const NOTIFICATIONS_COLLECTION = "notifications";

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

export async function createNotification(
  input: NotificationInput
): Promise<string> {
  const now = new Date();

  const notification: Notification = {
    _id: randomBytes(16).toString("hex"),
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    href: input.href,
    postId: input.postId,
    status: "active",
    createdAt: now,
  };

  const notificationsCollection =
    db.collection<Notification>(NOTIFICATIONS_COLLECTION);
  await notificationsCollection.insertOne(
    notification as unknown as Notification
  );

  return notification._id;
}

export async function getNotifications(
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<NotificationResult> {
  const userId = await getAuthenticatedUserId();

  const notificationsCollection =
    db.collection<Notification>(NOTIFICATIONS_COLLECTION);
  const query = { userId, status: "active" as const };

  const total = await notificationsCollection.countDocuments(query);
  const totalPages = Math.ceil(total / pageSize);
  const skip = (page - 1) * pageSize;

  const items = await notificationsCollection
    .find(query, {
      sort: { createdAt: -1 },
      skip,
      limit: pageSize,
    })
    .toArray();

  const unreadCount = await notificationsCollection.countDocuments({
    userId,
    status: "active",
  });

  return {
    items: items as unknown as Notification[],
    page,
    pageSize,
    total,
    totalPages,
    unreadCount,
  };
}

export async function getUnreadNotificationCount(): Promise<number> {
  const userId = await getAuthenticatedUserId();

  const notificationsCollection =
    db.collection<Notification>(NOTIFICATIONS_COLLECTION);

  return notificationsCollection.countDocuments({
    userId,
    status: "active",
  });
}

export async function markNotificationDone(
  notificationId: string
): Promise<void> {
  const userId = await getAuthenticatedUserId();

  const notificationsCollection =
    db.collection<Notification>(NOTIFICATIONS_COLLECTION);

  await notificationsCollection.updateOne(
    { _id: notificationId, userId },
    {
      $set: {
        status: "done",
        doneAt: new Date(),
      },
    }
  );
}

export async function markAllNotificationsDone(): Promise<void> {
  const userId = await getAuthenticatedUserId();

  const notificationsCollection =
    db.collection<Notification>(NOTIFICATIONS_COLLECTION);

  await notificationsCollection.updateMany(
    { userId, status: "active" },
    {
      $set: {
        status: "done",
        doneAt: new Date(),
      },
    }
  );
}

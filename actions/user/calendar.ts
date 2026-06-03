"use server";

import { cookies } from "next/headers";

import { verifyUser } from "@/actions/auth/login";
import { db } from "@/lib/db/db";
import type { Post, PostStatus } from "@/lib/types/post";

const SESSION_COOKIE = "session";
const POSTS_COLLECTION = "posts";

export interface CalendarPostItem {
  _id: string;
  title: string;
  postBody: string;
  status: PostStatus;
  scheduledAt?: Date;
  publishedAt?: Date;
  updatedAt: Date;
  category?: string;
  tone?: string;
}

export interface CalendarData {
  user: {
    name: string;
    profilePictureUrl?: string;
  };
  month: number;
  year: number;
  scheduledPosts: CalendarPostItem[];
  unscheduledDrafts: CalendarPostItem[];
}

export async function getCalendarData({
  month,
  year,
}: {
  month: number;
  year: number;
}): Promise<CalendarData> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionToken) {
    throw new Error("Not authenticated");
  }

  const user = await verifyUser(sessionToken);
  if (!user) {
    throw new Error("Not authenticated");
  }

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 1);
  const postsCollection = db.collection<Post>(POSTS_COLLECTION);

  const [scheduledPosts, unscheduledDrafts] = await Promise.all([
    postsCollection
      .find(
        {
          userId: user._id,
          $or: [
            {
              isScheduled: true,
              scheduledAt: { $gte: monthStart, $lt: monthEnd },
            },
            {
              status: "published",
              publishedAt: { $gte: monthStart, $lt: monthEnd },
            },
          ],
        },
        {
          sort: { scheduledAt: 1, publishedAt: 1 },
          projection: {
            _id: 1,
            title: 1,
            postBody: 1,
            status: 1,
            scheduledAt: 1,
            publishedAt: 1,
            updatedAt: 1,
            category: 1,
            tone: 1,
          },
        }
      )
      .toArray(),
    postsCollection
      .find(
        {
          userId: user._id,
          status: "draft",
          isScheduled: false,
        },
        {
          sort: { updatedAt: -1 },
          limit: 6,
          projection: {
            _id: 1,
            title: 1,
            postBody: 1,
            status: 1,
            updatedAt: 1,
            category: 1,
            tone: 1,
          },
        }
      )
      .toArray(),
  ]);

  return {
    user: {
      name: user.name,
      profilePictureUrl: user.profilePictureUrl,
    },
    month,
    year,
    scheduledPosts: scheduledPosts as unknown as CalendarPostItem[],
    unscheduledDrafts: unscheduledDrafts as unknown as CalendarPostItem[],
  };
}

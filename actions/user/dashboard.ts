"use server";

import { cookies } from "next/headers";

import { verifyUser } from "@/actions/auth/login";
import { db } from "@/lib/db/db";
import type { Post, PostStatus } from "@/lib/types/post";

const SESSION_COOKIE = "session";
const POSTS_COLLECTION = "posts";
const GENERATED_STATUSES: PostStatus[] = [
  "draft",
  "scheduled",
  "publishing",
  "published",
  "failed",
];

export interface UpcomingPostItem {
  _id: string;
  title: string;
  scheduledAt: Date;
  tone?: string;
  status: string;
}

export interface DashboardData {
  name: string;
  profilePictureUrl?: string;
  credits: number;
  totalCreditsUsed: number;
  postsGenerated: number;
  scheduledCount: number;
  upcoming: UpcomingPostItem[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionToken) {
    throw new Error("Not authenticated");
  }

  const user = await verifyUser(sessionToken);
  if (!user) {
    throw new Error("Not authenticated");
  }

  const now = new Date();
  const postsCollection = db.collection<Post>(POSTS_COLLECTION);

  const [postsGenerated, scheduledCount] = await Promise.all([
    postsCollection.countDocuments({
      userId: user._id,
      status: { $in: GENERATED_STATUSES },
    }),
    postsCollection.countDocuments({
      userId: user._id,
      isScheduled: true,
      scheduledAt: { $gte: now },
    }),
  ]);

  const upcomingPosts = await postsCollection
    .find(
      {
        userId: user._id,
        isScheduled: true,
        scheduledAt: { $gte: now },
      },
      {
        sort: { scheduledAt: 1 },
        limit: 5,
        projection: {
          _id: 1,
          title: 1,
          scheduledAt: 1,
          tone: 1,
          status: 1,
        },
      }
    )
    .toArray();

  return {
    name: user.name,
    profilePictureUrl: user.profilePictureUrl,
    credits: user.credits,
    totalCreditsUsed: user.totalCreditsUsed,
    postsGenerated,
    scheduledCount,
    upcoming: upcomingPosts as unknown as UpcomingPostItem[],
  };
}

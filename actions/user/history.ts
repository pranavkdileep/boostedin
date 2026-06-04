"use server";

import { cookies } from "next/headers";
import { randomBytes } from "crypto";

import { verifyUser } from "@/actions/auth/login";
import { db } from "@/lib/db/db";
import type { Post, PostHistoryEntry, PostStatus } from "@/lib/types/post";
import type { Notification } from "@/lib/types/notification";

const SESSION_COOKIE = "session";
const POSTS_COLLECTION = "posts";
const NOTIFICATIONS_COLLECTION = "notifications";

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

export interface GetHistoryFilters {
  status?: PostStatus | "all";
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface GetHistoryResult {
  posts: HistoryListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface HistoryListItem {
  _id: string;
  status: PostStatus;
  title: string;
  postBody: string;
  coverImageUrl?: string;
  prompt?: string;
  hashtags: string[];
  tone?: string;
  category?: string;
  linkedinPostId?: string;
  linkedinPostUrl?: string;
  linkedinPublishError?: string;
  isScheduled: boolean;
  scheduledAt?: Date;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export async function getHistory(
  filters?: GetHistoryFilters
): Promise<GetHistoryResult> {
  const userId = await getAuthenticatedUserId();
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters?.pageSize ?? 10));

  const query: Record<string, unknown> = { userId };

  if (filters?.status && filters.status !== "all") {
    query.status = filters.status;
  }

  if (filters?.search && filters.search.trim()) {
    const escaped = filters.search
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    query.$or = [
      { title: regex },
      { prompt: regex },
      { postBody: regex },
      { hashtags: { $elemMatch: regex } },
    ];
  }

  const postsCollection = db.collection<Post>(POSTS_COLLECTION);
  const total = await postsCollection.countDocuments(query);
  const totalPages = Math.ceil(total / pageSize);
  const skip = (page - 1) * pageSize;

  const posts = await postsCollection
    .find(query, { sort: { createdAt: -1 }, skip, limit: pageSize })
    .toArray();

  return {
    posts: posts as unknown as HistoryListItem[],
    total,
    page,
    pageSize,
    totalPages,
  };
}

export interface HistoryPostDetail extends HistoryListItem {
  history: PostHistoryEntry[];
}

export async function getHistoryPost(
  postId: string
): Promise<HistoryPostDetail> {
  const userId = await getAuthenticatedUserId();

  const postsCollection = db.collection<Post>(POSTS_COLLECTION);
  const post = await postsCollection.findOne({ _id: postId, userId });

  if (!post) {
    throw new Error("Post not found");
  }

  return post as unknown as HistoryPostDetail;
}

export interface UpdateHistoryPostInput {
  title?: string;
  postBody?: string;
  coverImageUrl?: string;
  hashtags?: string[];
}

export async function updateHistoryPost(
  postId: string,
  input: UpdateHistoryPostInput
): Promise<HistoryPostDetail> {
  const userId = await getAuthenticatedUserId();

  const postsCollection = db.collection<Post>(POSTS_COLLECTION);
  const post = await postsCollection.findOne({ _id: postId, userId });

  if (!post) {
    throw new Error("Post not found");
  }

  if (post.status === "queued" || post.status === "processing") {
    throw new Error("Cannot edit a post that is still generating");
  }

  const now = new Date();
  const setFields: Record<string, unknown> = { updatedAt: now };
  const pushHistory: PostHistoryEntry[] = [];

  if (input.title !== undefined) {
    const trimmed = input.title.trim();
    setFields.title = trimmed;
    pushHistory.push({ title: trimmed, body: post.postBody, changedAt: now });
  }

  if (input.postBody !== undefined) {
    const trimmed = input.postBody.trim();
    setFields.postBody = trimmed;
    pushHistory.push({
      title: (setFields.title as string) ?? post.title,
      body: trimmed,
      changedAt: now,
    });
  }

  if (input.coverImageUrl !== undefined) {
    setFields.coverImageUrl = input.coverImageUrl || undefined;
  }

  if (input.hashtags !== undefined) {
    setFields.hashtags = input.hashtags;
  }

  const update: Record<string, unknown> = { $set: setFields };
  if (pushHistory.length > 0) {
    update.$push = { history: { $each: pushHistory } };
  }

  await postsCollection.updateOne({ _id: postId, userId }, update);

  const updated = await postsCollection.findOne({ _id: postId, userId });
  if (!updated) {
    throw new Error("Failed to retrieve updated post");
  }

  return updated as unknown as HistoryPostDetail;
}

export async function deleteHistoryPost(postId: string): Promise<void> {
  const userId = await getAuthenticatedUserId();

  const postsCollection = db.collection<Post>(POSTS_COLLECTION);
  const result = await postsCollection.deleteOne({ _id: postId, userId });

  if (result.deletedCount === 0) {
    throw new Error("Post not found");
  }
}

export async function duplicateHistoryPost(
  postId: string
): Promise<{ postId: string }> {
  const userId = await getAuthenticatedUserId();

  const postsCollection = db.collection<Post>(POSTS_COLLECTION);
  const original = await postsCollection.findOne({ _id: postId, userId });

  if (!original) {
    throw new Error("Post not found");
  }

  const now = new Date();
  const newPost: Post = {
    _id: randomBytes(16).toString("hex"),
    userId,
    coverImageUrl: original.coverImageUrl,
    title: original.title,
    postBody: original.postBody,
    status: "draft",
    isScheduled: false,
    hashtags: [...original.hashtags],
    tone: original.tone,
    category: original.category,
    prompt: original.prompt,
    engagement: { impressions: 0, reactions: 0, comments: 0, reposts: 0 },
    history: [],
    createdAt: now,
    updatedAt: now,
  };

  await postsCollection.insertOne(newPost as unknown as Post);

  return { postId: newPost._id };
}

export async function republishHistoryPost(
  postId: string
): Promise<{ postId: string }> {
  const userId = await getAuthenticatedUserId();

  const postsCollection = db.collection<Post>(POSTS_COLLECTION);
  const post = await postsCollection.findOne({ _id: postId, userId });

  if (!post) {
    throw new Error("Post not found");
  }

  const allowedStatuses: PostStatus[] = ["draft", "scheduled", "published", "failed"];
  if (!allowedStatuses.includes(post.status)) {
    throw new Error(
      `Cannot republish a post with status "${post.status}". Only draft, published, or failed posts can be republished.`
    );
  }

  const { publishPostWorkflow } = await import("@/workflows/publishPost");
  const { start } = await import("workflow/api");

  await start(publishPostWorkflow, [postId]);

  return { postId };
}

export async function rescheduleHistoryPost(
  postId: string,
  scheduledAt: string | null
): Promise<void> {
  const userId = await getAuthenticatedUserId();

  const postsCollection = db.collection<Post>(POSTS_COLLECTION);
  const post = await postsCollection.findOne({ _id: postId, userId });

  if (!post) {
    throw new Error("Post not found");
  }

  const now = new Date();

  if (scheduledAt) {
    const date = new Date(scheduledAt);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid schedule date");
    }
    if (date.getTime() <= Date.now()) {
      throw new Error("Schedule date must be in the future");
    }

    await postsCollection.updateOne(
      { _id: postId, userId },
      {
        $set: {
          isScheduled: true,
          scheduledAt: date,
          status: "scheduled",
          updatedAt: now,
        },
      }
    );

    const notificationsCollection =
      db.collection<Notification>(NOTIFICATIONS_COLLECTION);
    await notificationsCollection.insertOne({
      _id: randomBytes(16).toString("hex"),
      userId,
      type: "post_scheduled",
      title: "Post scheduled",
      message: `"${post.title || "Untitled post"}" will be published on ${date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}.`,
      href: "/dash/calendar",
      postId,
      status: "active",
      createdAt: now,
    } as unknown as Notification);
  } else {
    await postsCollection.updateOne(
      { _id: postId, userId },
      {
        $set: {
          isScheduled: false,
          scheduledAt: undefined,
          status: "draft",
          updatedAt: now,
        },
      }
    );

    const notificationsCollection =
      db.collection<Notification>(NOTIFICATIONS_COLLECTION);
    await notificationsCollection.insertOne({
      _id: randomBytes(16).toString("hex"),
      userId,
      type: "post_unscheduled",
      title: "Post moved to draft",
      message: `"${post.title || "Untitled post"}" was unscheduled and moved back to drafts.`,
      href: "/dash/history",
      postId,
      status: "active",
      createdAt: now,
    } as unknown as Notification);
  }
}

"use server";

import { db } from "@/lib/db/db";
import type { Post, PostStatus } from "@/lib/types/post";
import type { User } from "@/lib/types/user";

const POSTS_COLLECTION = "posts";
const USERS_COLLECTION = "users";

export interface AdminPostItem {
  _id: string;
  title: string;
  postBody: string;
  status: PostStatus;
  isScheduled: boolean;
  scheduledAt?: Date;
  publishedAt?: Date;
  authorName: string;
  authorEmail: string;
  createdAt: Date;
}

export interface AdminPostResult {
  items: AdminPostItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PostStats {
  draft: number;
  scheduled: number;
  published: number;
  failed: number;
  total: number;
}

export async function getAllPosts(
  page = 1,
  pageSize = 20,
  status?: PostStatus | "all"
): Promise<AdminPostResult> {
  const postsCollection = db.collection<Post>(POSTS_COLLECTION);

  const query: Record<string, unknown> = {};

  if (status && status !== "all") {
    query.status = status;
  }

  const total = await postsCollection.countDocuments(query);
  const totalPages = Math.ceil(total / pageSize);
  const skip = (page - 1) * pageSize;

  const posts = await postsCollection
    .find(query, {
      sort: { createdAt: -1 },
      skip,
      limit: pageSize,
    })
    .toArray();

  const userIds = [...new Set(posts.map((p) => p.userId))];
  const usersCollection = db.collection<User>(USERS_COLLECTION);
  const users = await usersCollection
    .find(
      { _id: { $in: userIds } },
      { projection: { _id: 1, name: 1, email: 1 } }
    )
    .toArray();

  const userMap = new Map(
    users.map((u) => [u._id, { name: u.name, email: u.email }])
  );

  return {
    items: posts.map((p) => {
      const author = userMap.get(p.userId) ?? {
        name: "Unknown",
        email: "unknown",
      };
      return {
        _id: p._id,
        title: p.title,
        postBody: p.postBody,
        status: p.status,
        isScheduled: p.isScheduled,
        scheduledAt: p.scheduledAt,
        publishedAt: p.publishedAt,
        authorName: author.name,
        authorEmail: author.email,
        createdAt: p.createdAt,
      };
    }),
    page,
    pageSize,
    total,
    totalPages,
  };
}

export async function getPostStats(): Promise<PostStats> {
  const postsCollection = db.collection<Post>(POSTS_COLLECTION);

  const stats = await postsCollection
    .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
    .toArray();

  const result: PostStats = {
    draft: 0,
    scheduled: 0,
    published: 0,
    failed: 0,
    total: 0,
  };

  for (const item of stats) {
    const status = item._id as string;
    const count = item.count as number;
    if (status in result) {
      result[status as keyof PostStats] = count;
    }
    result.total += count;
  }

  return result;
}

export async function deletePost(postId: string): Promise<void> {
  const postsCollection = db.collection<Post>(POSTS_COLLECTION);
  await postsCollection.deleteOne({ _id: postId });
}

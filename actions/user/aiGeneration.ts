"use server";

import { cookies } from "next/headers";
import { randomBytes } from "crypto";

import { verifyUser } from "@/actions/auth/login";
import { db } from "@/lib/db/db";
import type { Post, PostHistoryEntry, PostStatus } from "@/lib/types/post";
import type { User } from "@/lib/types/user";

const SESSION_COOKIE = "session";
const POSTS_COLLECTION = "posts";
const USERS_COLLECTION = "users";

async function getAuthenticatedUserId(): Promise<string> {
  const user = await getAuthenticatedUser();
  return user._id;
}

async function getAuthenticatedUser(): Promise<User> {
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

function hasValidPostingToken(user: User): boolean {
  if (!user.linkedinPostingEnabled || !user.linkedin.postingAccessToken) {
    return false;
  }

  if (!user.linkedin.postingTokenExpiresAt) {
    return true;
  }

  return new Date(user.linkedin.postingTokenExpiresAt).getTime() > Date.now();
}

export interface StartGenerationInput {
  prompt: string;
  tone?: string;
  category?: string;
  coverImageUrl?: string;
}

export async function startGeneration(
  input: StartGenerationInput
): Promise<{ postId: string }> {
  const user = await getAuthenticatedUser();
  const userId = user._id;

  if (!hasValidPostingToken(user)) {
    const usersCollection = db.collection<User>(USERS_COLLECTION);
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          linkedinPostingEnabled: false,
          updatedAt: new Date(),
        },
      }
    );

    throw new Error("Connect LinkedIn posting access before generating content.");
  }

  if (user.credits < 1) {
    throw new Error("You need at least 1 credit to generate content.");
  }

  const postsCollection = db.collection<Post>(POSTS_COLLECTION);
  const pendingCount = await postsCollection.countDocuments({
    userId,
    status: { $in: ["queued", "processing"] },
  });

  if (pendingCount > 0) {
    throw new Error("You already have a post being generated. Wait for it to finish before starting a new one.");
  }

  const now = new Date();

  const post: Post = {
    _id: randomBytes(16).toString("hex"),
    userId,
    coverImageUrl: input.coverImageUrl,
    title: "",
    postBody: "",
    status: "queued",
    isScheduled: false,
    hashtags: [],
    tone: input.tone,
    category: input.category,
    prompt: input.prompt,
    engagement: {
      impressions: 0,
      reactions: 0,
      comments: 0,
      reposts: 0,
    },
    history: [],
    createdAt: now,
    updatedAt: now,
  };

  const { generatePostWorkflow } = await import("@/workflows/generatePost");
  const { start } = await import("workflow/api");

  await start(generatePostWorkflow, [post]);

  return { postId: post._id };
}

export async function startPublish(
  postId: string
): Promise<{ postId: string }> {
  const userId = await getAuthenticatedUserId();

  const postsCollection = db.collection<Post>(POSTS_COLLECTION);
  const post = await postsCollection.findOne({ _id: postId, userId });

  if (!post) {
    throw new Error("Post not found");
  }

  if (post.status !== "draft") {
    throw new Error(
      `Cannot publish a post with status "${post.status}". Only "draft" posts can be published.`
    );
  }

  const { publishPostWorkflow } = await import("@/workflows/publishPost");
  const { start } = await import("workflow/api");

  await start(publishPostWorkflow, [postId]);

  return { postId };
}

export interface PostStatusResult {
  _id: string;
  status: PostStatus;
  error?: string;
}

export async function getGenerationStatus(
  postId: string
): Promise<PostStatusResult> {
  const userId = await getAuthenticatedUserId();

  const postsCollection = db.collection<Post>(POSTS_COLLECTION);
  const post = await postsCollection.findOne({ _id: postId, userId });

  if (!post) {
    throw new Error("Post not found");
  }

  return {
    _id: post._id,
    status: post.status,
    error:
      post.status === "failed" ? post.linkedinPublishError : undefined,
  };
}

export interface GeneratedContentResult {
  _id: string;
  status: PostStatus;
  title: string;
  postBody: string;
  coverImageUrl?: string;
  prompt?: string;
  hashtags: string[];
  history: PostHistoryEntry[];
}

export async function getGeneratedContent(
  postId: string
): Promise<GeneratedContentResult> {
  const userId = await getAuthenticatedUserId();

  const postsCollection = db.collection<Post>(POSTS_COLLECTION);
  const post = await postsCollection.findOne({ _id: postId, userId });

  if (!post) {
    throw new Error("Post not found");
  }

  if (post.status === "queued" || post.status === "processing") {
    throw new Error("Content is still being generated");
  }

  return {
    _id: post._id,
    status: post.status,
    title: post.title,
    postBody: post.postBody,
    coverImageUrl: post.coverImageUrl,
    prompt: post.prompt,
    hashtags: post.hashtags,
    history: post.history,
  };
}

export interface PostHistoryItem {
  _id: string;
  status: PostStatus;
  title: string;
  postBody: string;
  coverImageUrl?: string;
  prompt?: string;
  hashtags: string[];
  tone?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getHistory(): Promise<PostHistoryItem[]> {
  const userId = await getAuthenticatedUserId();

  const postsCollection = db.collection<Post>(POSTS_COLLECTION);
  const posts = await postsCollection
    .find(
      { userId },
      {
        sort: { createdAt: -1 },
        projection: {
          _id: 1,
          status: 1,
          title: 1,
          postBody: 1,
          coverImageUrl: 1,
          prompt: 1,
          hashtags: 1,
          tone: 1,
          category: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      }
    )
    .toArray();

  return posts as unknown as PostHistoryItem[];
}

export interface UpdatePostInput {
  title?: string;
  postBody?: string;
  coverImageUrl?: string;
  hashtags?: string[];
}

export async function updatePost(
  postId: string,
  input: UpdatePostInput
): Promise<GeneratedContentResult> {
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
  const setFields: Record<string, unknown> = {
    updatedAt: now,
  };
  const pushHistory: { title: string; body: string; changedAt: Date }[] = [];

  if (input.title !== undefined && input.title.trim()) {
    setFields.title = input.title.trim();
    pushHistory.push({
      title: input.title.trim(),
      body: post.postBody,
      changedAt: now,
    });
  }

  if (input.postBody !== undefined && input.postBody.trim()) {
    setFields.postBody = input.postBody.trim();
    pushHistory.push({
      title: pushHistory.length > 0 ? input.title!.trim() : post.title,
      body: input.postBody.trim(),
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
    update.$push = {
      history: { $each: pushHistory },
    };
  }

  await postsCollection.updateOne({ _id: postId, userId }, update);

  const updated = await postsCollection.findOne({ _id: postId, userId });

  if (!updated) {
    throw new Error("Failed to retrieve updated post");
  }

  return {
    _id: updated._id,
    status: updated.status,
    title: updated.title,
    postBody: updated.postBody,
    coverImageUrl: updated.coverImageUrl,
    prompt: updated.prompt,
    hashtags: updated.hashtags,
    history: updated.history,
  };
}

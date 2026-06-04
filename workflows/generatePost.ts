import { FatalError } from "workflow";
import { randomBytes } from "crypto";

import { generatePost as generatePostLLM } from "@/actions/llm/generatePost";
import { db } from "@/lib/db/db";
import type { Post } from "@/lib/types/post";
import type { User } from "@/lib/types/user";
import type { Notification } from "@/lib/types/notification";

const POSTS_COLLECTION = "posts";
const USERS_COLLECTION = "users";
const NOTIFICATIONS_COLLECTION = "notifications";

export async function generatePostWorkflow(postData: Post) {
  "use workflow";

  const postId = await createPost(postData);
  await updatePostStatus(postId, "processing");

  try {
    const result = await callLLMGenerate(postData);
    await savePostResult(postId, result);
  } catch (err) {
    await savePostError(
      postId,
      postData.userId,
      err instanceof Error ? err.message : "Generation failed"
    );
  }

  return { postId };
}

async function createPost(post: Post): Promise<string> {
  "use step";

  const postsCollection = db.collection<Post>(POSTS_COLLECTION);
  const now = new Date();

  const newPost: Post = {
    ...post,
    status: "queued",
    createdAt: now,
    updatedAt: now,
  };

  const inserted = await postsCollection.insertOne(
    newPost as unknown as Post
  );

  return inserted.insertedId.toString();
}

async function updatePostStatus(
  postId: string,
  status: Post["status"]
): Promise<void> {
  "use step";

  const postsCollection = db.collection<Post>(POSTS_COLLECTION);
  await postsCollection.updateOne(
    { _id: postId },
    { $set: { status, updatedAt: new Date() } }
  );
}

interface LLMResult {
  title: string;
  postBody: string;
  error?: string;
}

async function callLLMGenerate(post: Post): Promise<LLMResult> {
  "use step";

  const result = await generatePostLLM(post);

  if (result.error) {
    throw new FatalError(result.error);
  }

  return { title: result.title, postBody: result.postBody };
}

async function savePostError(
  postId: string,
  userId: string,
  error: string
): Promise<void> {
  "use step";

  const postsCollection = db.collection<Post>(POSTS_COLLECTION);
  const now = new Date();

  await postsCollection.updateOne(
    { _id: postId },
    {
      $set: {
        status: "failed" as Post["status"],
        linkedinPublishError: error,
        updatedAt: now,
      },
    }
  );

  const notificationsCollection =
    db.collection<Notification>(NOTIFICATIONS_COLLECTION);
  await notificationsCollection.insertOne({
    _id: randomBytes(16).toString("hex"),
    userId,
    type: "generation_failure",
    title: "Post generation failed",
    message: error.length > 120 ? error.slice(0, 120) + "…" : error,
    href: "/dash/history",
    postId,
    status: "active",
    createdAt: now,
  } as unknown as Notification);
}

async function savePostResult(postId: string, result: LLMResult): Promise<void> {
  "use step";

  const postsCollection = db.collection<Post>(POSTS_COLLECTION);
  const now = new Date();

  const post = await postsCollection.findOne({ _id: postId });
  if (!post) {
    throw new FatalError(`Post ${postId} not found in database`);
  }

  const hashtags = result.postBody
    .split("\n")
    .filter((line) => line.trim().startsWith("#"))
    .flatMap((line) =>
      line
        .split(/\s+/)
        .filter((word) => word.startsWith("#"))
        .map((tag) => tag.replace(/^#+/, ""))
    );

  

  await postsCollection.updateOne(
    { _id: postId },
    {
      $set: {
        title: result.title,
        postBody: result.postBody,
        hashtags,
        status: "draft",
        updatedAt: now,
      },
      $push: {
        history: {
          title: result.title,
          body: result.postBody,
          changedAt: now,
        },
      },
    }
  );

  const usersCollection = db.collection<User>(USERS_COLLECTION);
  await usersCollection.updateOne(
    { _id: post.userId },
    {
      $inc: {
        credits: -1,
        postsGenerated: 1,
        totalCreditsUsed: 1,
      },
      $set: { updatedAt: now },
    }
  );

  const notificationsCollection =
    db.collection<Notification>(NOTIFICATIONS_COLLECTION);
  await notificationsCollection.insertOne({
    _id: randomBytes(16).toString("hex"),
    userId: post.userId,
    type: "generation_success",
    title: "Draft ready",
    message: `"${result.title || "Untitled post"}" has been generated as a draft.`,
    href: "/dash/history",
    postId,
    status: "active",
    createdAt: now,
  } as unknown as Notification);
}

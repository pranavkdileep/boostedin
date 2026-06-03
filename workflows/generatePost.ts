import { FatalError } from "workflow";

import { generatePost as generatePostLLM } from "@/actions/llm/generatePost";
import { db } from "@/lib/db/db";
import type { Post } from "@/lib/types/post";

const POSTS_COLLECTION = "posts";

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
}

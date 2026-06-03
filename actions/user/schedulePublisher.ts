"use server";

import { db } from "@/lib/db/db";
import type { Post } from "@/lib/types/post";

const POSTS_COLLECTION = "posts";

export async function publishDueScheduledPosts(): Promise<{ publishedCount: number }> {
  const now = new Date();
  const postsCollection = db.collection<Post>(POSTS_COLLECTION);

  const duePosts = await postsCollection
    .find({
      status: "scheduled",
      isScheduled: true,
      scheduledAt: { $lte: now },
    })
    .toArray();

  let publishedCount = 0;

  for (const post of duePosts) {
    const claimed = await postsCollection.findOneAndUpdate(
      {
        _id: post._id,
        status: "scheduled",
      },
      {
        $set: {
          status: "publishing",
          updatedAt: now,
        },
      }
    );

    if (!claimed) {
      continue;
    }

    const { publishPostWorkflow } = await import("@/workflows/publishPost");
    const { start } = await import("workflow/api");

    await start(publishPostWorkflow, [post._id]);

    publishedCount += 1;
  }

  return { publishedCount };
}

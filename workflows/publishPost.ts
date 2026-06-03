import { FatalError, fetch } from "workflow";

import { decrypt } from "@/actions/security/aes";
import { publishToLinkedin } from "@/actions/linkedin/post";
import { db } from "@/lib/db/db";
import type { Post } from "@/lib/types/post";
import type { User } from "@/lib/types/user";

const USERS_COLLECTION = "users";
const POSTS_COLLECTION = "posts";

export async function publishPostWorkflow(postId: string) {
  "use workflow";

  await updatePostStatus(postId, "publishing");

  try {
    const token = await fetchAndDecryptToken(postId);
    const post = await getPostById(postId);

    const commentary = buildCommentary(post.title, post.postBody);

    const result = await publishToLinkedin(
      commentary,
      post.coverImageUrl,
      token,
      fetch
    );

    await savePublishResult(postId, result);
  } catch (err) {
    await savePublishError(
      postId,
      err instanceof Error ? err.message : "Publishing failed"
    );
  }
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

async function fetchAndDecryptToken(postId: string): Promise<string> {
  "use step";

  const postsCollection = db.collection<Post>(POSTS_COLLECTION);
  const post = await postsCollection.findOne({ _id: postId });

  if (!post) {
    throw new FatalError(`Post ${postId} not found in database`);
  }

  const usersCollection = db.collection<User>(USERS_COLLECTION);
  const user = await usersCollection.findOne({ _id: post.userId });

  if (!user) {
    throw new FatalError(`User ${post.userId} not found in database`);
  }

  if (!user.linkedin.postingAccessToken) {
    throw new FatalError(
      "No LinkedIn posting token found. Grant posting access in Settings first."
    );
  }

  if (
    user.linkedin.postingTokenExpiresAt &&
    new Date(user.linkedin.postingTokenExpiresAt).getTime() <= Date.now()
  ) {
    throw new FatalError(
      "LinkedIn posting token has expired. Reconnect in Settings."
    );
  }

  try {
    return decrypt(user.linkedin.postingAccessToken);
  } catch {
    throw new FatalError("Failed to decrypt LinkedIn posting token");
  }
}

async function getPostById(postId: string): Promise<Post> {
  "use step";

  const postsCollection = db.collection<Post>(POSTS_COLLECTION);
  const post = await postsCollection.findOne({ _id: postId });

  if (!post) {
    throw new FatalError(`Post ${postId} not found in database`);
  }

  return post as Post;
}

function buildCommentary(title: string, postBody: string): string {
  return title ? `${title}\n\n${postBody}` : postBody;
}

async function savePublishError(
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

async function savePublishResult(
  postId: string,
  result: { linkedinPostId: string; linkedinPostUrl: string }
): Promise<void> {
  "use step";

  const postsCollection = db.collection<Post>(POSTS_COLLECTION);
  const now = new Date();

  await postsCollection.updateOne(
    { _id: postId },
    {
      $set: {
        status: "published" as Post["status"],
        linkedinPostId: result.linkedinPostId,
        linkedinPostUrl: result.linkedinPostUrl,
        publishedAt: now,
        updatedAt: now,
      },
    }
  );
}

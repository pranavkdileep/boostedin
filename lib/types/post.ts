export type PostStatus =
  | "queued"
  | "processing"
  | "draft"
  | "scheduled"
  | "publishing"
  | "published"
  | "failed";

export interface PostHistoryEntry {
  title: string;
  body: string;
  changedAt: Date;
}

export interface Post {
  _id: string;

  userId: string;

  coverImageUrl?: string;
  title: string;
  postBody: string;

  status: PostStatus;
  isScheduled: boolean;
  scheduledAt?: Date;
  publishedAt?: Date;

  linkedinPostId?: string;
  linkedinPostUrl?: string;
  linkedinPublishError?: string;

  hashtags: string[];
  tone?: string;
  category?: string;
  prompt?: string;

  engagement: {
    impressions: number;
    reactions: number;
    comments: number;
    reposts: number;
  };

  history: PostHistoryEntry[];

  createdAt: Date;
  updatedAt: Date;
}

"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import {
  getHistory,
  getHistoryPost,
  updateHistoryPost,
  deleteHistoryPost,
  duplicateHistoryPost,
  republishHistoryPost,
  rescheduleHistoryPost,
  type HistoryListItem,
  type HistoryPostDetail,
  type GetHistoryResult,
} from "@/actions/user/history";
import { getGenerationStatus } from "@/actions/user/aiGeneration";
import type { PostStatus } from "@/lib/types/post";

type StatusFilter = PostStatus | "all";

export default function HistoryContent({
  initialPosts,
  initialTotal,
  initialPage,
  initialTotalPages,
}: {
  initialPosts: HistoryListItem[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
}) {
  const [posts, setPosts] = useState<HistoryListItem[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [expandedPost, setExpandedPost] = useState<HistoryPostDetail | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<HistoryPostDetail | null>(
    null
  );
  const [republishingId, setRepublishingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState("");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPosts = useCallback(
    async (filters: {
      status?: StatusFilter;
      search?: string;
      page?: number;
    }) => {
      setLoading(true);
      try {
        const result: GetHistoryResult = await getHistory(filters);
        setPosts(result.posts);
        setTotal(result.total);
        setPage(result.page);
        setTotalPages(result.totalPages);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => {
        void fetchPosts({ status: statusFilter, search: value, page: 1 });
      }, 400);
    },
    [statusFilter, fetchPosts]
  );

  const handleFilterChange = useCallback(
    (status: StatusFilter) => {
      setStatusFilter(status);
      void fetchPosts({ status, search, page: 1 });
    },
    [search, fetchPosts]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      void fetchPosts({ status: statusFilter, search, page: newPage });
    },
    [statusFilter, search, fetchPosts]
  );

  const handleExpand = useCallback(async (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      setExpandedPost(null);
      return;
    }
    try {
      const detail = await getHistoryPost(postId);
      setExpandedPostId(postId);
      setExpandedPost(detail);
    } catch {
      setActionMessage("Failed to load post details");
      setTimeout(() => setActionMessage(""), 3000);
    }
  }, [expandedPostId]);

  const handleDelete = useCallback(
    async (postId: string) => {
      try {
        await deleteHistoryPost(postId);
        setPosts((prev) => prev.filter((p) => p._id !== postId));
        if (expandedPostId === postId) {
          setExpandedPostId(null);
          setExpandedPost(null);
        }
        setDeletingId(null);
        setActionMessage("Post deleted");
        setTimeout(() => setActionMessage(""), 3000);
      } catch (err) {
        setActionMessage(
          err instanceof Error ? err.message : "Failed to delete post"
        );
        setTimeout(() => setActionMessage(""), 3000);
      }
    },
    [expandedPostId]
  );

  const handleDuplicate = useCallback(
    async (postId: string) => {
      try {
        await duplicateHistoryPost(postId);
        setActionMessage("Post duplicated as draft");
        setTimeout(() => setActionMessage(""), 3000);
        await fetchPosts({ status: statusFilter, search, page });
      } catch (err) {
        setActionMessage(
          err instanceof Error ? err.message : "Failed to duplicate post"
        );
        setTimeout(() => setActionMessage(""), 3000);
      }
    },
    [fetchPosts, statusFilter, search, page]
  );

  const handleRepublish = useCallback(
    async (postId: string) => {
      setRepublishingId(postId);
      setActionMessage("");
      try {
        await republishHistoryPost(postId);

        const poll = async () => {
          const status = await getGenerationStatus(postId);
          if (status.status === "published") {
            setRepublishingId(null);
            setActionMessage("Post republished successfully");
            setTimeout(() => setActionMessage(""), 3000);
            await fetchPosts({ status: statusFilter, search, page });
            return;
          }
          if (status.status === "failed") {
            setRepublishingId(null);
            setActionMessage(status.error ?? "Republishing failed");
            setTimeout(() => setActionMessage(""), 5000);
            await fetchPosts({ status: statusFilter, search, page });
            return;
          }
          setTimeout(poll, 2000);
        };

        setTimeout(poll, 1000);
      } catch (err) {
        setRepublishingId(null);
        setActionMessage(
          err instanceof Error ? err.message : "Failed to start republish"
        );
        setTimeout(() => setActionMessage(""), 3000);
      }
    },
    [fetchPosts, statusFilter, search, page]
  );

  const handleRescheduleSave = useCallback(
    async (postId: string, scheduledAt: string | null) => {
      try {
        await rescheduleHistoryPost(postId, scheduledAt);
        setReschedulingId(null);
        setActionMessage(
          scheduledAt ? "Post scheduled" : "Schedule removed"
        );
        setTimeout(() => setActionMessage(""), 3000);
        await fetchPosts({ status: statusFilter, search, page });
      } catch (err) {
        setActionMessage(
          err instanceof Error ? err.message : "Failed to reschedule"
        );
        setTimeout(() => setActionMessage(""), 3000);
      }
    },
    [fetchPosts, statusFilter, search, page]
  );

  const handleEditSave = useCallback(
    async (
      postId: string,
      input: { title?: string; postBody?: string; hashtags?: string[] }
    ) => {
      try {
        const updated = await updateHistoryPost(postId, input);
        setEditingPost(null);
        setExpandedPost(updated);
        setActionMessage("Post updated");
        setTimeout(() => setActionMessage(""), 3000);
        await fetchPosts({ status: statusFilter, search, page });
      } catch (err) {
        setActionMessage(
          err instanceof Error ? err.message : "Failed to update post"
        );
        setTimeout(() => setActionMessage(""), 3000);
      }
    },
    [fetchPosts, statusFilter, search, page]
  );

  return (
    <div className="space-y-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(
            [
              "all",
              "draft",
              "published",
              "scheduled",
              "publishing",
              "failed",
            ] as StatusFilter[]
          ).map((status) => (
            <button
              key={status}
              className={`rounded-xl px-4 py-1.5 font-label-md text-label-md transition-all ${
                statusFilter === status
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
              type="button"
              onClick={() => handleFilterChange(status)}
            >
              {status === "all" ? "All" : capitalize(status)}
            </button>
          ))}
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            className="w-full rounded-xl border border-outline-variant/30 bg-surface py-2 pl-9 pr-4 font-body-md text-body-md text-on-surface outline-none transition-all placeholder:text-on-surface-variant/70 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-72"
            placeholder="Search posts..."
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {actionMessage && (
        <div className="rounded-xl border border-primary-container bg-primary-container/20 px-4 py-2 font-label-md text-label-md text-primary">
          {actionMessage}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            {search
              ? "No posts match your search."
              : "No posts yet. Generate your first post on the dashboard."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post._id}
              className="rounded-[20px] border border-outline-variant/10 bg-surface-container-lowest p-md shadow-[0_2px_12px_rgba(10,102,194,0.04)]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={post.status} />
                    {post.isScheduled && post.scheduledAt && (
                      <span className="font-label-sm text-label-sm text-amber-600">
                        Scheduled{" "}
                        {new Date(post.scheduledAt).toLocaleDateString()}
                      </span>
                    )}
                    {republishingId === post._id && (
                      <span className="flex items-center gap-1 font-label-sm text-label-sm text-primary">
                        <LoadingSpinnerSmall /> Republishing...
                      </span>
                    )}
                  </div>

                  <h3 className="mb-1 font-headline-sm text-headline-sm text-on-surface">
                    {post.title || "Untitled"}
                  </h3>

                  {post.prompt && (
                    <p className="mb-2 line-clamp-2 font-body-sm text-body-sm text-on-surface-variant">
                      {post.prompt}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-on-surface-variant/70">
                    <span className="font-label-xs text-label-xs">
                      {formatDate(post.createdAt)}
                    </span>
                    {post.tone && (
                      <span className="font-label-xs text-label-xs">
                        {post.tone}
                      </span>
                    )}
                    {post.hashtags.length > 0 && (
                      <span className="font-label-xs text-label-xs">
                        {post.hashtags.slice(0, 3).join(", ")}
                        {post.hashtags.length > 3 &&
                          ` +${post.hashtags.length - 3}`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    className="flex items-center gap-1 rounded-lg bg-surface-container px-3 py-1.5 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container-high"
                    type="button"
                    onClick={() => handleExpand(post._id)}
                  >
                    <EyeIcon className="h-3.5 w-3.5" />
                    {expandedPostId === post._id ? "Close" : "View"}
                  </button>
                  <button
                    className="flex items-center gap-1 rounded-lg bg-surface-container px-3 py-1.5 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container-high"
                    type="button"
                    onClick={() => setEditingPost(post as HistoryPostDetail)}
                  >
                    <EditIcon className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    className="flex items-center gap-1 rounded-lg bg-surface-container px-3 py-1.5 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container-high"
                    type="button"
                    onClick={() => handleDuplicate(post._id)}
                  >
                    <DuplicateIcon className="h-3.5 w-3.5" />
                    Duplicate
                  </button>
                  {(post.status === "draft" ||
                    post.status === "published" ||
                    post.status === "failed") &&
                    republishingId !== post._id && (
                      <button
                        className="flex items-center gap-1 rounded-lg bg-primary-container/20 px-3 py-1.5 font-label-sm text-label-sm text-primary transition-colors hover:bg-primary-container/30"
                        type="button"
                        onClick={() => handleRepublish(post._id)}
                      >
                        <PublishIcon className="h-3.5 w-3.5" />
                        Republish
                      </button>
                    )}
                  <button
                    className="flex items-center gap-1 rounded-lg bg-surface-container px-3 py-1.5 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container-high"
                    type="button"
                    onClick={() => setReschedulingId(post._id)}
                  >
                    <CalendarIcon className="h-3.5 w-3.5" />
                    Schedule
                  </button>
                  <button
                    className="flex items-center gap-1 rounded-lg bg-error-container/20 px-3 py-1.5 font-label-sm text-label-sm text-error transition-colors hover:bg-error-container/30"
                    type="button"
                    onClick={() => setDeletingId(post._id)}
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>

              {expandedPostId === post._id && expandedPost && (
                <div className="mt-4 border-t border-outline-variant/10 pt-4">
                  {expandedPost.coverImageUrl && (
                    <div className="relative mb-3 h-48 w-full overflow-hidden rounded-xl bg-surface-container">
                      <Image
                        alt="Cover"
                        className="object-cover"
                        fill
                        src={expandedPost.coverImageUrl}
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Title:
                      </span>
                      <p className="font-body-md text-body-md text-on-surface">
                        {expandedPost.title || "(empty)"}
                      </p>
                    </div>
                    <div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Body:
                      </span>
                      <p className="whitespace-pre-wrap font-body-md text-body-md text-on-surface">
                        {expandedPost.postBody || "(empty)"}
                      </p>
                    </div>
                    {expandedPost.history.length > 0 && (
                      <div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          Edit history:
                        </span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          {expandedPost.history.length} edits
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && total > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Page {page} of {totalPages} ({total} posts)
          </p>
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-outline-variant/30 px-3 py-1.5 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-40"
              disabled={page <= 1}
              type="button"
              onClick={() => handlePageChange(page - 1)}
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const pageNum = start + i;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  className={`rounded-lg px-3 py-1.5 font-label-sm text-label-sm transition-colors ${
                    pageNum === page
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:bg-surface-container"
                  }`}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className="rounded-lg border border-outline-variant/30 px-3 py-1.5 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-40"
              disabled={page >= totalPages}
              type="button"
              onClick={() => handlePageChange(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {deletingId && (
        <Modal onClose={() => setDeletingId(null)}>
          <h3 className="mb-2 font-headline-md text-headline-md text-on-background">
            Delete Post
          </h3>
          <p className="mb-6 font-body-md text-body-md text-on-surface-variant">
            Are you sure you want to delete this post? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              className="rounded-xl border border-outline-variant px-4 py-2 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container"
              type="button"
              onClick={() => setDeletingId(null)}
            >
              Cancel
            </button>
            <button
              className="rounded-xl bg-error px-4 py-2 font-label-md text-label-md font-bold text-on-error transition-colors hover:bg-error/80"
              type="button"
              onClick={() => handleDelete(deletingId)}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}

      {reschedulingId && (
        <RescheduleModal
          currentScheduledAt={
            posts.find((p) => p._id === reschedulingId)?.scheduledAt
              ? new Date(
                  posts.find((p) => p._id === reschedulingId)!.scheduledAt!
                )
              : undefined
          }
          onClose={() => setReschedulingId(null)}
          onSave={(date) => handleRescheduleSave(reschedulingId, date)}
        />
      )}

      {editingPost && (
        <EditModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSave={(input) => handleEditSave(editingPost._id, input)}
        />
      )}
    </div>
  );
}

function EditModal({
  post,
  onClose,
  onSave,
}: {
  post: HistoryPostDetail;
  onClose: () => void;
  onSave: (input: {
    title?: string;
    postBody?: string;
    hashtags?: string[];
  }) => void;
}) {
  const [title, setTitle] = useState(post.title);
  const [postBody, setPostBody] = useState(post.postBody);
  const [hashtagsStr, setHashtagsStr] = useState(post.hashtags.join(", "));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const hashtags = hashtagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    await onSave({ title, postBody, hashtags });
    setSaving(false);
  };

  return (
    <Modal onClose={onClose}>
      <h3 className="mb-4 font-headline-md text-headline-md text-on-background">
        Edit Post
      </h3>
      <div className="space-y-3">
        <input
          className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-2 font-body-md text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="Title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="min-h-40 w-full resize-none rounded-xl border border-outline-variant bg-surface-container-low px-4 py-2 font-body-md text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="Post body"
          value={postBody}
          onChange={(e) => setPostBody(e.target.value)}
        />
        <input
          className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-2 font-body-md text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="Hashtags (comma-separated)"
          type="text"
          value={hashtagsStr}
          onChange={(e) => setHashtagsStr(e.target.value)}
        />
      </div>
      <div className="mt-4 flex justify-end gap-3">
        <button
          className="rounded-xl border border-outline-variant px-4 py-2 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container"
          type="button"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="rounded-xl bg-primary px-4 py-2 font-label-md text-label-md font-bold text-on-primary transition-colors hover:bg-primary-container disabled:opacity-50"
          disabled={saving}
          type="button"
          onClick={handleSave}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </Modal>
  );
}

function RescheduleModal({
  currentScheduledAt,
  onClose,
  onSave,
}: {
  currentScheduledAt?: Date;
  onClose: () => void;
  onSave: (date: string | null) => void;
}) {
  const [dateStr, setDateStr] = useState(() => {
    if (currentScheduledAt) {
      const d = new Date(currentScheduledAt);
      const local = new Date(
        d.getTime() - d.getTimezoneOffset() * 60000
      );
      return local.toISOString().slice(0, 16);
    }
    return "";
  });

  return (
    <Modal onClose={onClose}>
      <h3 className="mb-4 font-headline-md text-headline-md text-on-background">
        {currentScheduledAt ? "Reschedule Post" : "Schedule Post"}
      </h3>
      <div className="space-y-3">
        <input
          className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-2 font-body-md text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          type="datetime-local"
          value={dateStr}
          onChange={(e) => setDateStr(e.target.value)}
        />
      </div>
      <div className="mt-4 flex justify-end gap-3">
        {currentScheduledAt && (
          <button
            className="rounded-xl border border-outline-variant px-4 py-2 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container"
            type="button"
            onClick={() => onSave(null)}
          >
            Remove Schedule
          </button>
        )}
        <button
          className="rounded-xl border border-outline-variant px-4 py-2 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container"
          type="button"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="rounded-xl bg-primary px-4 py-2 font-label-md text-label-md font-bold text-on-primary transition-colors hover:bg-primary-container disabled:opacity-50"
          disabled={!dateStr}
          type="button"
          onClick={() => onSave(dateStr)}
        >
          {currentScheduledAt ? "Update Schedule" : "Schedule"}
        </button>
      </div>
    </Modal>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-[24px] border border-outline-variant/10 bg-surface-container-lowest p-md shadow-[0_8px_32px_rgba(0,0,0,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: PostStatus }) {
  const colors: Record<PostStatus, string> = {
    queued: "bg-amber-100 text-amber-700",
    processing: "bg-blue-100 text-blue-700",
    draft: "bg-amber-100 text-amber-700",
    scheduled: "bg-purple-100 text-purple-700",
    publishing: "bg-blue-100 text-blue-700",
    published: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 font-label-xs text-label-xs ${colors[status]}`}
    >
      {capitalize(status)}
    </span>
  );
}

function LoadingSpinner() {
  return (
    <svg
      aria-hidden="true"
      className="h-8 w-8 animate-spin text-primary"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth={4}
      />
      <path
        className="opacity-75"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LoadingSpinnerSmall() {
  return (
    <svg
      aria-hidden="true"
      className="inline h-3.5 w-3.5 animate-spin text-primary"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth={4}
      />
      <path
        className="opacity-75"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatDate(date: Date) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

type IconProps = { className?: string };

function BaseIcon({
  children,
  className,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  );
}

function SearchIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </BaseIcon>
  );
}

function EyeIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </BaseIcon>
  );
}

function EditIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </BaseIcon>
  );
}

function DuplicateIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect height="14" rx="2" ry="2" width="14" x="8" y="8" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </BaseIcon>
  );
}

function PublishIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </BaseIcon>
  );
}

function CalendarIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect height="18" rx="2" width="18" x="3" y="4" />
      <path d="M3 10h18" />
    </BaseIcon>
  );
}

function TrashIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </BaseIcon>
  );
}

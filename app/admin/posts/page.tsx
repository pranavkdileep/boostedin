"use client";

import { useState, useEffect } from "react";
import { getAllPosts, getPostStats, deletePost } from "@/actions/admin/posts";
import type { AdminPostItem, PostStats } from "@/actions/admin/posts";
import type { PostStatus } from "@/lib/types/post";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
  failed: "Failed",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "text-gray-600 bg-gray-100 border-gray-200",
  scheduled: "text-blue-700 bg-blue-50 border-blue-200",
  published: "text-green-700 bg-green-50 border-green-200",
  failed: "text-red-700 bg-red-50 border-red-200",
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<AdminPostItem[]>([]);
  const [stats, setStats] = useState<PostStats | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<PostStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<AdminPostItem | null>(null);
  const pageSize = 15;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [result, statsData] = await Promise.all([
          getAllPosts(page, pageSize, statusFilter),
          getPostStats(),
        ]);
        if (cancelled) return;
        setPosts(result.items);
        setTotalPages(result.totalPages);
        setTotal(result.total);
        setStats(statsData);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [page, statusFilter]);

  async function handleDelete(postId: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      if (selectedPost?._id === postId) {
        setSelectedPost(null);
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["all", "draft", "scheduled", "published", "failed"] as const).map(
          (s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 font-label-sm text-label-sm transition-colors ${
                statusFilter === s
                  ? "bg-secondary text-on-secondary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
              type="button"
            >
              {s === "all" ? "All" : STATUS_LABELS[s]}
              {stats && s !== "all" && ` (${stats[s]})`}
            </button>
          )
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <svg
            className="animate-spin h-8 w-8 text-secondary"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
            />
          </svg>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-surface-container-high bg-surface-container-lowest p-8 text-center">
          <p className="text-on-surface-variant">No posts found.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-surface-container-high bg-surface-container-lowest shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-low">
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant">Title</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant hidden md:table-cell">Author</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant">Status</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant hidden sm:table-cell">Scheduled</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant">Created</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post._id}
                    className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors cursor-pointer"
                    onClick={() => setSelectedPost(post)}
                  >
                    <td className="p-3 font-label-md text-label-md text-on-surface truncate max-w-[220px]">
                      {post.title}
                    </td>
                    <td className="p-3 font-label-sm text-label-sm text-on-surface-variant truncate max-w-[160px] hidden md:table-cell">
                      {post.authorEmail}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[post.status] ?? ""}`}
                      >
                        {STATUS_LABELS[post.status] ?? post.status}
                      </span>
                    </td>
                    <td className="p-3 font-label-sm text-label-sm text-on-surface-variant hidden sm:table-cell">
                      {post.isScheduled && post.scheduledAt
                        ? new Date(post.scheduledAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-3 font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPost(post);
                        }}
                        className="text-secondary hover:text-secondary/80 font-label-sm text-label-sm"
                        type="button"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-outline-variant/10 px-4 py-3">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {total} post{total !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg px-3 py-1.5 font-label-sm text-label-sm bg-surface-container text-on-surface-variant hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                type="button"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg px-3 py-1.5 font-label-sm text-label-sm bg-surface-container text-on-surface-variant hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                type="button"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_8px_32px_rgba(0,0,0,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-headline-md text-headline-md text-on-background">
                  {selectedPost.title}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-3 font-label-sm text-label-sm text-on-surface-variant">
                  <span>By {selectedPost.authorName} ({selectedPost.authorEmail})</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[selectedPost.status] ?? ""}`}
                  >
                    {STATUS_LABELS[selectedPost.status]}
                  </span>
                  {selectedPost.isScheduled && selectedPost.scheduledAt && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Scheduled: {new Date(selectedPost.scheduledAt).toLocaleDateString()}</span>
                    </>
                  )}
                  {selectedPost.status === "published" && selectedPost.publishedAt && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Published: {new Date(selectedPost.publishedAt).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
              <button
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-outline transition-colors hover:bg-surface-container hover:text-on-background"
                onClick={() => setSelectedPost(null)}
                type="button"
                aria-label="Close"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-2">Content</p>
              <div className="rounded-xl bg-surface p-4">
                <p className="whitespace-pre-wrap font-body-md text-body-md text-on-surface">
                  {selectedPost.postBody}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleDelete(selectedPost._id)}
              className="rounded-lg bg-error/10 text-error px-4 py-2 font-label-md text-label-md hover:bg-error/20 transition-colors"
              type="button"
            >
              Delete Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

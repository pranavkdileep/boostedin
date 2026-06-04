"use client";

import { useState, useEffect } from "react";
import {
  getAllUsers,
  getUserById,
  updateUserCredits,
  deleteUser,
} from "@/actions/admin/users";
import type { AdminUserItem } from "@/actions/admin/users";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUserItem & { postsCount?: number } | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditMessage, setCreditMessage] = useState<string | null>(null);
  const pageSize = 15;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const result = await getAllUsers(page, pageSize);
        if (cancelled) return;
        setUsers(result.items);
        setTotalPages(result.totalPages);
        setTotal(result.total);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [page]);

  async function handleUserDetail(userId: string) {
    try {
      const detail = await getUserById(userId);
      setSelectedUser(detail);
      setCreditAmount("");
      setCreditMessage(null);
    } catch {
      // ignore
    }
  }

  async function handleCreditAdjust(userId: string, delta: number) {
    try {
      await updateUserCredits(userId, delta);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, credits: u.credits + delta } : u
        )
      );
      if (selectedUser?._id === userId) {
        setSelectedUser((prev) =>
          prev ? { ...prev, credits: prev.credits + delta } : null
        );
      }
      setCreditMessage(
        delta >= 0
          ? `Added ${delta} credits`
          : `Removed ${Math.abs(delta)} credits`
      );
      setTimeout(() => setCreditMessage(null), 2000);
    } catch {
      setCreditMessage("Failed to update credits");
      setTimeout(() => setCreditMessage(null), 2000);
    }
  }

  async function handleDelete(userId: string) {
    if (
      !confirm(
        "Are you sure you want to delete this user and all their posts? This cannot be undone."
      )
    )
      return;
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setSelectedUser(null);
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-4">
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
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-surface-container-high bg-surface-container-lowest p-8 text-center">
          <p className="text-on-surface-variant">No users found.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-surface-container-high bg-surface-container-lowest shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-low">
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant">Name</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant hidden sm:table-cell">Email</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant">Credits</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant hidden md:table-cell">Posts</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant hidden md:table-cell">LinkedIn</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant">Joined</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors cursor-pointer"
                    onClick={() => handleUserDetail(user._id)}
                  >
                    <td className="p-3 font-label-md text-label-md text-on-surface truncate max-w-[160px]">
                      {user.name}
                    </td>
                    <td className="p-3 font-label-sm text-label-sm text-on-surface-variant truncate max-w-[180px] hidden sm:table-cell">
                      {user.email}
                    </td>
                    <td className="p-3 font-label-md text-label-md text-on-surface">
                      {user.credits}
                    </td>
                    <td className="p-3 font-label-sm text-label-sm text-on-surface-variant hidden md:table-cell">
                      {user.postsGenerated}
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          user.linkedinConnected
                            ? "text-green-700 bg-green-50"
                            : "text-gray-500 bg-gray-100"
                        }`}
                      >
                        {user.linkedinConnected ? "Connected" : "Disconnected"}
                      </span>
                    </td>
                    <td className="p-3 font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserDetail(user._id);
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
              {total} user{total !== 1 ? "s" : ""}
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

      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_8px_32px_rgba(0,0,0,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-headline-md text-headline-md text-on-background">
                  {selectedUser.name}
                </h2>
                <p className="mt-1 truncate font-body-md text-body-md text-on-surface-variant">
                  {selectedUser.email}
                </p>
              </div>
              <button
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-outline transition-colors hover:bg-surface-container hover:text-on-background"
                onClick={() => setSelectedUser(null)}
                type="button"
                aria-label="Close"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-2 mb-6">
              <p className="font-body-md text-body-md text-on-surface">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Credits: </span>
                <span>{selectedUser.credits}</span>
              </p>
              <p className="font-body-md text-body-md text-on-surface">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Total Used: </span>
                <span>{selectedUser.totalCreditsUsed}</span>
              </p>
              <p className="font-body-md text-body-md text-on-surface">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Total Purchased: </span>
                <span>{selectedUser.totalCreditsPurchased}</span>
              </p>
              <p className="font-body-md text-body-md text-on-surface">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Posts Generated: </span>
                <span>{selectedUser.postsGenerated}</span>
              </p>
              {selectedUser.postsCount !== undefined && (
                <p className="font-body-md text-body-md text-on-surface">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Total Posts in DB: </span>
                  <span>{selectedUser.postsCount}</span>
                </p>
              )}
              <p className="font-body-md text-body-md text-on-surface">
                <span className="font-label-sm text-label-sm text-on-surface-variant">LinkedIn: </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    selectedUser.linkedinConnected
                      ? "text-green-700 bg-green-50"
                      : "text-gray-500 bg-gray-100"
                  }`}
                >
                  {selectedUser.linkedinConnected ? "Connected" : "Disconnected"}
                </span>
              </p>
            </div>

            <div className="border-t border-outline-variant/20 pt-4 mb-4">
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-2">
                Adjust Credits
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  placeholder="Amount"
                  className="h-10 flex-1 rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-3 font-body-md text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() =>
                    handleCreditAdjust(
                      selectedUser._id,
                      parseInt(creditAmount) || 0
                    )
                  }
                  className="flex-1 rounded-lg bg-green-600 text-white px-3 py-2 font-label-sm text-label-sm hover:bg-green-700 transition-colors"
                  type="button"
                >
                  Add
                </button>
                <button
                  onClick={() =>
                    handleCreditAdjust(
                      selectedUser._id,
                      -(parseInt(creditAmount) || 0)
                    )
                  }
                  className="flex-1 rounded-lg bg-orange-600 text-white px-3 py-2 font-label-sm text-label-sm hover:bg-orange-700 transition-colors"
                  type="button"
                >
                  Remove
                </button>
              </div>
              {creditMessage && (
                <p className="mt-1 font-label-sm text-label-sm text-green-600">
                  {creditMessage}
                </p>
              )}
            </div>

            <button
              onClick={() => handleDelete(selectedUser._id)}
              className="w-full rounded-lg bg-error/10 text-error px-4 py-2 font-label-md text-label-md hover:bg-error/20 transition-colors"
              type="button"
            >
              Delete User & All Posts
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

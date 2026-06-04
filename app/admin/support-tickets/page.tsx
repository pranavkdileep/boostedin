"use client";

import { useState, useEffect } from "react";
import {
  getAllTickets,
  getTicketStats,
  updateTicketStatus,
  deleteTicket,
} from "@/actions/admin/supportTickets";
import type { AdminTicketItem, TicketStats } from "@/actions/admin/supportTickets";
import type { TicketStatus } from "@/lib/types/supportTicket";

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const STATUS_COLORS: Record<string, string> = {
  open: "text-yellow-700 bg-yellow-50 border-yellow-200",
  in_progress: "text-blue-700 bg-blue-50 border-blue-200",
  resolved: "text-green-700 bg-green-50 border-green-200",
  closed: "text-gray-600 bg-gray-100 border-gray-200",
};

export default function AdminSupportTicketsPage() {
  const [tickets, setTickets] = useState<AdminTicketItem[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<AdminTicketItem | null>(null);
  const pageSize = 15;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [result, statsData] = await Promise.all([
          getAllTickets(page, pageSize, statusFilter),
          getTicketStats(),
        ]);
        if (cancelled) return;
        setTickets(result.items);
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

  async function handleStatusChange(
    ticketId: string,
    newStatus: TicketStatus
  ) {
    try {
      await updateTicketStatus(ticketId, newStatus);
      setTickets((prev) =>
        prev.map((t) =>
          t._id === ticketId ? { ...t, status: newStatus } : t
        )
      );
      if (selectedTicket?._id === ticketId) {
        setSelectedTicket((prev) =>
          prev ? { ...prev, status: newStatus } : null
        );
      }
    } catch {
      // ignore
    }
  }

  async function handleDelete(ticketId: string) {
    if (!confirm("Are you sure you want to delete this ticket?")) return;
    try {
      await deleteTicket(ticketId);
      setTickets((prev) => prev.filter((t) => t._id !== ticketId));
      if (selectedTicket?._id === ticketId) {
        setSelectedTicket(null);
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["all", "open", "in_progress", "resolved", "closed"] as const).map(
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
      ) : tickets.length === 0 ? (
        <div className="rounded-xl border border-surface-container-high bg-surface-container-lowest p-8 text-center">
          <p className="text-on-surface-variant">No tickets found.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-surface-container-high bg-surface-container-lowest shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-low">
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant">Subject</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant hidden md:table-cell">Email</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant">Status</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant hidden sm:table-cell">Priority</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant">Date</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors cursor-pointer"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <td className="p-3 font-label-md text-label-md text-on-surface truncate max-w-[200px]">
                      {ticket.subject}
                    </td>
                    <td className="p-3 font-label-sm text-label-sm text-on-surface-variant truncate max-w-[180px] hidden md:table-cell">
                      {ticket.email}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[ticket.status] ?? ""}`}
                      >
                        {STATUS_LABELS[ticket.status] ?? ticket.status}
                      </span>
                    </td>
                    <td className="p-3 font-label-sm text-label-sm text-on-surface-variant capitalize hidden sm:table-cell">
                      {ticket.priority}
                    </td>
                    <td className="p-3 font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicket(ticket);
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
              {total} ticket{total !== 1 ? "s" : ""}
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

      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_8px_32px_rgba(0,0,0,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-headline-md text-headline-md text-on-background">
                  {selectedTicket.subject}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-3 font-label-sm text-label-sm text-on-surface-variant">
                  <span>From: {selectedTicket.email}</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[selectedTicket.status] ?? ""}`}
                  >
                    {STATUS_LABELS[selectedTicket.status]}
                  </span>
                  <span className="capitalize">Priority: {selectedTicket.priority}</span>
                </div>
              </div>
              <button
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-outline transition-colors hover:bg-surface-container hover:text-on-background"
                onClick={() => setSelectedTicket(null)}
                type="button"
                aria-label="Close"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Type</p>
              <p className="font-body-md text-body-md text-on-surface capitalize">{selectedTicket.type}</p>
            </div>

            <div className="mb-6">
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Description</p>
              <div className="rounded-xl bg-surface p-4">
                <p className="whitespace-pre-wrap font-body-md text-body-md text-on-surface">
                  {selectedTicket.description}
                </p>
              </div>
            </div>

            {selectedTicket.attachmentLink && (
              <div className="mb-6">
                <p className="mb-1.5 font-label-sm text-label-sm font-medium text-on-background">
                  Attachment
                </p>
                <a
                  className="inline-flex items-center gap-2 rounded-lg bg-surface px-4 py-2.5 font-label-md text-label-md text-primary underline transition-colors hover:bg-surface-container"
                  href={selectedTicket.attachmentLink}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                  </svg>
                  {selectedTicket.attachmentLink.length > 60
                    ? selectedTicket.attachmentLink.slice(0, 60) + "\u2026"
                    : selectedTicket.attachmentLink}
                </a>
              </div>
            )}

            <div className="mb-4">
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                Update Status
              </label>
              <select
                value={selectedTicket.status}
                onChange={(e) =>
                  handleStatusChange(
                    selectedTicket._id,
                    e.target.value as TicketStatus
                  )
                }
                className="h-10 w-full rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-3 font-body-md text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handleDelete(selectedTicket._id)}
              className="rounded-lg bg-error/10 text-error px-4 py-2 font-label-md text-label-md hover:bg-error/20 transition-colors"
              type="button"
            >
              Delete Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

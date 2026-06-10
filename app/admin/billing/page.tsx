"use client";

import { useState, useEffect } from "react";
import {
  getAllBillings,
  type AdminBillingItem,
} from "@/actions/admin/billing";
import type { BillingStatus } from "@/lib/types/billing";

const STATUS_FILTERS: { label: string; value: BillingStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Waiting", value: "waiting" },
  { label: "Processing", value: "waiting_for_webhook" },
  { label: "Success", value: "success" },
  { label: "Timed Out", value: "timeout" },
];

const STATUS_BADGES: Record<
  BillingStatus,
  { label: string; classes: string }
> = {
  waiting: {
    label: "Waiting",
    classes: "text-yellow-700 bg-yellow-50 border-yellow-200",
  },
  waiting_for_webhook: {
    label: "Processing",
    classes: "text-blue-700 bg-blue-50 border-blue-200",
  },
  success: {
    label: "Success",
    classes: "text-green-700 bg-green-50 border-green-200",
  },
  timeout: {
    label: "Timed Out",
    classes: "text-red-700 bg-red-50 border-red-200",
  },
};

export default function AdminBillingPage() {
  const [items, setItems] = useState<AdminBillingItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<BillingStatus | "all">(
    "all"
  );
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<AdminBillingItem | null>(
    null
  );
  const pageSize = 15;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const result = await getAllBillings(page, pageSize, statusFilter);
        if (cancelled) return;
        setItems(result.items);
        setTotalPages(result.totalPages);
        setTotal(result.total);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [page, statusFilter]);

  function handleFilterChange(value: BillingStatus | "all") {
    setStatusFilter(value);
    setPage(1);
  }

  function handleDetail(item: AdminBillingItem) {
    setSelectedItem(item);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            className={`rounded-lg px-3 py-1.5 font-label-sm text-label-sm transition-colors ${
              statusFilter === f.value
                ? "bg-secondary text-on-secondary"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            }`}
            onClick={() => handleFilterChange(f.value)}
            type="button"
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <svg
            aria-hidden="true"
            className="h-8 w-8 animate-spin text-secondary"
            fill="none"
            viewBox="0 0 24 24"
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
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-surface-container-high bg-surface-container-lowest p-8 text-center">
          <p className="text-on-surface-variant">No billing records found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-surface-container-high bg-surface-container-lowest shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-low">
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant">
                    Date
                  </th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant">
                    User
                  </th>
                  <th className="hidden p-3 font-label-sm text-label-sm text-on-surface-variant sm:table-cell">
                    Email
                  </th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant">
                    Order ID
                  </th>
                  <th className="hidden p-3 font-label-sm text-label-sm text-on-surface-variant md:table-cell">
                    Credits
                  </th>
                  <th className="hidden p-3 font-label-sm text-label-sm text-on-surface-variant md:table-cell">
                    Paid
                  </th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant">
                    Status
                  </th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.billingId}
                    className="cursor-pointer border-b border-outline-variant/10 transition-colors hover:bg-surface-container-low"
                    onClick={() => handleDetail(item)}
                  >
                    <td className="whitespace-nowrap p-3 font-label-sm text-label-sm text-on-surface-variant">
                      {formatDate(item.time)}
                    </td>
                    <td className="max-w-[160px] truncate p-3 font-label-md text-label-md text-on-surface">
                      {item.userName}
                    </td>
                    <td className="hidden max-w-[180px] truncate p-3 font-label-sm text-label-sm text-on-surface-variant sm:table-cell">
                      {item.userEmail}
                    </td>
                    <td className="p-3 font-label-sm text-label-sm text-on-surface">
                      {item.orderId}
                    </td>
                    <td className="hidden p-3 font-label-md text-label-md text-on-surface md:table-cell">
                      {formatNumber(item.amountCredited)}
                    </td>
                    <td className="hidden whitespace-nowrap p-3 font-label-md text-label-md text-on-surface md:table-cell">
                      ₹{formatNumber(item.amountPaid)}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        className="font-label-sm text-label-sm text-secondary hover:text-secondary/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDetail(item);
                        }}
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
              {total} transaction{total !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              <button
                className="rounded-lg bg-surface-container px-3 py-1.5 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                type="button"
              >
                Previous
              </button>
              <button
                className="rounded-lg bg-surface-container px-3 py-1.5 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-40"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                type="button"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_8px_32px_rgba(0,0,0,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="font-headline-md text-headline-md text-on-background">
                  Transaction Detail
                </h2>
                <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
                  Billing ID: {selectedItem.billingId}
                </p>
              </div>
              <button
                aria-label="Close"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-outline transition-colors hover:bg-surface-container hover:text-on-background"
                onClick={() => setSelectedItem(null)}
                type="button"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="mb-6 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    User Name
                  </p>
                  <p className="mt-0.5 font-body-md text-body-md text-on-surface">
                    {selectedItem.userName}
                  </p>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    User Email
                  </p>
                  <p className="mt-0.5 font-body-md text-body-md text-on-surface">
                    {selectedItem.userEmail}
                  </p>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    User ID
                  </p>
                  <p className="mt-0.5 font-body-md text-body-md text-on-surface font-mono text-xs">
                    {selectedItem.userId}
                  </p>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Order ID
                  </p>
                  <p className="mt-0.5 font-body-md text-body-md text-on-surface">
                    {selectedItem.orderId}
                  </p>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Credits Bought
                  </p>
                  <p className="mt-0.5 font-body-md text-body-md text-on-surface">
                    {formatNumber(selectedItem.amountCredited)}
                  </p>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Amount Paid
                  </p>
                  <p className="mt-0.5 font-body-md text-body-md text-on-surface">
                    ₹{formatNumber(selectedItem.amountPaid)}
                  </p>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Status
                  </p>
                  <div className="mt-0.5">
                    <StatusBadge status={selectedItem.status} />
                  </div>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Date & Time
                  </p>
                  <p className="mt-0.5 font-body-md text-body-md text-on-surface">
                    {formatDateTime(selectedItem.time)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: BillingStatus }) {
  const { label, classes } = STATUS_BADGES[status];
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${classes}`}
    >
      {label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

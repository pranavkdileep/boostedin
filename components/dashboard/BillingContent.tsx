"use client";

import { useState, useCallback } from "react";

import {
  getBillingHistory,
  type BillingHistoryItem,
  type BillingHistoryResult,
} from "@/actions/user/billing";
import type { BillingStatus } from "@/lib/types/billing";

export default function BillingContent({
  initialItems,
  initialTotal,
  initialPage,
  initialTotalPages,
}: {
  initialItems: BillingHistoryItem[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
}) {
  const [items, setItems] = useState<BillingHistoryItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchHistory = useCallback(async (newPage: number) => {
    setLoading(true);
    try {
      const result: BillingHistoryResult = await getBillingHistory(newPage);
      setItems(result.items);
      setTotal(result.total);
      setPage(result.page);
      setTotalPages(result.totalPages);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePageChange = useCallback(
    (newPage: number) => {
      void fetchHistory(newPage);
    },
    [fetchHistory]
  );

  const handleExpand = useCallback((billingId: string) => {
    setExpandedId((prev) => (prev === billingId ? null : billingId));
  }, []);

  if (!loading && items.length === 0) {
    return (
      <div className="rounded-[24px] border border-outline-variant/10 bg-surface-container-lowest p-md shadow-[0_4px_20px_rgba(10,102,194,0.05)]">
        <div className="py-12 text-center">
          <p className="font-headline-md text-headline-md font-bold text-on-background">
            No transactions yet
          </p>
          <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
            Your payment history will appear here after your first purchase.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-md">
      <div className="overflow-hidden rounded-[24px] border border-outline-variant/10 bg-surface-container-lowest shadow-[0_4px_20px_rgba(10,102,194,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/10 bg-surface-container-low">
                <th className="px-4 py-3 text-left font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
                  Order ID
                </th>
                <th className="px-4 py-3 text-right font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
                  Credits
                </th>
                <th className="px-4 py-3 text-right font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
                  Amount Paid
                </th>
                <th className="px-4 py-3 text-center font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
                  Status
                </th>
                <th className="px-4 py-3 text-center font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
                  Detail
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {items.map((item) => (
                <BillingRow
                  key={item.billingId}
                  item={item}
                  isExpanded={expandedId === item.billingId}
                  onToggle={() => handleExpand(item.billingId)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="px-4 py-3 text-center font-body-md text-body-md text-on-surface-variant">
            Loading...
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Page {page} of {totalPages} ({total} transactions)
          </p>
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-outline-variant/30 px-3 py-1.5 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              type="button"
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
                  onClick={() => handlePageChange(pageNum)}
                  type="button"
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className="rounded-lg border border-outline-variant/30 px-3 py-1.5 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-40"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BillingRow({
  item,
  isExpanded,
  onToggle,
}: {
  item: BillingHistoryItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className="cursor-pointer transition-colors hover:bg-surface-container-low"
        onClick={onToggle}
      >
        <td className="whitespace-nowrap px-4 py-3 font-body-md text-body-md text-on-surface">
          {formatDate(item.time)}
        </td>
        <td className="whitespace-nowrap px-4 py-3 font-label-md text-label-md text-on-surface-variant">
          {item.orderId}
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-right font-body-md text-body-md text-on-surface">
          {formatNumber(item.amountCredited)}
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-right font-body-md text-body-md font-semibold text-on-surface">
          ₹{formatNumber(item.amountPaid)}
        </td>
        <td className="px-4 py-3 text-center">
          <StatusBadge status={item.status} />
        </td>
        <td className="px-4 py-3 text-center">
          <button
            className="inline-flex items-center justify-center text-on-surface-variant transition-colors hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            type="button"
          >
            <ChevronIcon open={isExpanded} />
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-surface-container-low">
          <td colSpan={6} className="px-6 py-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Billing ID
                </p>
                <p className="mt-1 font-body-md text-body-md text-on-surface">
                  {item.billingId}
                </p>
              </div>
              <div>
                <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Order ID
                </p>
                <p className="mt-1 font-body-md text-body-md text-on-surface">
                  {item.orderId}
                </p>
              </div>
              <div>
                <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Credits Bought
                </p>
                <p className="mt-1 font-body-md text-body-md text-on-surface">
                  {formatNumber(item.amountCredited)}
                </p>
              </div>
              <div>
                <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Amount Paid
                </p>
                <p className="mt-1 font-body-md text-body-md text-on-surface">
                  ₹{formatNumber(item.amountPaid)}
                </p>
              </div>
              <div>
                <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Status
                </p>
                <div className="mt-1">
                  <StatusBadge status={item.status} />
                </div>
              </div>
              <div>
                <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Date
                </p>
                <p className="mt-1 font-body-md text-body-md text-on-surface">
                  {formatDateTime(item.time)}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function StatusBadge({ status }: { status: BillingStatus }) {
  const config: Record<
    BillingStatus,
    { label: string; classes: string }
  > = {
    waiting: {
      label: "Waiting for Payment",
      classes: "bg-yellow-100 text-yellow-800",
    },
    waiting_for_webhook: {
      label: "Processing",
      classes: "bg-blue-100 text-blue-800",
    },
    success: {
      label: "Success",
      classes: "bg-green-100 text-green-800",
    },
    timeout: {
      label: "Timed Out",
      classes: "bg-red-100 text-red-800",
    },
  };

  const { label, classes } = config[status];

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 font-label-sm text-label-sm font-semibold ${classes}`}
    >
      {label}
    </span>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
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

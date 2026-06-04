"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  getNotifications,
  markNotificationDone,
  markAllNotificationsDone,
} from "@/actions/user/notifications";
import type { Notification, NotificationResult } from "@/lib/types/notification";

const PAGE_SIZE = 10;

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationResult | null>(null);
  const [timeAgoMap, setTimeAgoMap] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const result = await getNotifications(p, PAGE_SIZE);
      const now = Date.now();
      const map: Record<string, string> = {};

      for (const item of result.items) {
        map[item._id] = formatTimeAgo(new Date(item.createdAt), now);
      }

      setTimeAgoMap(map);
      setData(result);
      setPage(result.page);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToggle = useCallback(() => {
    setOpen((v) => {
      const next = !v;
      if (next) {
        load(1);
      }
      return next;
    });
  }, [load]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleMarkDone = useCallback(
    async (id: string) => {
      await markNotificationDone(id);
      load(page);
    },
    [page, load],
  );

  const handleMarkAllDone = useCallback(async () => {
    await markAllNotificationsDone();
    setData(null);
    setOpen(false);
  }, []);

  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label={`Notifications (${unreadCount} unread)`}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
        onClick={handleToggle}
        type="button"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-4 top-20 z-50 mx-auto max-h-[70vh] w-[calc(100vw-2rem)] overflow-hidden rounded-[24px] border border-outline-variant/20 bg-white/95 shadow-[0_8px_40px_rgba(0,0,0,0.10)] backdrop-blur-xl md:absolute md:inset-auto md:right-0 md:top-full md:mt-3 md:w-[420px]">
          <div className="flex items-center justify-between border-b border-outline-variant/10 px-5 py-4">
            <h3 className="font-headline-md text-[18px] text-on-surface">
              Notifications
            </h3>
            {data && data.total > 0 && (
              <button
                className="rounded-lg px-3 py-1.5 font-label-sm text-label-sm text-primary transition-colors hover:bg-primary/5"
                onClick={handleMarkAllDone}
                type="button"
              >
                Mark all done
              </button>
            )}
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 120px)" }}>
            {loading && !data ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : data && data.items.length > 0 ? (
              <div className="divide-y divide-outline-variant/10">
                {data.items.map((item) => (
                  <NotificationItem
                    key={item._id}
                    notification={item}
                    timeAgo={timeAgoMap[item._id] ?? ""}
                    onMarkDone={handleMarkDone}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-container">
                  <BellIcon className="h-5 w-5 text-on-surface-variant" />
                </div>
                <p className="font-label-md text-label-md text-on-background">
                  No notifications
                </p>
                <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
                  You&apos;re all caught up.
                </p>
              </div>
            )}
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-outline-variant/10 px-5 py-3">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-30"
                disabled={page <= 1}
                onClick={() => load(page - 1)}
                type="button"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {page} of {data.totalPages}
              </span>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-30"
                disabled={page >= data.totalPages}
                onClick={() => load(page + 1)}
                type="button"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  onMarkDone,
  timeAgo,
}: {
  notification: Notification;
  onMarkDone: (id: string) => void;
  timeAgo: string;
}) {
  const icon = getNotifIcon(notification.type);

  const content = (
    <div className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-surface-container-low">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-label-md text-label-md font-semibold text-on-surface">
          {notification.title}
        </p>
        <p className="mt-0.5 line-clamp-2 font-body-md text-body-md text-on-surface-variant">
          {notification.message}
        </p>
        <p className="mt-1 font-label-sm text-label-sm text-outline">
          {timeAgo}
        </p>
      </div>
      <button
        aria-label="Mark as done"
        className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-outline opacity-0 transition-all hover:bg-surface-container hover:text-primary group-hover:opacity-100"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onMarkDone(notification._id);
        }}
        type="button"
      >
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  );

  if (notification.href) {
    return (
      <Link
        className="group block"
        href={notification.href}
        onClick={() => onMarkDone(notification._id)}
      >
        {content}
      </Link>
    );
  }

  return <div className="group">{content}</div>;
}

function getNotifIcon(type: Notification["type"]) {
  if (type === "generation_success") {
    return <SparkleIcon className="h-4 w-4 text-secondary" />;
  }

  if (type === "generation_failure") {
    return <AlertIcon className="h-4 w-4 text-error" />;
  }

  if (type === "publish_success") {
    return <CheckIcon className="h-4 w-4 text-primary" />;
  }

  if (type === "publish_failure") {
    return <AlertIcon className="h-4 w-4 text-error" />;
  }

  if (type === "post_scheduled") {
    return <ClockIcon className="h-4 w-4 text-secondary" />;
  }

  if (type === "post_unscheduled") {
    return <EditIcon className="h-4 w-4 text-on-surface-variant" />;
  }

  return <BellIcon className="h-4 w-4 text-on-surface-variant" />;
}

function formatTimeAgo(date: Date, now: number): string {
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

type IconProps = { className?: string };

function IconBase({
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

function BellIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M14.25 18.75a2.25 2.25 0 0 1-4.5 0" />
      <path d="M18.38 14.63 17.25 13.5v-3.75a5.25 5.25 0 1 0-10.5 0v3.75l-1.13 1.13A1.5 1.5 0 0 0 6.68 17.25h10.64a1.5 1.5 0 0 0 1.06-2.62Z" />
    </IconBase>
  );
}

function SparkleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9.81 15.9 9 18.75l-.81-2.85a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.85-.81a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.81 2.85a4.5 4.5 0 0 0 3.09 3.09l2.85.81-2.85.81a4.5 4.5 0 0 0-3.09 3.09Z" />
    </IconBase>
  );
}

function AlertIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
    </IconBase>
  );
}

function CheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M20 6 9 17l-5-5" />
    </IconBase>
  );
}

function ClockIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 6v6l4 2" />
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
    </IconBase>
  );
}

function EditIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 20h4l10.5-10.5a2.12 2.12 0 0 0-3-3L5 17v3Z" />
      <path d="m14 7 3 3" />
    </IconBase>
  );
}

function XIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </IconBase>
  );
}

function ChevronLeftIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m15 18-6-6 6-6" />
    </IconBase>
  );
}

function ChevronRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m9 18 6-6-6-6" />
    </IconBase>
  );
}

"use client";

import { useCallback, useState } from "react";

import {
  createTicket,
  getUserTickets,
} from "@/actions/user/supportTickets";
import type {
  SupportTicket,
  TicketType,
  TicketPriority,
} from "@/lib/types/supportTicket";

const PAGE_SIZE = 10;

const TICKET_TYPE_LABELS: Record<TicketType, string> = {
  bug: "Bug Report",
  feature_request: "Feature Request",
  account: "Account",
  billing: "Billing",
  other: "Other",
};

const TICKET_STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const TICKET_STATUS_THEME: Record<string, string> = {
  open: "bg-secondary/10 text-secondary border-secondary/20",
  in_progress: "bg-primary/10 text-primary border-primary/20",
  resolved: "bg-outline-variant/20 text-on-surface-variant border-outline-variant/40",
  closed: "bg-outline-variant/20 text-on-surface-variant border-outline-variant/40",
};

type SupportContentProps = {
  initialTickets: SupportTicket[];
  initialPage: number;
  initialTotalPages: number;
};

export default function SupportContent({
  initialTickets,
  initialPage,
  initialTotalPages,
}: SupportContentProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list" | "new">("list");

  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  const loadPage = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const result = await getUserTickets(p, PAGE_SIZE);
      setTickets(result.items);
      setPage(result.page);
      setTotalPages(result.totalPages);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSubmitting(true);

      const fd = new FormData(e.currentTarget);

      try {
        await createTicket({
          type: (fd.get("type") as TicketType) ?? "other",
          subject: (fd.get("subject") as string) ?? "",
          description: (fd.get("description") as string) ?? "",
          priority: (fd.get("priority") as TicketPriority) || undefined,
          attachmentLink:
            (fd.get("attachmentLink") as string) || undefined,
        });

        setView("list");
        loadPage(1);
      } catch {
        /* ignore */
      } finally {
        setSubmitting(false);
      }
    },
    [loadPage],
  );

  return (
    <div className="space-y-md">
      <section className="flex flex-col justify-between gap-6 rounded-[24px] border border-outline-variant/10 bg-surface-container-lowest p-md shadow-[0_4px_20px_rgba(10,102,194,0.05)] md:flex-row md:items-center">
        <div className="max-w-2xl">
          <p className="mb-2 font-label-sm text-label-sm uppercase tracking-[0.2em] text-secondary">
            Help Center
          </p>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-background md:font-headline-lg md:text-headline-lg">
            We&apos;re here to help
          </h1>
          <p className="mt-2 font-body-lg text-body-lg text-on-surface-variant">
            Browse your previous tickets or open a new one. For file attachments, upload to
            Google Drive or Dropbox and paste the share link.
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-outline-variant/20 bg-surface-container-lowest shadow-[0_4px_20px_rgba(10,102,194,0.05)]">
        <div className="flex items-center justify-between border-b border-outline-variant/10 px-6 py-4">
          <h2 className="font-headline-md text-headline-md text-on-background">
            {view === "list" ? "My Tickets" : "New Ticket"}
          </h2>
          <button
            className="bg-purple-gradient flex min-h-10 items-center justify-center gap-2 rounded-xl px-5 font-label-md text-label-md font-bold text-white transition-all hover:-translate-y-0.5"
            onClick={() => setView(view === "list" ? "new" : "list")}
            type="button"
          >
            {view === "list" ? "New Ticket" : "Back to Tickets"}
          </button>
        </div>

        {view === "list" ? (
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : tickets.length > 0 ? (
              <div className="divide-y divide-outline-variant/10">
                {tickets.map((ticket) => (
                  <TicketCard
                    key={ticket._id}
                    ticket={ticket}
                    onClick={() => setSelectedTicket(ticket)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container">
                  <HelpIcon className="h-6 w-6 text-on-surface-variant" />
                </div>
                <p className="font-label-md text-label-md text-on-background">
                  No tickets yet
                </p>
                <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
                  Open a new ticket and we&apos;ll get back to you.
                </p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-outline-variant/10 px-6 py-4">
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-30"
                  disabled={page <= 1}
                  onClick={() => loadPage(page - 1)}
                  type="button"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  {page} of {totalPages}
                </span>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-30"
                  disabled={page >= totalPages}
                  onClick={() => loadPage(page + 1)}
                  type="button"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <NewTicketForm submitting={submitting} onSubmit={handleSubmit} />
        )}
      </section>

      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}

function TicketCard({
  ticket,
  onClick,
}: {
  ticket: SupportTicket;
  onClick: () => void;
}) {
  return (
    <button
      className="flex w-full items-start gap-4 px-6 py-5 text-left transition-colors hover:bg-surface-container-low"
      onClick={onClick}
      type="button"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container">
        <TypeIcon type={ticket.type} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <p className="truncate font-label-md text-label-md font-semibold text-on-background">
            {ticket.subject}
          </p>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase leading-none ${TICKET_STATUS_THEME[ticket.status] || TICKET_STATUS_THEME.open}`}
          >
            {TICKET_STATUS_LABELS[ticket.status] || ticket.status}
          </span>
        </div>
        <p className="mt-1 line-clamp-1 font-body-md text-body-md text-on-surface-variant">
          {ticket.description}
        </p>
        <div className="mt-2 flex items-center gap-3 font-label-sm text-label-sm text-outline">
          <span>{TICKET_TYPE_LABELS[ticket.type] || ticket.type}</span>
          <span aria-hidden="true">·</span>
          <span>{formatTicketDate(new Date(ticket.createdAt))}</span>
        </div>
      </div>
      <ChevronRightIcon className="mt-1 h-4 w-4 shrink-0 text-outline" />
    </button>
  );
}

function NewTicketForm({
  submitting,
  onSubmit,
}: {
  submitting: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="space-y-5 p-6" onSubmit={onSubmit}>
      <div>
        <label
          className="mb-1.5 block font-label-md text-label-md font-medium text-on-background"
          htmlFor="support-subject"
        >
          Subject
        </label>
        <input
          className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 font-body-md text-body-md text-on-surface outline-none transition-all placeholder:text-on-surface-variant/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
          id="support-subject"
          name="subject"
          placeholder="Brief summary of your issue"
          required
          type="text"
        />
      </div>

      <div>
        <label
          className="mb-1.5 block font-label-md text-label-md font-medium text-on-background"
          htmlFor="support-type"
        >
          Category
        </label>
        <select
          className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 font-body-md text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          defaultValue="other"
          id="support-type"
          name="type"
        >
          {(
            Object.entries(TICKET_TYPE_LABELS) as [TicketType, string][]
          ).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          className="mb-1.5 block font-label-md text-label-md font-medium text-on-background"
          htmlFor="support-priority"
        >
          Priority
        </label>
        <select
          className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 font-body-md text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          defaultValue="medium"
          id="support-priority"
          name="priority"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label
          className="mb-1.5 block font-label-md text-label-md font-medium text-on-background"
          htmlFor="support-description"
        >
          Description
        </label>
        <textarea
          className="min-h-32 w-full resize-y rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 font-body-md text-body-md text-on-surface outline-none transition-all placeholder:text-on-surface-variant/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
          id="support-description"
          name="description"
          placeholder="Describe your issue in detail"
          required
        />
      </div>

      <div>
        <label
          className="mb-1.5 block font-label-md text-label-md font-medium text-on-background"
          htmlFor="support-attachment"
        >
          Attachment Link
          <span className="ml-1 font-label-sm text-label-sm font-normal text-outline">
            (optional)
          </span>
        </label>
        <input
          className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 font-body-md text-body-md text-on-surface outline-none transition-all placeholder:text-on-surface-variant/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
          id="support-attachment"
          name="attachmentLink"
          placeholder="Upload to Google Drive/Dropbox and paste the share link"
          type="url"
        />
        <p className="mt-1.5 font-label-sm text-label-sm text-outline">
          We don&apos;t support direct file uploads. Upload your files to Google Drive,
          Dropbox, or similar and paste the shareable link above.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 font-label-md text-label-md font-bold text-on-primary transition-all hover:bg-primary-container disabled:opacity-50"
          disabled={submitting}
          type="submit"
        >
          {submitting ? "Submitting…" : "Submit Ticket"}
        </button>
      </div>
    </form>
  );
}

function TicketModal({
  ticket,
  onClose,
}: {
  ticket: SupportTicket;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_8px_32px_rgba(0,0,0,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h2 className="truncate font-headline-md text-headline-md text-on-background">
                {ticket.subject}
              </h2>
              <span
                className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase leading-none ${TICKET_STATUS_THEME[ticket.status] || TICKET_STATUS_THEME.open}`}
              >
                {TICKET_STATUS_LABELS[ticket.status] || ticket.status}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-label-sm text-label-sm text-outline">
              <span>{TICKET_TYPE_LABELS[ticket.type] || ticket.type}</span>
              <span aria-hidden="true">·</span>
              <span>
                Priority:{" "}
                {ticket.priority.charAt(0).toUpperCase() +
                  ticket.priority.slice(1)}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Opened{" "}
                {ticket.createdAt
                  ? formatTicketDate(new Date(ticket.createdAt))
                  : ""}
              </span>
            </div>
          </div>
          <button
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-outline transition-colors hover:bg-surface-container hover:text-on-background"
            onClick={onClose}
            type="button"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-xl bg-surface p-4">
          <p className="whitespace-pre-wrap font-body-md text-body-md text-on-surface">
            {ticket.description}
          </p>
        </div>

        {ticket.attachmentLink && (
          <div className="mt-4">
            <p className="mb-1.5 font-label-sm text-label-sm font-medium text-on-background">
              Attachment
            </p>
            <a
              className="inline-flex items-center gap-2 rounded-lg bg-surface px-4 py-2.5 font-label-md text-label-md text-primary underline transition-colors hover:bg-surface-container"
              href={ticket.attachmentLink}
              rel="noopener noreferrer"
              target="_blank"
            >
              <LinkIcon className="h-4 w-4" />
              {ticket.attachmentLink.length > 60
                ? ticket.attachmentLink.slice(0, 60) + "…"
                : ticket.attachmentLink}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTicketDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
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

function TypeIcon({ type }: { type: TicketType }) {
  if (type === "bug") {
    return <BugIcon className="h-5 w-5 text-error" />;
  }

  if (type === "feature_request") {
    return <SparkleIcon className="h-5 w-5 text-secondary" />;
  }

  if (type === "account") {
    return <UserIcon className="h-5 w-5 text-primary" />;
  }

  if (type === "billing") {
    return <CreditCardIcon className="h-5 w-5 text-tertiary-container" />;
  }

  return <HelpIcon className="h-5 w-5 text-on-surface-variant" />;
}

function BugIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 21a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" />
      <path d="M9 9h.01M15 9h.01M9 13a3 3 0 0 0 6 0" />
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

function UserIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4 21a8 8 0 1 1 16 0" />
    </IconBase>
  );
}

function CreditCardIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 9h18M3 15h18M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
    </IconBase>
  );
}

function HelpIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 2-3 4" />
      <path d="M12 17h.01" />
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
    </IconBase>
  );
}

function LinkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
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

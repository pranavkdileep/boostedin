import Link from "next/link";
import { redirect } from "next/navigation";

import { getCalendarData, type CalendarPostItem } from "@/actions/user/calendar";
import DashboardShell from "@/components/dashboard/DashboardShell";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type CalendarPageProps = {
  searchParams: Promise<{
    month?: string;
  }>;
};

interface CalendarCell {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  posts: CalendarPostItem[];
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;
  const selectedDate = parseSelectedMonth(params.month);
  const month = selectedDate.getMonth();
  const year = selectedDate.getFullYear();

  let calendarData;
  try {
    calendarData = await getCalendarData({ month, year });
  } catch {
    redirect("/auth?redirect=/dash/calendar");
  }

  const today = new Date();
  const cells = buildCalendarCells({
    month,
    posts: calendarData.scheduledPosts,
    today,
    year,
  });
  const scheduledCount = calendarData.scheduledPosts.filter((post) => post.scheduledAt).length;
  const publishedCount = calendarData.scheduledPosts.filter((post) => post.status === "published").length;
  const nextPost = calendarData.scheduledPosts.find((post) => {
    if (!post.scheduledAt) return false;
    return new Date(post.scheduledAt).getTime() >= today.getTime();
  });

  return (
    <DashboardShell
      title="Content Calendar"
      userAvatar={calendarData.user.profilePictureUrl}
      userName={calendarData.user.name}
    >
      <div className="space-y-md">
        <section className="relative overflow-hidden rounded-[24px] border border-outline-variant/10 bg-surface-container-lowest p-md shadow-[0_4px_20px_rgba(10,102,194,0.05)]">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-secondary-container/20 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="mb-2 font-label-sm text-label-sm uppercase tracking-[0.2em] text-secondary">
                Content Calendar
              </p>
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-background md:font-headline-lg md:text-headline-lg">
                Plan your LinkedIn publishing rhythm
              </h1>
              <p className="mt-2 font-body-lg text-body-lg text-on-surface-variant">
                See scheduled posts, published content, and drafts in one focused planning workspace.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:min-w-[28rem]">
              <CalendarMetric label="Scheduled" value={scheduledCount} />
              <CalendarMetric label="Published" value={publishedCount} />
              <CalendarMetric label="Drafts" value={calendarData.unscheduledDrafts.length} />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-md xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="overflow-hidden rounded-[24px] border border-outline-variant/20 bg-white/80 shadow-[0_4px_20px_rgba(10,102,194,0.05)] backdrop-blur-xl">
            <CalendarToolbar month={month} year={year} />

            <div className="hidden overflow-x-auto lg:block">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-7 border-b border-outline-variant/10 bg-surface-container-low/50">
                  {WEEK_DAYS.map((day) => (
                    <div key={day} className="py-3 text-center font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {cells.map((cell) => (
                    <CalendarDayCell key={dateKey(cell.date)} cell={cell} />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4 lg:hidden">
              {cells
                .filter((cell) => cell.inMonth && cell.posts.length > 0)
                .map((cell) => (
                  <MobileAgendaDay key={dateKey(cell.date)} cell={cell} />
                ))}
              {calendarData.scheduledPosts.length === 0 && (
                <EmptyCalendarState />
              )}
            </div>
          </section>

          <aside className="space-y-md">
            <section className="rounded-[24px] border border-outline-variant/20 bg-white/80 shadow-[0_4px_20px_rgba(10,102,194,0.05)] backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-outline-variant/10 p-5">
                <h2 className="font-headline-md text-[18px] text-on-surface">
                  Unscheduled Drafts
                </h2>
                <span className="rounded bg-surface-container-highest px-2 py-1 text-[10px] font-bold text-on-surface-variant">
                  {calendarData.unscheduledDrafts.length}
                </span>
              </div>
              <div className="space-y-4 p-4">
                {calendarData.unscheduledDrafts.length > 0 ? (
                  calendarData.unscheduledDrafts.map((draft) => (
                    <DraftCard key={draft._id} draft={draft} />
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low p-4 text-center font-body-md text-body-md text-on-surface-variant">
                    No unscheduled drafts yet.
                  </p>
                )}
              </div>
              <div className="border-t border-outline-variant/10 bg-surface-container-low p-4">
                <Link className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl font-label-md text-label-md font-bold text-primary transition-all hover:bg-white" href="/dash#post-generator">
                  <PlusIcon className="h-4 w-4" />
                  Create New Draft
                </Link>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[24px] bg-primary-container p-5 text-white shadow-lg shadow-primary-container/30">
              <div className="relative z-10">
                <p className="mb-1 font-label-sm text-label-sm opacity-80">
                  Publishing Focus
                </p>
                <h3 className="mb-2 font-headline-md text-[20px]">
                  {nextPost ? "Next post is ready" : "Build this month"}
                </h3>
                <p className="font-label-sm text-label-sm leading-relaxed opacity-75">
                  {nextPost
                    ? `${nextPost.title || "Untitled post"} is scheduled for ${formatDateTime(new Date(nextPost.scheduledAt!))}.`
                    : "Schedule your first post this month to keep your audience cadence consistent."}
                </p>
              </div>
              <TrendingIcon className="absolute -bottom-8 -right-8 h-32 w-32 text-white/10" />
            </section>
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}

function parseSelectedMonth(value?: string) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return new Date();
  }

  const [year, month] = value.split("-").map(Number);
  const date = new Date(year, month - 1, 1);

  if (Number.isNaN(date.getTime())) {
    return new Date();
  }

  return date;
}

function buildCalendarCells({
  month,
  posts,
  today,
  year,
}: {
  month: number;
  posts: CalendarPostItem[];
  today: Date;
  year: number;
}) {
  const firstOfMonth = new Date(year, month, 1);
  const start = new Date(year, month, 1 - firstOfMonth.getDay());
  const cells: CalendarCell[] = [];

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = dateKey(date);

    cells.push({
      date,
      inMonth: date.getMonth() === month,
      isToday: dateKey(date) === dateKey(today),
      posts: posts.filter((post) => dateKey(getPostCalendarDate(post)) === key),
    });
  }

  return cells;
}

function getPostCalendarDate(post: CalendarPostItem) {
  return new Date(post.scheduledAt ?? post.publishedAt ?? post.updatedAt);
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthHref(year: number, month: number) {
  return `/dash/calendar?month=${year}-${String(month + 1).padStart(2, "0")}`;
}

function formatMonthTitle(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatRelativeDate(date: Date) {
  const diff = Date.now() - date.getTime();
  const hours = Math.max(1, Math.floor(diff / (1000 * 60 * 60)));

  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${Math.floor(hours / 24)}d ago`;
}

function CalendarToolbar({ month, year }: { month: number; year: number }) {
  const previous = new Date(year, month - 1, 1);
  const next = new Date(year, month + 1, 1);
  const today = new Date();

  return (
    <div className="flex flex-col gap-4 border-b border-outline-variant/10 p-md xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <h2 className="font-headline-md text-headline-md text-on-surface">
          {formatMonthTitle(year, month)}
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-xl border border-outline-variant/30 shadow-sm">
            <Link className="flex h-10 w-10 items-center justify-center border-r border-outline-variant/30 transition-colors hover:bg-surface-container-high" href={monthHref(previous.getFullYear(), previous.getMonth())}>
              <ChevronLeftIcon className="h-4 w-4" />
            </Link>
            <Link className="flex h-10 w-10 items-center justify-center transition-colors hover:bg-surface-container-high" href={monthHref(next.getFullYear(), next.getMonth())}>
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <Link className="flex min-h-10 items-center rounded-xl bg-surface-container-high px-4 font-label-md text-label-md font-semibold text-on-surface transition-colors hover:bg-surface-container-highest" href={monthHref(today.getFullYear(), today.getMonth())}>
            Today
          </Link>
        </div>
      </div>

      <Link className="bg-purple-gradient flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 font-label-md text-label-md font-bold text-white shadow-[0_12px_28px_rgba(113,42,226,0.22)] transition-all hover:-translate-y-0.5" href="/dash#post-generator">
        <PlusIcon className="h-4 w-4" />
        Schedule New Post
      </Link>
    </div>
  );
}

function CalendarMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-surface-container px-4 py-3">
      <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
        {label}
      </p>
      <p className="mt-1 font-headline-md text-headline-md text-primary">
        {value}
      </p>
    </div>
  );
}

function CalendarDayCell({ cell }: { cell: CalendarCell }) {
  return (
    <div className={`min-h-[150px] border-b border-r border-outline-variant/10 p-3 transition-colors hover:bg-surface-container-low ${cell.inMonth ? "bg-white/60" : "bg-surface-dim/20 opacity-60"}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className={`flex h-7 w-7 items-center justify-center rounded-full font-label-sm text-label-sm font-semibold ${cell.isToday ? "bg-primary text-white" : cell.inMonth ? "text-on-surface" : "text-on-surface-variant"}`}>
          {cell.date.getDate()}
        </span>
        {cell.posts.length > 2 && (
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            +{cell.posts.length - 2}
          </span>
        )}
      </div>
      <div className="space-y-2">
        {cell.posts.slice(0, 2).map((post) => (
          <CalendarPostCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
}

function CalendarPostCard({ post }: { post: CalendarPostItem }) {
  const theme = getStatusTheme(post.status);

  return (
    <Link className={`block rounded-lg border p-2 transition-all hover:-translate-y-px hover:shadow-md ${theme.card}`} href="/dash/history">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className={`truncate text-[10px] font-bold uppercase tracking-tight ${theme.text}`}>
          {post.status}
        </span>
        <StatusIcon className={`h-3.5 w-3.5 shrink-0 ${theme.text}`} status={post.status} />
      </div>
      <p className="line-clamp-2 text-[11px] font-semibold leading-tight text-on-surface">
        {post.title || "Untitled post"}
      </p>
    </Link>
  );
}

function MobileAgendaDay({ cell }: { cell: CalendarCell }) {
  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-white p-4 shadow-[0_4px_20px_rgba(10,102,194,0.05)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
            {cell.date.toLocaleDateString("en-US", { weekday: "short" })}
          </p>
          <h3 className="font-headline-md text-headline-md text-on-surface">
            {cell.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </h3>
        </div>
        {cell.isToday && (
          <span className="rounded-full bg-primary px-3 py-1 font-label-sm text-label-sm text-white">
            Today
          </span>
        )}
      </div>
      <div className="space-y-2">
        {cell.posts.map((post) => (
          <CalendarPostCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
}

function DraftCard({ draft }: { draft: CalendarPostItem }) {
  return (
    <Link className="group block rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 transition-all hover:border-primary/50 hover:shadow-lg" href="/dash/history">
      <div className="mb-2 flex items-center gap-2">
        <DragIcon className="h-4 w-4 text-on-surface-variant" />
        <span className="rounded bg-tertiary-fixed px-2 py-0.5 text-[10px] font-bold uppercase text-on-tertiary-fixed-variant">
          {draft.category || draft.tone || "AI Content"}
        </span>
      </div>
      <h3 className="font-label-md text-label-md font-semibold text-on-surface transition-colors group-hover:text-primary">
        {draft.title || "Untitled draft"}
      </h3>
      <p className="mt-1 line-clamp-2 font-label-sm text-label-sm text-on-surface-variant">
        {draft.postBody || "Draft content is ready for scheduling."}
      </p>
      <div className="mt-3 flex items-center justify-between text-[11px] text-on-surface-variant/70">
        <span>Last edited: {formatRelativeDate(new Date(draft.updatedAt))}</span>
        <DotsIcon className="h-4 w-4" />
      </div>
    </Link>
  );
}

function EmptyCalendarState() {
  return (
    <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-low p-6 text-center">
      <p className="font-headline-md text-headline-md text-on-surface">
        No posts on this month yet
      </p>
      <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
        Create or schedule a post to populate your calendar.
      </p>
    </div>
  );
}

function getStatusTheme(status: CalendarPostItem["status"]) {
  if (status === "published") {
    return {
      card: "border-primary/20 bg-primary/5",
      text: "text-primary",
    };
  }

  if (status === "draft") {
    return {
      card: "border-outline-variant/40 bg-outline-variant/20",
      text: "text-on-surface-variant",
    };
  }

  if (status === "failed") {
    return {
      card: "border-error-container bg-error-container/40",
      text: "text-error",
    };
  }

  return {
    card: "border-secondary/20 bg-secondary/5",
    text: "text-secondary",
  };
}

type IconProps = {
  className?: string;
};

function IconBase({ children, className }: IconProps & { children: React.ReactNode }) {
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

function StatusIcon({ className, status }: IconProps & { status: CalendarPostItem["status"] }) {
  if (status === "published") {
    return (
      <IconBase className={className}>
        <path d="M20 6 9 17l-5-5" />
      </IconBase>
    );
  }

  if (status === "draft") {
    return <EditIcon className={className} />;
  }

  return (
    <IconBase className={className}>
      <path d="M12 6v6l4 2" />
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
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

function PlusIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14M5 12h14" />
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

function DragIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01" />
    </IconBase>
  );
}

function DotsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 12h.01M12 12h.01M19 12h.01" />
    </IconBase>
  );
}

function TrendingIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </IconBase>
  );
}

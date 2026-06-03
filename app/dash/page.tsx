import Link from "next/link";

import { getDashboardData, type UpcomingPostItem } from "@/actions/user/dashboard";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PostGenerator from "@/components/dashboard/PostGenerator";

export default async function DashPage() {
  const dashboard = await getDashboardData();
  const now = new Date();
  const creditTotal = dashboard.credits + dashboard.totalCreditsUsed;
  const creditUsedPercent = creditTotal > 0
    ? Math.min(100, Math.round((dashboard.totalCreditsUsed / creditTotal) * 100))
    : 0;

  return (
    <DashboardShell
      title="Dashboard"
      userAvatar={dashboard.profilePictureUrl}
      userName={dashboard.name}
    >
      <div className="space-y-md">
        <section className="flex flex-col justify-between gap-6 rounded-[24px] border border-outline-variant/10 bg-surface-container-lowest p-md shadow-[0_4px_20px_rgba(10,102,194,0.05)] md:flex-row md:items-center">
          <div>
            <p className="mb-2 font-label-sm text-label-sm uppercase tracking-[0.2em] text-secondary">
              Creator Command Center
            </p>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-background md:font-headline-lg md:text-headline-lg">
              Welcome back, {dashboard.name}
            </h1>
            <p className="mt-2 font-body-lg text-body-lg text-on-surface-variant">
              Start with AI generation, then publish or schedule your next LinkedIn post.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <MiniMetric label="Posts Generated" value={formatNumber(dashboard.postsGenerated)} />
            <MiniMetric label="Scheduled" value={formatNumber(dashboard.scheduledCount)} />
          </div>
        </section>

        <div className="grid grid-cols-1 gap-md xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-md">
            <section className="rounded-[28px] bg-purple-gradient p-[1px] shadow-[0_24px_70px_rgba(113,42,226,0.18)]">
              <div className="rounded-[27px] bg-surface-container-lowest p-3 md:p-4">
                <div className="mb-4 flex flex-col justify-between gap-3 px-1 lg:flex-row lg:items-center">
                  <div className="shrink-0">
                    <p className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-secondary">
                      Primary Workspace
                    </p>
                    <h2 className="mt-1 font-headline-md text-headline-md font-bold text-on-background">
                      AI Generator
                    </h2>
                  </div>
                  <p className="w-full max-w-none font-body-md text-body-md text-on-surface-variant sm:max-w-xl lg:w-[28rem] lg:max-w-[60%] lg:shrink-0 lg:text-right">
                    Generate, refine, publish, or schedule from one focused composer.
                  </p>
                </div>
                <PostGenerator />
              </div>
            </section>
          </div>

          <aside className="space-y-md">
            <section className="rounded-[24px] border border-outline-variant/10 bg-surface-container-lowest p-md shadow-[0_4px_20px_rgba(10,102,194,0.05)]">
              <div className="mb-4 flex items-center gap-2">
                <CreditIcon className="h-5 w-5 text-tertiary-container" />
                <h2 className="font-label-md text-label-md font-bold text-on-background">
                  Credit Balance
                </h2>
              </div>
              <div className="mb-4">
                <p className="font-display-lg-mobile text-display-lg-mobile font-bold text-on-background">
                  {formatNumber(dashboard.credits)} <span className="ml-1 font-body-md text-body-md font-normal text-on-surface-variant">Left</span>
                </p>
                <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">
                  Used {formatNumber(dashboard.totalCreditsUsed)} credits total
                </p>
              </div>
              <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-surface-container">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${creditUsedPercent}%` }}
                />
              </div>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface-container py-2 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container-highest" type="button">
                <PlusIcon className="h-4 w-4" />
                Buy More Credits
              </button>
            </section>

            <section className="rounded-[24px] border border-outline-variant/10 bg-surface-container-lowest p-md shadow-[0_4px_20px_rgba(10,102,194,0.05)]">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-label-md text-label-md font-bold text-on-background">
                  Upcoming Schedules
                </h2>
                <Link className="font-label-sm text-label-sm text-primary hover:underline" href="/dash/history">
                  View All
                </Link>
              </div>
              {dashboard.upcoming.length > 0 ? (
                <div className="space-y-4">
                  {dashboard.upcoming.map((post) => (
                    <UpcomingPost key={post._id} now={now} post={post} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low p-4 text-center">
                  <p className="font-label-md text-label-md text-on-background">
                    No upcoming schedules
                  </p>
                  <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
                    Generate a post and schedule it for later.
                  </p>
                </div>
              )}
              <a href="#post-generator" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-outline-variant py-3 font-label-md text-label-md text-on-surface-variant transition-colors hover:border-primary hover:text-primary">
                <PlusIcon className="h-4 w-4" />
                Schedule New Post
              </a>
            </section>
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatScheduleStatus(scheduledAt: Date, now: Date) {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const time = scheduledAt.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (scheduledAt.toDateString() === now.toDateString()) {
    return `Today, ${time}`;
  }

  if (scheduledAt.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${time}`;
  }

  return scheduledAt.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-container px-4 py-2">
      <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
        {label}
      </p>
      <p className="mt-1 font-headline-md text-headline-md text-primary">
        {value}
      </p>
    </div>
  );
}

function UpcomingPost({ now, post }: { now: Date; post: UpcomingPostItem }) {
  const scheduledAt = new Date(post.scheduledAt);
  const isSoon = scheduledAt.getTime() - now.getTime() <= 48 * 60 * 60 * 1000;

  return (
    <Link
      className="group flex gap-4 rounded-xl border border-transparent p-3 transition-colors hover:border-outline-variant/20 hover:bg-surface-container-low"
      href="/dash/history"
    >
      <div className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-surface-container ${isSoon ? "text-primary" : "text-on-surface-variant"}`}>
        <span className="font-label-sm text-label-sm uppercase leading-none">
          {scheduledAt.toLocaleDateString("en-US", { month: "short" })}
        </span>
        <span className="mt-1 font-headline-md text-headline-md leading-none">
          {scheduledAt.getDate()}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-label-md text-label-md text-on-background">
          {post.title || "Untitled scheduled post"}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isSoon ? "bg-surface-tint" : "bg-outline-variant"}`} />
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            {formatScheduleStatus(scheduledAt, now)}
          </p>
        </div>
      </div>
      <EditIcon className="h-4 w-4 text-outline opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
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

function CreditIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
      <path d="M8.75 12h6.5M12 8.75v6.5" />
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

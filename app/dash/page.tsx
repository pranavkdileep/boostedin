import DashboardShell from "@/components/dashboard/DashboardShell";
import PostGenerator from "@/components/dashboard/PostGenerator";

export default function DashPage() {
  return (
    <DashboardShell title="Dashboard">
      <div className="space-y-md">
        <section className="flex flex-col justify-between gap-6 rounded-[24px] border border-outline-variant/10 bg-surface-container-lowest p-md shadow-[0_4px_20px_rgba(10,102,194,0.05)] md:flex-row md:items-center">
          <div>
            <p className="mb-2 font-label-sm text-label-sm uppercase tracking-[0.2em] text-secondary">
              Creator Command Center
            </p>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-background md:font-headline-lg md:text-headline-lg">
              Welcome back, Pranav
            </h1>
            <p className="mt-2 font-body-lg text-body-lg text-on-surface-variant">
              Let&apos;s create content that grows your LinkedIn audience.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <MiniMetric label="Posts Generated" value="1,248" />
            <MiniMetric label="Scheduled" value="12" />
          </div>
        </section>

        <div className="grid grid-cols-1 gap-md lg:grid-cols-3">
          <div className="space-y-md lg:col-span-2">
            <PostGenerator />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <PerformanceCard label="Followers Growth" value="+187" color="primary" path="M0,30 L20,20 L40,25 L60,10 L80,15 L100,5" />
              <PerformanceCard label="Post Engagement" value="+34%" color="secondary" path="M0,25 L20,28 L40,15 L60,20 L80,5 L100,2" />
              <PerformanceCard label="Profile Views" value="+62%" color="primary" path="M0,20 L20,25 L40,10 L60,15 L80,2 L100,5" />
              <div className="flex min-h-32 flex-col rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-4">
                <p className="mb-2 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Content Published
                </p>
                <div className="mt-auto flex items-end justify-between gap-3">
                  <p className="font-headline-lg text-headline-lg text-on-background">
                    21
                  </p>
                  <span className="font-label-md text-label-md text-outline">
                    This month
                  </span>
                </div>
              </div>
            </div>
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
                  348 <span className="ml-1 font-body-md text-body-md font-normal text-on-surface-variant">Left</span>
                </p>
                <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">
                  Used 52 credits this month
                </p>
              </div>
              <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-surface-container">
                <div className="h-full w-[15%] rounded-full bg-primary" />
              </div>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface-container py-2 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container-highest" type="button">
                <PlusIcon className="h-4 w-4" />
                Buy More Credits
              </button>
            </section>

            <section className="rounded-[24px] border border-outline-variant/10 bg-surface-container-lowest p-md shadow-[0_4px_20px_rgba(10,102,194,0.05)]">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-label-md text-label-md font-bold text-on-background">
                  Upcoming
                </h2>
                <a className="font-label-sm text-label-sm text-primary hover:underline" href="/dash/calendar">
                  View All
                </a>
              </div>
              <div className="space-y-4">
                <UpcomingPost day="12" status="Tomorrow, 9:00 AM" title="5 Lessons From Building My Startup" tone="active" />
                <UpcomingPost day="14" status="Draft" title="Why AI won't replace good writing" tone="draft" />
              </div>
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

function PerformanceCard({
  color,
  label,
  path,
  value,
}: {
  color: "primary" | "secondary";
  label: string;
  path: string;
  value: string;
}) {
  const colorClass = color === "primary" ? "text-primary" : "text-secondary";

  return (
    <div className="flex min-h-32 flex-col rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-4">
      <p className="mb-2 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
        {label}
      </p>
      <div className="mt-auto flex items-end justify-between gap-3">
        <p className={`font-headline-lg text-headline-lg ${colorClass}`}>
          {value}
        </p>
        <svg aria-hidden="true" className={`h-8 w-16 ${colorClass}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 100 30">
          <path d={path} />
        </svg>
      </div>
    </div>
  );
}

function UpcomingPost({
  day,
  status,
  title,
  tone,
}: {
  day: string;
  status: string;
  title: string;
  tone: "active" | "draft";
}) {
  return (
    <div className="group flex cursor-pointer gap-4 rounded-xl border border-transparent p-3 transition-colors hover:border-outline-variant/20 hover:bg-surface-container-low">
      <div className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-surface-container ${tone === "active" ? "text-primary" : "text-on-surface-variant"}`}>
        <span className="font-label-sm text-label-sm uppercase leading-none">Nov</span>
        <span className="mt-1 font-headline-md text-headline-md leading-none">{day}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-label-md text-label-md text-on-background">
          {title}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${tone === "active" ? "bg-surface-tint" : "bg-outline-variant"}`} />
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            {status}
          </p>
        </div>
      </div>
      <EditIcon className="h-4 w-4 text-outline opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
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

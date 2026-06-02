import DashboardShell from "@/components/dashboard/DashboardShell";

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
            <section className="relative overflow-hidden rounded-[24px] border border-outline-variant/10 bg-surface-container-lowest p-md shadow-[0_4px_20px_rgba(10,102,194,0.05)]">
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary-container/20 blur-3xl" />
              <div className="relative z-10">
                <div className="mb-6 flex items-center gap-2">
                  <SparkleIcon className="h-6 w-6 text-secondary" />
                  <h2 className="font-headline-md text-headline-md text-on-background">
                    AI Generator
                  </h2>
                </div>

                <textarea
                  className="mb-4 h-32 w-full resize-none rounded-xl border border-outline-variant/30 bg-surface p-4 font-body-lg text-body-lg text-on-surface outline-none transition-all placeholder:text-on-surface-variant/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="What would you like to write about today? e.g., The future of SaaS pricing models..."
                />

                <div className="mb-6 flex flex-wrap gap-3">
                  <button className="flex items-center gap-2 rounded-lg bg-surface-container px-3 py-1.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high" type="button">
                    <ImageIcon className="h-4 w-4" />
                    Upload Cover Image
                  </button>
                </div>

                <div className="mb-6 flex flex-wrap gap-3">
                  <SelectPill label="Type: LinkedIn Post" />
                  <SelectPill label="Tone: Professional" />
                  <SelectPill label="Length: Standard (150 words)" />
                </div>

                <button className="bg-purple-gradient flex min-h-12 w-full items-center justify-center gap-2 rounded-xl py-4 font-label-md text-label-md font-bold text-white shadow-[0_12px_28px_rgba(113,42,226,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(113,42,226,0.3)]" type="button">
                  <MagicIcon className="h-5 w-5" />
                  Generate Content
                </button>
              </div>
            </section>

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
              <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-outline-variant py-3 font-label-md text-label-md text-on-surface-variant transition-colors hover:border-primary hover:text-primary" type="button">
                <PlusIcon className="h-4 w-4" />
                Schedule New Post
              </button>
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

function SelectPill({ label }: { label: string }) {
  return (
    <select className="rounded-lg border border-outline-variant/30 bg-surface px-4 py-2 font-label-md text-label-md text-on-surface-variant outline-none transition-colors focus:border-primary">
      <option>{label}</option>
    </select>
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
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
      {children}
    </svg>
  );
}

function SparkleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9.81 15.9 9 18.75l-.81-2.85a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.85-.81a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.81 2.85a4.5 4.5 0 0 0 3.09 3.09l2.85.81-2.85.81a4.5 4.5 0 0 0-3.09 3.09Z" />
    </IconBase>
  );
}

function ImageIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.5 5.25h15A1.5 1.5 0 0 1 21 6.75v10.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.25V6.75a1.5 1.5 0 0 1 1.5-1.5Z" />
      <path d="m3 15 4.5-4.5 3 3 2.25-2.25L21 19" />
      <path d="M15.75 8.25h.01" />
    </IconBase>
  );
}

function MagicIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m14.25 5.25 4.5 4.5-9 9-4.5-4.5 9-9Z" />
      <path d="m12.75 6.75 4.5 4.5" />
      <path d="M5.25 3.75v3M3.75 5.25h3M19.5 16.5v3M18 18h3" />
    </IconBase>
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

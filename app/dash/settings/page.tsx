import DashboardShell from "@/components/dashboard/DashboardShell";
import Image from "next/image";
import { redirect } from "next/navigation";

import { updateUserSettings, getUserSettings } from "@/actions/user/settings";
import { allowLinkedInPostingAccess } from "@/actions/user/linkedinPosting";

type SettingsPageProps = {
  searchParams: Promise<{
    linkedin?: string;
    message?: string;
    save?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const statusParams = await searchParams;
  const settings = await getUserSettings();

  if (!settings) {
    redirect("/auth?redirect=/dash/settings");
  }

  async function saveSettings(formData: FormData) {
    "use server";

    try {
      await updateUserSettings({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        bio: String(formData.get("bio") ?? ""),
        notifications: {
          newPostScheduled: formData.get("newPostScheduled") === "on",
          weeklyReport: formData.get("weeklyReport") === "on",
          creditAlert: formData.get("creditAlert") === "on",
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save settings";
      redirect(`/dash/settings?save=error&message=${encodeURIComponent(message)}`);
    }

    redirect("/dash/settings?save=success");
  }

  const initials = settings.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const usedCredits = settings.linkedinPostingEnabled ? 152 : 0;
  const totalCredits = settings.credits + usedCredits;
  const creditPercent = totalCredits > 0 ? (settings.credits / totalCredits) * 100 : 0;
  const status = getStatusMessage(statusParams);

  return (
    <DashboardShell title="Settings">
      <div className="mx-auto max-w-6xl space-y-md">
        <header className="space-y-2">
          <p className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-secondary">
            Account Control Center
          </p>
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h1 className="font-headline-lg text-headline-lg font-bold text-primary">
                Settings
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Manage your account preferences and connected platforms.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full bg-surface-container-lowest px-4 py-2 font-label-md text-label-md text-on-surface-variant shadow-[0_4px_20px_rgba(10,102,194,0.05)]">
              {settings.linkedin.isConnected ? "LinkedIn connected" : "LinkedIn not connected"}
            </span>
          </div>
        </header>

        {status && <StatusBanner message={status.message} tone={status.tone} />}

        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
          <form action={saveSettings} className="space-y-gutter lg:col-span-8">
            <section className="rounded-[20px] bg-surface-container-lowest p-md shadow-[0_4px_20px_rgba(10,102,194,0.05)] transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(10,102,194,0.08)]">
              <SectionHeading color="primary" icon={<PersonIcon />} title="Profile Settings" />

              <div className="space-y-md">
                <div className="flex flex-col gap-6 border-b border-outline-variant/30 py-md sm:flex-row sm:items-center">
                  {settings.profilePictureUrl ? (
                    <Image
                      alt="Profile picture"
                      className="h-24 w-24 rounded-full object-cover ring-4 ring-primary-fixed"
                      height={96}
                      src={settings.profilePictureUrl}
                      unoptimized
                      width={96}
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-container font-headline-md text-headline-md text-on-primary ring-4 ring-primary-fixed">
                      {initials || "B"}
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="font-label-md text-label-md text-on-surface">
                      Profile Picture
                    </p>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Pulled from your LinkedIn profile during account sync.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-md md:grid-cols-2">
                  <Field label="Full Name" name="name" type="text" value={settings.name} />
                  <Field label="Email Address" name="email" type="email" value={settings.email} />
                </div>

                <label className="block space-y-xs">
                  <span className="ml-1 font-label-md text-label-md text-on-surface">
                    Bio
                  </span>
                  <textarea
                    className="min-h-28 w-full resize-none rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 font-body-md text-body-md text-on-surface outline-none transition-all placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    maxLength={500}
                    name="bio"
                    placeholder="Tell Boostedin what kind of authority you are building."
                    rows={4}
                    defaultValue={settings.bio ?? ""}
                  />
                </label>
              </div>
            </section>

            <section className="rounded-[20px] bg-surface-container-lowest p-md shadow-[0_4px_20px_rgba(10,102,194,0.05)] transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(10,102,194,0.08)]">
              <SectionHeading color="secondary" icon={<BellIcon />} title="Notification Preferences" />

              <div className="divide-y divide-outline-variant/30">
                <ToggleRow
                  checked={settings.notifications.newPostScheduled}
                  description="Get notified when an AI-generated draft is ready for review."
                  label="New Post Scheduled"
                  name="newPostScheduled"
                />
                <ToggleRow
                  checked={settings.notifications.weeklyReport}
                  description="A summary of your profile performance and engagement metrics."
                  label="Weekly Growth Report"
                  name="weeklyReport"
                />
                <ToggleRow
                  checked={settings.notifications.creditAlert}
                  description="Notify me when your AI credit balance falls below 50."
                  label="Credit Alerts"
                  name="creditAlert"
                />
              </div>
            </section>

            <div className="flex justify-end">
              <button className="min-h-12 rounded-xl bg-primary px-8 py-3 font-label-md text-label-md font-bold text-on-primary transition-all hover:-translate-y-0.5 hover:bg-primary-container hover:shadow-[0_10px_24px_rgba(10,102,194,0.22)]" type="submit">
                Save Changes
              </button>
            </div>
          </form>

          <aside className="space-y-gutter lg:col-span-4">
            <section className="rounded-[20px] bg-surface-container-lowest p-md shadow-[0_4px_20px_rgba(10,102,194,0.05)] transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(10,102,194,0.08)]">
              <div className="mb-md flex items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-primary-container/10 p-3 text-primary-container">
                    <LinkedInIcon />
                  </div>
                  <h2 className="font-body-lg text-body-lg font-bold text-on-surface">
                    Linked Platform
                  </h2>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${settings.linkedinPostingEnabled ? "bg-green-100 text-green-700" : "bg-tertiary-fixed text-on-tertiary-fixed"}`}>
                  {settings.linkedinPostingEnabled ? "Posting Live" : "Read Only"}
                </span>
              </div>

              <div className="mb-md rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
                <p className="mb-1 font-label-sm text-label-sm text-on-surface-variant">
                  Connected as
                </p>
                <p className="font-body-md text-body-md font-bold text-on-surface">
                  {settings.linkedin.firstName || settings.linkedin.lastName
                    ? `${settings.linkedin.firstName ?? ""} ${settings.linkedin.lastName ?? ""}`.trim()
                    : settings.name}
                </p>
                <p className="mt-2 font-label-md text-label-md text-on-surface-variant">
                  {settings.linkedinPostingEnabled
                    ? "Boostedin can publish approved content to LinkedIn."
                    : "Allow posting access to publish approved AI drafts directly."}
                </p>
              </div>

              {!settings.linkedinPostingEnabled && (
                <form action={allowLinkedInPostingAccess}>
                  <button className="bg-purple-gradient flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-label-md text-label-md font-bold text-white shadow-[0_10px_24px_rgba(113,42,226,0.18)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(113,42,226,0.28)]" type="submit">
                    <SparkleIcon />
                    Allow LinkedIn Posting Access
                  </button>
                  <p className="mt-2 font-label-sm text-label-sm text-on-surface-variant">
                    You will be sent to LinkedIn to approve publishing access.
                  </p>
                </form>
              )}
            </section>

            <section className="overflow-hidden rounded-[20px] border-t-4 border-primary bg-surface-container-lowest p-md shadow-[0_4px_20px_rgba(10,102,194,0.05)]">
              <h2 className="mb-md font-body-lg text-body-lg font-bold text-on-surface">
                Billing & Credits
              </h2>
              <div className="relative overflow-hidden rounded-xl bg-surface-container p-4">
                <div className="relative z-10">
                  <p className="mb-2 font-label-sm text-label-sm font-bold uppercase tracking-wider text-primary">
                    AI Credit Balance
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-headline-lg text-headline-lg font-extrabold text-on-surface">
                      {settings.credits}
                    </span>
                    <span className="font-label-md text-label-md text-on-surface-variant">
                      remaining
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-outline-variant">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${creditPercent}%` }} />
                  </div>
                </div>
                <SparkleWatermark />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}

function getStatusMessage({
  linkedin,
  message,
  save,
}: {
  linkedin?: string;
  message?: string;
  save?: string;
}): { message: string; tone: "error" | "success" } | null {
  if (save === "success") {
    return { message: "Settings saved successfully.", tone: "success" };
  }

  if (save === "error") {
    return {
      message: message ?? "Failed to save settings.",
      tone: "error",
    };
  }

  if (linkedin === "success") {
    return {
      message: "LinkedIn posting access connected successfully.",
      tone: "success",
    };
  }

  if (linkedin === "error") {
    return {
      message: message ?? "Failed to connect LinkedIn posting access.",
      tone: "error",
    };
  }

  return null;
}

function StatusBanner({
  message,
  tone,
}: {
  message: string;
  tone: "error" | "success";
}) {
  const isSuccess = tone === "success";

  return (
    <div
      className={`rounded-xl border px-4 py-3 font-label-md text-label-md shadow-[0_4px_20px_rgba(10,102,194,0.05)] ${
        isSuccess
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-error-container bg-error-container text-on-error-container"
      }`}
      role="status"
    >
      {message}
    </div>
  );
}

function SectionHeading({
  color,
  icon,
  title,
}: {
  color: "primary" | "secondary";
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="mb-md flex items-center gap-4">
      <div className={`rounded-xl p-3 ${color === "primary" ? "bg-primary-container/10 text-primary" : "bg-secondary-container/10 text-secondary"}`}>
        {icon}
      </div>
      <h2 className="font-headline-md text-headline-md text-on-surface">
        {title}
      </h2>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  value,
}: {
  label: string;
  name: string;
  type: string;
  value: string;
}) {
  return (
    <label className="block space-y-xs">
      <span className="ml-1 font-label-md text-label-md text-on-surface">
        {label}
      </span>
      <input
        className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 font-body-md text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
        defaultValue={value}
        name={name}
        type={type}
      />
    </label>
  );
}

function ToggleRow({
  checked,
  description,
  label,
  name,
}: {
  checked: boolean;
  description: string;
  label: string;
  name: string;
}) {
  return (
    <label className="flex cursor-pointer flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <span>
        <span className="block font-body-md text-body-md font-semibold text-on-surface">
          {label}
        </span>
        <span className="block font-label-md text-label-md text-on-surface-variant">
          {description}
        </span>
      </span>
      <input className="peer sr-only" defaultChecked={checked} name={name} type="checkbox" />
      <span className="relative h-6 w-11 shrink-0 rounded-full bg-outline-variant transition-colors peer-checked:bg-primary-container after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
    </label>
  );
}

function IconBase({ children }: { children: React.ReactNode }) {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
      {children}
    </svg>
  );
}

function PersonIcon() {
  return (
    <IconBase>
      <path d="M20 21a8 8 0 1 0-16 0" />
      <path d="M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
    </IconBase>
  );
}

function BellIcon() {
  return (
    <IconBase>
      <path d="M14.25 18.75a2.25 2.25 0 0 1-4.5 0" />
      <path d="M18.38 14.63 17.25 13.5v-3.75a5.25 5.25 0 1 0-10.5 0v3.75l-1.13 1.13A1.5 1.5 0 0 0 6.68 17.25h10.64a1.5 1.5 0 0 0 1.06-2.62Z" />
    </IconBase>
  );
}

function SparkleIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M9.81 15.9 9 18.75l-.81-2.85a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.85-.81a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.81 2.85a4.5 4.5 0 0 0 3.09 3.09l2.85.81-2.85.81a4.5 4.5 0 0 0-3.09 3.09Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6 fill-current" viewBox="0 0 24 24">
      <path d="M19 0H5C2.24 0 0 2.24 0 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5V5c0-2.76-2.24-5-5-5ZM8 19H5V8h3v11ZM6.5 6.73c-.97 0-1.75-.79-1.75-1.76s.78-1.76 1.75-1.76 1.75.79 1.75 1.76-.78 1.76-1.75 1.76ZM20 19h-3v-5.6c0-3.37-4-3.11-4 0V19h-3V8h3v1.77c1.4-2.59 7-2.78 7 2.48V19Z" />
    </svg>
  );
}

function SparkleWatermark() {
  return (
    <svg aria-hidden="true" className="absolute -bottom-4 -right-4 h-20 w-20 rotate-12 text-primary opacity-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2 14.65 8.74 22 9.27 16.36 13.86 18.05 21 12 17.16 5.95 21 7.64 13.86 2 9.27 9.35 8.74 12 2Z" />
    </svg>
  );
}

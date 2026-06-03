"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { logout } from "@/actions/auth/login";

const navItems = [
  {
    label: "Dashboard",
    href: "/dash",
    icon: DashboardIcon,
  },
  {
    label: "AI History",
    href: "/dash/history",
    icon: SparklesIcon,
  },
  {
    label: "Content Calendar",
    href: "/dash/calendar",
    icon: CalendarIcon,
  },
  {
    label: "Settings",
    href: "/dash/settings",
    icon: SettingsIcon,
  },
];

const footerItems = [
  {
    label: "Support",
    href: "/dash/support",
    icon: HelpIcon,
  },
];

type DashboardShellProps = {
  title: string;
  userName?: string;
  userAvatar?: string;
  children?: React.ReactNode;
};

export default function DashboardShell({ title, userName, userAvatar, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-on-background">
      <DashboardSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="min-h-screen md:ml-64">
        <DashboardHeader title={title} userName={userName} userAvatar={userAvatar} onOpenSidebar={() => setMobileOpen(true)} />
        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1440px] p-sm md:p-lg">
          {children}
        </main>
      </div>
    </div>
  );
}

function DashboardSidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col border-r border-outline-variant/20 bg-surface-container-lowest px-sm py-md shadow-sm md:flex">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <button
          aria-label="Close dashboard navigation"
          className="fixed inset-0 z-40 bg-inverse-surface/30 backdrop-blur-sm md:hidden"
          onClick={onClose}
          type="button"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 max-w-[86vw] border-r border-outline-variant/20 bg-surface-container-lowest px-sm py-md shadow-card transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent onNavigate={onClose} />
      </aside>
    </>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <Link className="mb-8 flex items-center gap-3 px-3" href="/dash" onClick={onNavigate}>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-container text-on-primary shadow-[0_8px_20px_rgba(10,102,194,0.18)]">
          <RocketIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">
            Boostedin
          </h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            AI Growth Engine
          </p>
        </div>
      </Link>

      <nav aria-label="Dashboard navigation" className="flex-1 space-y-1">
        {navItems.map((item) => (
          <SidebarLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            isActive={isActivePath(pathname, item.href)}
            label={item.label}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <button className="bg-purple-gradient flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-label-md text-label-md text-white shadow-[0_10px_24px_rgba(113,42,226,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(113,42,226,0.28)] active:translate-y-0" type="button">
          <PremiumIcon className="h-4 w-4" />
          Buy More Credits
        </button>

        <div className="space-y-1 border-t border-outline-variant/20 pt-4">
          {footerItems.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              isActive={false}
              label={item.label}
              onNavigate={onNavigate}
            />
          ))}
          <button
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-label-md text-label-md text-on-surface-variant transition-all duration-200 hover:-translate-y-px hover:bg-surface-container-low hover:text-primary"
            onClick={() => { onNavigate?.(); logout(); }}
            type="button"
          >
            <LogoutIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  isActive,
  label,
  onNavigate,
}: {
  href: string;
  icon: (props: IconProps) => React.ReactNode;
  isActive: boolean;
  label: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 font-label-md text-label-md transition-all duration-200 ${
        isActive
          ? "border-r-2 border-primary bg-surface-container-low text-primary shadow-[inset_0_0_0_1px_rgba(10,102,194,0.04)]"
          : "text-on-surface-variant hover:-translate-y-px hover:bg-surface-container-low hover:text-primary"
      }`}
      href={href}
      onClick={onNavigate}
    >
      <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
      <span>{label}</span>
    </Link>
  );
}

function DashboardHeader({
  title,
  userName,
  userAvatar,
  onOpenSidebar,
}: {
  title: string;
  userName?: string;
  userAvatar?: string;
  onOpenSidebar: () => void;
}) {
  const userInitial = userName?.trim().charAt(0).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-outline-variant/10 bg-surface/80 px-sm backdrop-blur-xl md:px-lg">
      <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
        <button
          aria-label="Open dashboard navigation"
          className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary md:hidden"
          onClick={onOpenSidebar}
          type="button"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <h2 className="hidden shrink-0 font-headline-md text-headline-md text-on-background lg:block">
          {title}
        </h2>

        <div className="relative ml-0 w-full lg:ml-8">
          <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-outline" />
          <input
            aria-label="Search campaigns, posts, and articles"
            className="h-10 w-full rounded-full border border-outline-variant/50 bg-surface-container-lowest pl-10 pr-12 font-body-md text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-primary focus:ring-1 focus:ring-primary sm:pr-16"
            placeholder="Search campaigns, posts, articles…"
            type="search"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container px-1.5 py-0.5 font-label-sm text-label-sm text-on-surface-variant shadow-[0_1px_0_rgba(0,0,0,0.04)] sm:inline-flex">
            <span className="text-[10px]">⌘</span>
            <span>K</span>
          </kbd>
        </div>
      </div>

      <div className="ml-3 flex items-center gap-2 sm:gap-4">
        <HeaderIconButton ariaLabel="Notifications" icon={BellIcon} />
        <HeaderIconButton ariaLabel="Help" icon={HelpCircleIcon} />
        <div className="ml-1 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-outline-variant/20 bg-primary-container text-sm font-bold text-on-primary shadow-card">
          {userAvatar ? (
            <Image
              alt={userName ? `${userName} profile` : "User profile"}
              className="h-full w-full object-cover"
              height={36}
              src={userAvatar}
              unoptimized
              width={36}
            />
          ) : (
            userInitial
          )}
        </div>
      </div>
    </header>
  );
}

function HeaderIconButton({
  ariaLabel,
  icon: Icon,
}: {
  ariaLabel: string;
  icon: (props: IconProps) => React.ReactNode;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
      type="button"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dash") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type IconProps = {
  className?: string;
};

function BaseIcon({
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

function RocketIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.63 8.41m5.96 5.96a14.93 14.93 0 0 1-5.84 2.58m-.12-8.54a6 6 0 0 0-7.38 5.84h4.8m2.58-5.84a14.93 14.93 0 0 0-2.58 5.84" />
      <path d="M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
    </BaseIcon>
  );
}

function DashboardIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M3.75 4.75h7.5v7.5h-7.5zM12.75 4.75h7.5v4.5h-7.5zM12.75 11.75h7.5v7.5h-7.5zM3.75 14.75h7.5v4.5h-7.5z" />
    </BaseIcon>
  );
}

function SparklesIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M9.81 15.9 9 18.75l-.81-2.85a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.85-.81a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.81 2.85a4.5 4.5 0 0 0 3.09 3.09l2.85.81-2.85.81a4.5 4.5 0 0 0-3.09 3.09ZM18 9.75l-.26-1.04a3.38 3.38 0 0 0-2.45-2.45L14.25 6l1.04-.26a3.38 3.38 0 0 0 2.45-2.45L18 2.25l.26 1.04a3.38 3.38 0 0 0 2.45 2.45L21.75 6l-1.04.26a3.38 3.38 0 0 0-2.45 2.45Z" />
    </BaseIcon>
  );
}

function CalendarIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M6.75 3v2.25M17.25 3v2.25M4.5 8.25h15M5.25 5.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25A2.25 2.25 0 0 1 18.75 21H5.25A2.25 2.25 0 0 1 3 18.75V7.5A2.25 2.25 0 0 1 5.25 5.25Z" />
    </BaseIcon>
  );
}

function SettingsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M9.59 3.2c.4-1.6 2.82-1.6 3.22 0a1.65 1.65 0 0 0 2.48 1.02c1.42-.84 3.12.86 2.28 2.28a1.65 1.65 0 0 0 1.02 2.48c1.6.4 1.6 2.82 0 3.22a1.65 1.65 0 0 0-1.02 2.48c.84 1.42-.86 3.12-2.28 2.28a1.65 1.65 0 0 0-2.48 1.02c-.4 1.6-2.82 1.6-3.22 0a1.65 1.65 0 0 0-2.48-1.02c-1.42.84-3.12-.86-2.28-2.28a1.65 1.65 0 0 0-1.02-2.48c-1.6-.4-1.6-2.82 0-3.22A1.65 1.65 0 0 0 4.83 6.5c-.84-1.42.86-3.12 2.28-2.28A1.65 1.65 0 0 0 9.6 3.2Z" />
      <path d="M12 15.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z" />
    </BaseIcon>
  );
}

function HelpIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 2-3 4" />
      <path d="M12 17h.01" />
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
    </BaseIcon>
  );
}

function LogoutIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15" />
      <path d="M12 12h9m0 0-3-3m3 3-3 3" />
    </BaseIcon>
  );
}

function PremiumIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3.75 14.65 9l5.85.85-4.23 4.12 1 5.83L12 17.05 6.73 19.8l1-5.83L3.5 9.85 9.35 9Z" />
    </BaseIcon>
  );
}

function MenuIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </BaseIcon>
  );
}

function SearchIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m21 21-4.35-4.35" />
      <path d="M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z" />
    </BaseIcon>
  );
}

function BellIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M14.25 18.75a2.25 2.25 0 0 1-4.5 0" />
      <path d="M18.38 14.63 17.25 13.5v-3.75a5.25 5.25 0 1 0-10.5 0v3.75l-1.13 1.13A1.5 1.5 0 0 0 6.68 17.25h10.64a1.5 1.5 0 0 0 1.06-2.62Z" />
    </BaseIcon>
  );
}

function HelpCircleIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 2-3 4" />
      <path d="M12 17h.01" />
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
    </BaseIcon>
  );
}

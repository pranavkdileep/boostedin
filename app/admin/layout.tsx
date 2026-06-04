"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminLogout } from "@/actions/admin/auth";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: DashboardIcon },
  { label: "Support Tickets", href: "/admin/support-tickets", icon: TicketIcon },
  { label: "Users", href: "/admin/users", icon: UsersIcon },
  { label: "Posts", href: "/admin/posts", icon: PostsIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background text-on-background">
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-56 flex-col border-r border-outline-variant/20 bg-surface-container-lowest px-4 py-6 shadow-sm md:flex">
        <Link className="mb-8 flex items-center gap-3 px-2" href="/admin">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-on-secondary shadow-[0_8px_20px_rgba(113,42,226,0.18)]">
            <ShieldIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-secondary">
              Admin
            </h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Boostedin
            </p>
          </div>
        </Link>

        <nav aria-label="Admin navigation" className="flex-1 space-y-1">
          {navItems.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              isActive={pathname === item.href}
              label={item.label}
            />
          ))}
        </nav>

        <div className="border-t border-outline-variant/20 pt-4">
          <form action={adminLogout}>
            <button
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-label-md text-label-md text-on-surface-variant transition-all duration-200 hover:-translate-y-px hover:bg-surface-container-low hover:text-error"
              type="submit"
            >
              <LogoutIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </aside>

      <div className="min-h-screen md:ml-56">
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-outline-variant/10 bg-surface/80 px-4 backdrop-blur-xl">
          <h2 className="font-headline-md text-headline-md text-on-background">
            {navItems.find((i) => i.href === pathname)?.label ?? "Admin"}
          </h2>
          <form action={adminLogout}>
            <button
              className="flex items-center gap-2 rounded-lg px-3 py-2 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-error md:hidden"
              type="submit"
            >
              <LogoutIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </form>
        </header>
        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1440px] p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  isActive,
  label,
}: {
  href: string;
  icon: (props: { className?: string }) => React.ReactNode;
  isActive: boolean;
  label: string;
}) {
  return (
    <Link
      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 font-label-md text-label-md transition-all duration-200 ${
        isActive
          ? "border-r-2 border-secondary bg-surface-container-low text-secondary"
          : "text-on-surface-variant hover:-translate-y-px hover:bg-surface-container-low hover:text-secondary"
      }`}
      href={href}
    >
      <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
      <span>{label}</span>
    </Link>
  );
}

type IconProps = { className?: string };

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

function DashboardIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M3.75 4.75h7.5v7.5h-7.5zM12.75 4.75h7.5v4.5h-7.5zM12.75 11.75h7.5v7.5h-7.5zM3.75 14.75h7.5v4.5h-7.5z" />
    </BaseIcon>
  );
}

function TicketIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M9 12h6M9 16h6M7 8h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Z" />
      <path d="M7 4h10a2 2 0 0 1 2 2v2H5V6a2 2 0 0 1 2-2Z" />
    </BaseIcon>
  );
}

function UsersIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a8.25 8.25 0 0 1 15 0" />
    </BaseIcon>
  );
}

function PostsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </BaseIcon>
  );
}

function ShieldIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3s-6 3-6 9v3.75a2.25 2.25 0 0 0 1.125 1.948L12 21l4.875-2.302A2.25 2.25 0 0 0 18 15.75V12c0-6-6-9-6-9Z" />
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

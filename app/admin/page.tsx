import { getAdminStats } from "@/actions/admin/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const statusColors: Record<string, string> = {
    open: "text-yellow-600 bg-yellow-50",
    in_progress: "text-blue-600 bg-blue-50",
    resolved: "text-green-600 bg-green-50",
    closed: "text-gray-600 bg-gray-100",
  };

  const statusLabels: Record<string, string> = {
    open: "Open",
    in_progress: "In Progress",
    resolved: "Resolved",
    closed: "Closed",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a8.25 8.25 0 0 1 15 0" />
            </svg>
          }
        />
        <StatCard
          title="Total Posts"
          value={stats.totalPosts}
          icon={
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          }
        />
        <StatCard
          title="Open Tickets"
          value={stats.ticketsByStatus.open}
          icon={
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 16h6M7 8h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 4h10a2 2 0 0 1 2 2v2H5V6a2 2 0 0 1 2-2Z" />
            </svg>
          }
        />
        <StatCard
          title="In Progress"
          value={stats.ticketsByStatus.in_progress}
          icon={
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-surface-container-high bg-surface-container-lowest p-5 shadow-card">
          <h3 className="font-headline-md text-headline-md text-on-background mb-4">
            Ticket Status Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.ticketsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[status] ?? "text-gray-600 bg-gray-100"}`}>
                  {statusLabels[status] ?? status}
                </span>
                <span className="font-label-md text-label-md text-on-surface-variant">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-surface-container-high bg-surface-container-lowest p-5 shadow-card">
          <h3 className="font-headline-md text-headline-md text-on-background mb-4">
            Recent Users
          </h3>
          {stats.recentUsers.length === 0 ? (
            <p className="text-on-surface-variant text-sm">No users yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-label-md text-label-md text-on-surface truncate">
                      {user.name}
                    </p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant truncate">
                      {user.email}
                    </p>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-surface-container-high bg-surface-container-lowest p-5 shadow-card">
        <h3 className="font-headline-md text-headline-md text-on-background mb-4">
          Recent Tickets
        </h3>
        {stats.recentTickets.length === 0 ? (
          <p className="text-on-surface-variant text-sm">No tickets yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="pb-2 font-label-sm text-label-sm text-on-surface-variant">Subject</th>
                  <th className="pb-2 font-label-sm text-label-sm text-on-surface-variant hidden sm:table-cell">Email</th>
                  <th className="pb-2 font-label-sm text-label-sm text-on-surface-variant">Status</th>
                  <th className="pb-2 font-label-sm text-label-sm text-on-surface-variant">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTickets.map((ticket) => (
                  <tr key={ticket._id} className="border-b border-outline-variant/10">
                    <td className="py-2 pr-2 font-label-md text-label-md text-on-surface truncate max-w-[200px]">
                      {ticket.subject}
                    </td>
                    <td className="py-2 pr-2 font-label-sm text-label-sm text-on-surface-variant truncate max-w-[180px] hidden sm:table-cell">
                      {ticket.email}
                    </td>
                    <td className="py-2 pr-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[ticket.status] ?? "text-gray-600 bg-gray-100"}`}>
                        {statusLabels[ticket.status] ?? ticket.status}
                      </span>
                    </td>
                    <td className="py-2 font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-surface-container-high bg-surface-container-lowest p-5 shadow-card transition-shadow duration-200 hover:shadow-card-hover">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
          {icon}
        </div>
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            {title}
          </p>
          <p className="font-headline-md text-headline-md font-bold text-on-background">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

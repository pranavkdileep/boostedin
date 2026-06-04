import { redirect } from "next/navigation";

import { getUserTickets } from "@/actions/user/supportTickets";
import DashboardShell from "@/components/dashboard/DashboardShell";
import SupportContent from "@/components/dashboard/SupportContent";

export default async function SupportPage() {
  let result;
  try {
    result = await getUserTickets();
  } catch {
    redirect("/auth?redirect=/dash/support");
  }

  return (
    <DashboardShell title="Support">
      <SupportContent
        initialTickets={result.items}
        initialPage={result.page}
        initialTotalPages={result.totalPages}
      />
    </DashboardShell>
  );
}

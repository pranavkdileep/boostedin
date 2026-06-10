import { redirect } from "next/navigation";

import DashboardShell from "@/components/dashboard/DashboardShell";
import BillingContent from "@/components/dashboard/BillingContent";
import { getBillingHistory } from "@/actions/user/billing";

export default async function BillingPage() {
  let result;

  try {
    result = await getBillingHistory();
  } catch {
    redirect("/auth?redirect=/dash/billing");
  }

  return (
    <DashboardShell title="Billing">
      <BillingContent
        initialItems={result.items}
        initialTotal={result.total}
        initialPage={result.page}
        initialTotalPages={result.totalPages}
      />
    </DashboardShell>
  );
}

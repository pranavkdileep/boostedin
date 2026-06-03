import { redirect } from "next/navigation";

import DashboardShell from "@/components/dashboard/DashboardShell";
import HistoryContent from "@/components/dashboard/HistoryContent";
import { getHistory } from "@/actions/user/history";

export default async function HistoryPage() {
  let result;
  try {
    result = await getHistory();
  } catch {
    redirect("/auth?redirect=/dash/history");
  }

  return (
    <DashboardShell title="AI History">
      <HistoryContent
        initialPosts={result.posts}
        initialTotal={result.total}
        initialPage={result.page}
        initialTotalPages={result.totalPages}
      />
    </DashboardShell>
  );
}

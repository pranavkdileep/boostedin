import { publishDueScheduledPosts } from "@/actions/user/schedulePublisher";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  if (CRON_SECRET) {
    const auth = request.headers.get("authorization");

    if (auth !== `Bearer ${CRON_SECRET}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return Response.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 }
    );
  }

  try {
    const result = await publishDueScheduledPosts();
    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

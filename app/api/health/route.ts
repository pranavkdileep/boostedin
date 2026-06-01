import { db } from "@/lib/db/db";

export async function GET() {
  try {
    await db.command({ ping: 1 });
    return Response.json({ db: true });
  } catch {
    return Response.json({ db: false }, { status: 503 });
  }
}

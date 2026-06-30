import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { exportBackupPayload } from "@/server/actions/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Download the full config backup as JSON. Auth-required. */
export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = await exportBackupPayload();
  const today = payload.exportedAt.slice(0, 10);
  return NextResponse.json(payload, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="linkbreeze-backup-${today}.json"`,
      "Cache-Control": "no-store",
    },
  });
}

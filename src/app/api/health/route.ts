import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { version } from "@/lib/version";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Probe the database so the health check reflects real readiness, not just
    // "the Node process is up". A missing/broken DB now reports 503 instead of
    // silently returning ok — which previously masked the no-tables crash.
    db.run(sql`SELECT 1`);
    return NextResponse.json({
      status: "ok",
      version,
      secretKeySet: !!process.env.SECRET_KEY,
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        version,
        secretKeySet: !!process.env.SECRET_KEY,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 503 },
    );
  }
}

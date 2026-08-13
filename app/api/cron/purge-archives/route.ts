import { NextResponse } from "next/server";
import { purgeExpiredArchives } from "@/lib/db";

/**
 * GET /api/cron/purge-archives
 *
 * Endpoint ini dipanggil oleh Vercel Cron setiap hari pukul 03.00 WIB (20:00 UTC).
 * Endpoint dproteksi dengan CRON_SECRET agar tidak bisa dipanggil sembarangan dari luar.
 *
 * Sebelum deploy, set environment variable CRON_SECRET di Vercel Dashboard:
 *   Project ? Settings ? Environment Variables ? CRON_SECRET = <random string>
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Vercel mengirim header "Authorization: Bearer <CRON_SECRET>" secara otomatis.
  // Kalau CRON_SECRET belum diset, tolak semua request demi keamanan.
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { purged } = await purgeExpiredArchives();
    console.log(`[cron/purge-archives] Purged ${purged} items.`);
    return NextResponse.json({ ok: true, purged });
  } catch (err) {
    console.error("[cron/purge-archives] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}

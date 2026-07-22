import { NextRequest, NextResponse } from "next/server";
import { ADMIN_USER, ADMIN_PASS, setAuthSession, checkRateLimit, resetRateLimit } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const rateCheck = checkRateLimit(username || "global");
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Terlalu banyak percobaan login yang gagal. Silakan coba lagi dalam ${Math.ceil(
            (rateCheck.remainingSeconds || 900) / 60
          )} menit.`,
        },
        { status: 429 }
      );
    }

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      resetRateLimit(username || "global");
      await setAuthSession();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Username atau password salah!" }, { status: 401 });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}

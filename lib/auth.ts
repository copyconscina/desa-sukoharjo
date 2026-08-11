import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { supabaseServer } from "@/utils/supabase/admin";

// Development fallback only. Production uses the persistent Supabase table.
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkInMemoryRateLimit(key: string): { allowed: boolean; remainingSeconds?: number } {
  const now = Date.now();
  const attemptKey = `rate_${key}`;
  const attempt = loginAttempts.get(attemptKey);

  if (!attempt || now > attempt.resetAt) {
    loginAttempts.set(attemptKey, { count: 1, resetAt: now + 15 * 60 * 1000 }); // 15 mins window
    return { allowed: true };
  }

  if (attempt.count >= 5) {
    const remainingSeconds = Math.ceil((attempt.resetAt - now) / 1000);
    return { allowed: false, remainingSeconds };
  }

  attempt.count += 1;
  loginAttempts.set(attemptKey, attempt);
  return { allowed: true };
}

export async function checkRateLimit(key: string = "global_ip"): Promise<{ allowed: boolean; remainingSeconds?: number }> {
  try {
    const { data, error } = await supabaseServer.rpc("consume_rate_limit", {
      p_rate_key: `rate_${key}`,
      p_max_requests: 5,
      p_window_seconds: 15 * 60,
    });
    if (error) throw error;

    const result = Array.isArray(data) ? data[0] : data;
    if (!result || typeof result.allowed !== "boolean") throw new Error("Respons rate limit tidak valid.");
    return { allowed: result.allowed, remainingSeconds: result.remaining_seconds ?? undefined };
  } catch (error) {
    // Preserve protection in local development if Supabase has not been migrated.
    console.warn("Rate limit database tidak tersedia; memakai fallback in-memory.", error);
    return checkInMemoryRateLimit(key);
  }
}

export async function resetRateLimit(key: string = "global_ip"): Promise<void> {
  loginAttempts.delete(`rate_${key}`);
  try {
    const { error } = await supabaseServer.from("rate_limits").delete().eq("rate_key", `rate_${key}`);
    if (error) throw error;
  } catch (error) {
    console.warn("Gagal mereset rate limit database.", error);
  }
}

export async function checkAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies();

    // Check custom admin session cookie first
    const adminSession = cookieStore.get("admin_session")?.value;
    if (adminSession !== "true") return false;

    // Cross-check against the real Supabase Auth session. The admin_session
    // cookie alone is not sufficient proof of identity.
    const supabase = createClient(cookieStore);
    const { data: { user }, error } = await supabase.auth.getUser();
    return !error && !!user;
  } catch (err) {
    // Fail closed: any unexpected error must never grant admin access.
    console.error("checkAuth error:", err);
    return false;
  }
}

export async function loginWithSupabase(email: string, pass: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const result = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    // Only grant the admin_session cookie after Supabase confirms the credentials.
    if (!result.error && result.data.user) {
      cookieStore.set("admin_session", "true", {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return result;
  } catch (e) {
    return { data: { user: null }, error: e instanceof Error ? e : new Error("Login gagal.") };
  }
}

export async function logoutWithSupabase() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");

  try {
    const supabase = createClient(cookieStore);
    return await supabase.auth.signOut();
  } catch (e) {
    return { error: e instanceof Error ? e : new Error("Logout gagal.") };
  }
}

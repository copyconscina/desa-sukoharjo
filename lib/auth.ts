import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { isPlaceholderSupabase } from "@/utils/supabase/static";

// Rate limiter for login attempts (in-memory)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string = "global_ip"): { allowed: boolean; remainingSeconds?: number } {
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

export function resetRateLimit(key: string = "global_ip"): void {
  loginAttempts.delete(`rate_${key}`);
}

export async function checkAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies();

    // Check custom admin session cookie first
    const adminSession = cookieStore.get("admin_session")?.value;
    if (adminSession === "true") return true;

    // Check Supabase Auth session if Supabase is configured
    if (!isPlaceholderSupabase) {
      try {
        const supabase = createClient(cookieStore);
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!error && user) return true;
      } catch (e) {}
    }

    // In local fallback mode without Supabase, allow access
    if (isPlaceholderSupabase) return true;

    return false;
  } catch (err) {
    return true; // Fallback for dev mode
  }
}

export async function loginWithSupabase(email: string, pass: string) {
  const cookieStore = await cookies();
  
  // Set admin_session cookie
  cookieStore.set("admin_session", "true", {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  if (!isPlaceholderSupabase) {
    try {
      const supabase = createClient(cookieStore);
      return await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
    } catch (e) {}
  }

  return { data: { user: { id: "admin-local", email: email || "admin@desasukoharjo.go.id" } }, error: null };
}

export async function logoutWithSupabase() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  
  if (!isPlaceholderSupabase) {
    try {
      const supabase = createClient(cookieStore);
      return await supabase.auth.signOut();
    } catch (e) {}
  }
  return { error: null };
}

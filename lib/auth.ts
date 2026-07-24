import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

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
    const supabase = createClient(cookieStore);
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return false;
    return true;
  } catch (err) {
    console.error("Auth check error:", err);
    return false;
  }
}

export async function loginWithSupabase(email: string, pass: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  return supabase.auth.signInWithPassword({
    email,
    password: pass,
  });
}

export async function logoutWithSupabase() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  return supabase.auth.signOut();
}

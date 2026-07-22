import { cookies } from "next/headers";
import crypto from "crypto";

export const ADMIN_USER = process.env.ADMIN_USER || "admin";
export const ADMIN_PASS = process.env.ADMIN_PASS || "";
const AUTH_SECRET = process.env.AUTH_SECRET || "";

export const SESSION_COOKIE = "admin_session";

// Fail-safe check: throw in production if credentials or secret are missing
if (process.env.NODE_ENV === "production") {
  if (!ADMIN_PASS || !AUTH_SECRET) {
    throw new Error("CRITICAL SECURITY ERROR: ADMIN_PASS and AUTH_SECRET must be defined in production environment variables.");
  }
}

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

export function generateSessionToken(): string {
  const timestamp = Date.now().toString();
  const randomBytes = crypto.randomBytes(16).toString("hex");
  const payload = `${timestamp}.${randomBytes}`;
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payload)
    .digest("hex");
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [timestampStr, randomBytes, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // 24 hours max age
  const maxAge = 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > maxAge) return false;

  const payload = `${timestampStr}.${randomBytes}`;
  const expectedSignature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payload)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

export async function setAuthSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = generateSessionToken();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
    sameSite: "lax",
  });
}

export async function clearAuthSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

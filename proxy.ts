import { NextRequest, NextResponse } from "next/server";

// Defense in depth: dashboard layout also validates the Supabase session.
export function proxy(request: NextRequest) {
  if (request.cookies.get("admin_session")?.value !== "true") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/dashboard/:path*"] };

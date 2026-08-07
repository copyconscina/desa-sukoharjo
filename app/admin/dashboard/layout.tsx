import { redirect } from "next/navigation";
import { checkAuth } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAuth = await checkAuth();

  if (!isAuth) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-shell flex min-h-screen text-[color:var(--ink)] font-sans">
      {/* Sidebar navigation */}
      <AdminSidebar />

      {/* Main Content Workspace */}
      <div className="admin-workspace flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="admin-topbar h-16 px-8 flex items-center justify-between sticky top-0 z-30">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[color:var(--ink-soft)]">
              Status Sesi:
            </span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded ml-2">
              Administrator
            </span>
          </div>
          <div className="text-xs text-[color:var(--ink-soft)]">
            Website Desa Sukoharjo · Kab. Wonogiri
          </div>
        </header>

        {/* Dynamic Pages */}
        <main className="admin-main flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

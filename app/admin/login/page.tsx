"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "../actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await loginAction(formData);
      if (res.success) {
        router.push("/admin/dashboard");
      } else {
        setError(res.error || "Terjadi kesalahan!");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Gagal menghubungkan ke server.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[color:var(--parchment-2)] px-6 py-12 relative overflow-hidden font-sans"
      style={{
        backgroundImage: "radial-gradient(circle at 10% 20%, rgba(57, 84, 47, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(139, 66, 38, 0.04) 0%, transparent 40%)"
      }}
    >
      {/* Dynamic Background Terraces */}
      <div className="absolute inset-0 pointer-events-none opacity-15" aria-hidden="true">
        <svg viewBox="0 0 1200 600" preserveAspectRatio="none" className="w-full h-full">
          <polygon points="0,600 0,450 1200,500 1200,600" fill="var(--forest)" />
          <polygon points="0,450 0,320 1200,380 1200,500" fill="var(--forest-mid)" />
        </svg>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <span className="eyebrow">Dashboard Administrasi</span>
          <h1 className="text-3xl font-heading mt-2 mb-1" style={{ color: "var(--forest-deep)" }}>
            Desa Sukoharjo
          </h1>
          <p className="text-sm text-[color:var(--ink-soft)]">
            Kecamatan Tirtomoyo, Wonogiri
          </p>
        </div>

        <Card className="border border-[color:var(--line)] shadow-xl p-8 bg-[color:var(--card)]" style={{ borderRadius: "var(--radius)" }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-2"
              >
                Email Admin
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                required
                placeholder="admin@desasukoharjo.id"
                className="w-full px-4 py-2 border border-[color:var(--line)] bg-[color:var(--parchment)] rounded-xl"
                style={{ height: "42px" }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-mono uppercase tracking-wider text-[color:var(--ink-soft)] mb-2"
              >
                Password
              </label>
              <Input
                type="password"
                id="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-[color:var(--line)] bg-[color:var(--parchment)] rounded-xl"
                style={{ height: "42px" }}
              />
            </div>

            {error && (
              <div
                className="p-3 text-xs bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/20 font-sans"
                style={{ borderRadius: "8px" }}
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full border-none font-medium hover:scale-[1.01] transition-transform duration-200"
              style={{
                height: "44px",
                background: "var(--forest)",
                color: "#fff",
                borderRadius: "20px"
              }}
            >
              {loading ? "Memverifikasi..." : "Masuk ke Panel"}
            </Button>
          </form>
        </Card>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-[color:var(--ink-soft)] hover:text-[color:var(--forest)] transition-colors duration-200 inline-flex items-center gap-1"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

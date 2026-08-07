"use client";

import React, { useState } from "react";
import { BukuTamu } from "@/lib/data";
import { addBukuTamuPublicAction } from "@/app/admin/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  initialList: BukuTamu[];
}

export default function BukuTamuClient({ initialList }: Props) {
  const [list, setList] = useState<BukuTamu[]>(initialList);
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !origin.trim() || !message.trim()) {
      setError("Mohon lengkapi semua bidang isian buku tamu.");
      return;
    }

    setLoading(true);
    try {
      const res = await addBukuTamuPublicAction(name, origin, message);
      if (res.success && res.item) {
        setList([res.item, ...list]);
        setSuccess("Terima kasih! Pesan & kesan Anda berhasil tersimpan dalam Buku Tamu Desa Sukoharjo.");
        setName("");
        setOrigin("");
        setMessage("");
      } else {
        setError(res.error || "Gagal menyimpan pesan buku tamu.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="block">
      <div className="wrap two-col">
        {/* FORM ISI BUKU TAMU */}
        <Card className="card shadow-none border border-[color:var(--line)] p-6 bg-[color:var(--card)]">
          <h2 className="font-heading mb-2 text-xl text-[color:var(--ink)]">Isi Buku Tamu</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-mono text-[color:var(--ink-soft)] mb-1">
                Nama Lengkap *
              </label>
              <Input
                type="text"
                placeholder="Contoh: Budi Santoso"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment)] text-sm focus:outline-none focus:border-[color:var(--forest)]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-mono text-[color:var(--ink-soft)] mb-1">
                Asal / Instansi / Dusun *
              </label>
              <Input
                type="text"
                placeholder="Contoh: Warga Dusun Jati / Pengunjung"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment)] text-sm focus:outline-none focus:border-[color:var(--forest)]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-mono text-[color:var(--ink-soft)] mb-1">
                Pesan / Kesan / Aspirasi *
              </label>
              <Textarea
                rows={4}
                placeholder="Tuliskan pesan atau masukan Anda untuk Desa Sukoharjo..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment)] text-sm focus:outline-none focus:border-[color:var(--forest)] resize-none"
                required
              />
            </div>

            {error && (
              <div className="p-3 text-xs bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/20 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
                {success}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="btn btn-dark w-full justify-center bg-[color:var(--forest)] text-white border-none cursor-pointer"
            >
              {loading ? "Menyimpan..." : "Kirim Pesan Buku Tamu"}
            </Button>
          </form>
        </Card>

        {/* ENTRI BUKU TAMU TERBARU */}
        <div className="flex flex-col gap-4">
          <h3 className="font-heading text-xl text-[color:var(--ink)]">
            Pesan & Kesan Terbaru ({list.length})
          </h3>
          {list.length === 0 ? (
            <Card className="p-6 text-center text-sm text-[color:var(--ink-soft)] border border-[color:var(--line)]">
              Belum ada entri buku tamu. Jadilah yang pertama mengisi buku tamu warga!
            </Card>
          ) : (
            list.map((item) => (
              <Card key={item.id} className="card shadow-none border border-[color:var(--line)] bg-[color:var(--card)] flex flex-col" style={{ padding: "12px 16px", gap: "4px" }}>
                <div className="flex justify-between items-start gap-2 m-0 p-0">
                  <div>
                    <h4 className="font-semibold text-[color:var(--ink)] text-sm md:text-base leading-snug m-0 p-0">{item.name}</h4>
                    <span className="text-[11px] font-mono text-[color:var(--clay)] block m-0 p-0 mt-0.5">{item.origin}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[color:var(--ink-soft)] flex-shrink-0">{item.date}</span>
                </div>
                <p className="text-xs md:text-sm text-[color:var(--ink-soft)] italic leading-relaxed m-0 p-0 mt-1">&ldquo;{item.message}&rdquo;</p>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

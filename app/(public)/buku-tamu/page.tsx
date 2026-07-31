import { Metadata } from "next";
import { getBukuTamuList } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buku Tamu — Desa Sukoharjo",
  description: "Formulir buku tamu dan ruang aspirasi/kesan pesan masyarakat bagi Desa Sukoharjo, Kecamatan Tirtomoyo.",
};

export default async function BukuTamuPage() {
  const guestbook = await getBukuTamuList();

  return (
    <div className="font-sans">
      <header className="page-header">
        <div className="wrap">
          <p className="eyebrow on-dark">Layanan Publik</p>
          <h1>Buku Tamu Warga & Pengunjung</h1>
          <p>
            Sampaikan saran, kesan, pesan, atau salam hangat Anda untuk Pemerintah Desa dan warga Desa Sukoharjo.
          </p>
        </div>
      </header>

      <section className="block">
        <div className="wrap two-col">
          {/* FORM ISI BUKU TAMU */}
          <Card className="card shadow-none border border-[color:var(--line)] p-6">
            <h3 className="font-heading mb-4 text-xl text-[color:var(--ink)]">Isi Buku Tamu</h3>
            <form className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[color:var(--ink-soft)] mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-4 py-2.5 rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment)] text-sm focus:outline-none focus:border-[color:var(--forest)]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-[color:var(--ink-soft)] mb-1">Asal / Instansi / Dusun</label>
                <input
                  type="text"
                  placeholder="Contoh: Warga Dusun Ngrancah / Pengunjung"
                  className="w-full px-4 py-2.5 rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment)] text-sm focus:outline-none focus:border-[color:var(--forest)]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-[color:var(--ink-soft)] mb-1">Pesan / Kesan / Aspirasi</label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan pesan atau masukan Anda..."
                  className="w-full px-4 py-2.5 rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment)] text-sm focus:outline-none focus:border-[color:var(--forest)]"
                  required
                />
              </div>
              <Button type="button" className="btn btn-dark w-full justify-center">
                Kirim Pesan Buku Tamu
              </Button>
            </form>
          </Card>

          {/* ENTRI BUKU TAMU TERBARU */}
          <div className="flex flex-col gap-4">
            <h3 className="font-heading text-xl text-[color:var(--ink)]">Pesan & Kesan Terbaru</h3>
            {guestbook.map((item) => (
              <Card key={item.id} className="card shadow-none border border-[color:var(--line)] p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-[color:var(--ink)] text-base">{item.name}</h4>
                    <span className="text-xs font-mono text-[color:var(--clay)]">{item.origin}</span>
                  </div>
                  <span className="text-xs font-mono text-[color:var(--ink-soft)]">{item.date}</span>
                </div>
                <p className="text-sm text-[color:var(--ink-soft)] italic">&ldquo;{item.message}&rdquo;</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

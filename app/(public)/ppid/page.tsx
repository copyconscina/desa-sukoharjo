import { Metadata } from "next";
import { getPpidList } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "PPID — Pejabat Pengelola Informasi dan Dokumentasi Desa Sukoharjo",
  description: "Layanan informasi publik sesuai UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik di Desa Sukoharjo.",
};

export default async function PPIDPage() {
  const ppidDocs = await getPpidList();

  const berkala = ppidDocs.filter((d) => d.kategori === "Berkala");
  const sertaMerta = ppidDocs.filter((d) => d.kategori === "Serta-Merta");
  const setiapSaat = ppidDocs.filter((d) => d.kategori === "Setiap Saat");

  const categories = [
    {
      title: "Informasi Berkala",
      desc: "Informasi yang diperbarui secara rutin seperti Laporan Keuangan APBDes, Profil Desa, RKPDes, dan RPJMDes.",
      items: berkala,
    },
    {
      title: "Informasi Serta-Merta",
      desc: "Informasi yang dapat mengancam hajat hidup orang banyak dan ketertiban umum seperti peringatan bencana dan wabah.",
      items: sertaMerta,
    },
    {
      title: "Informasi Setiap Saat",
      desc: "Informasi yang wajib disediakan dan dapat diakses publik sewaktu-waktu sesuai ketentuan hukum.",
      items: setiapSaat,
    },
  ];

  return (
    <div className="font-sans">
      <header className="page-header">
        <div className="wrap">
          <p className="eyebrow on-dark">Keterbukaan Informasi Publik</p>
          <h1>PPID Desa Sukoharjo</h1>
          <p>
            Layanan resmi Pejabat Pengelola Informasi dan Dokumentasi (PPID) Pemerintah Desa Sukoharjo sesuai UU KIP No. 14/2008.
          </p>
        </div>
      </header>

      <section className="block">
        <div className="wrap flex flex-col gap-8">
          <div className="grid cols-3">
            {categories.map((kat, idx) => (
              <Card key={idx} className="card shadow-none border border-[color:var(--line)] p-6 flex flex-col justify-between">
                <div>
                  <Badge className="bg-[color:var(--forest)] text-white border-none mb-3">
                    Kategori PPID
                  </Badge>
                  <h3 className="font-heading text-xl text-[color:var(--ink)] mb-2">{kat.title}</h3>
                  <p className="text-sm text-[color:var(--ink-soft)] mb-4">{kat.desc}</p>
                  <div className="border-t border-[color:var(--line)] pt-3 flex flex-col gap-2">
                    <span className="text-xs font-mono uppercase text-[color:var(--clay)] font-semibold">Dokumen Disediakan:</span>
                    <ul className="text-xs text-[color:var(--ink)] list-disc pl-4 space-y-1">
                      {kat.items.length > 0 ? (
                        kat.items.map((doc) => (
                          <li key={doc.id}>
                            <strong>{doc.judul}</strong> ({doc.format} · {doc.ukuran})
                          </li>
                        ))
                      ) : (
                        <li className="italic text-[color:var(--ink-soft)]">Belum ada dokumen.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* PERMOHONAN INFORMASI */}
          <Card className="card shadow-none border border-[color:var(--line)] p-6 bg-[color:var(--parchment-2)]">
            <h3 className="font-heading text-xl text-[color:var(--ink)] mb-2">Prosedur Permohonan Informasi Publik</h3>
            <p className="text-sm text-[color:var(--ink-soft)] leading-relaxed">
              Masyarakat dapat mengajukan permohonan informasi tertulis secara langsung ke Balai Desa Sukoharjo atau melalui surat elektronik ke <strong>ppid@sukoharjo-wonogiri.desa.id</strong> dengan melampirkan fotokopi KTP dan formulir permohonan informasi publik.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}

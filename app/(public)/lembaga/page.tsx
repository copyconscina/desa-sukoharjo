import { Metadata } from "next";
import { getLembagaList } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Lembaga Desa — Desa Sukoharjo",
  description: "Struktur organisasi kelembagaan Pemerintah Desa, BPD, PKK, Karang Taruna, dan RT/RW Desa Sukoharjo.",
  alternates: { canonical: "/lembaga" },
};

export default async function LembagaPage() {
  const lembagaList = await getLembagaList();

  return (
    <div className="font-sans">
      <header className="page-header">
        <div className="wrap">
          <p className="eyebrow on-dark">Struktur Kelembagaan</p>
          <h1 className="font-heading font-semibold tracking-[-0.01em]">Lembaga Desa Sukoharjo</h1>
          <p>
            Mengenal struktur kelembagaan, kemitraan pemerintah desa, dan organisasi kemasyarakatan yang aktif membangun desa.
          </p>
        </div>
      </header>

      <section className="block">
        <div className="wrap">
          <div className="grid cols-3">
            {lembagaList.map((item) => (
              <Card key={item.id} className="card shadow-none border border-[color:var(--line)] p-6 flex flex-col justify-between">
                <div>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <Badge className="bg-[color:var(--forest)] text-white border-none w-fit mb-2">
                    {item.members}
                  </Badge>
                  <h3 className="font-heading font-semibold text-xl text-[color:var(--ink)] mb-1">{item.name}</h3>
                  <p className="text-xs font-mono text-[color:var(--clay)] font-semibold mb-3">{item.leader}</p>
                  <p className="text-sm text-[color:var(--ink-soft)] leading-relaxed">{item.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

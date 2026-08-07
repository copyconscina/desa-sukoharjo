import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getBeritaList } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { parseImagesList } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Berita Desa Sukoharjo",
  description: "Kegiatan, agenda, dan pengumuman resmi dari Pemerintah Desa Sukoharjo, Kecamatan Tirtomoyo, Kabupaten Wonogiri.",
};

export default async function BeritaPage() {
  const beritaData = await getBeritaList();
  return (
    <div className="font-sans">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="terraces" aria-hidden="true" style={{ opacity: 0.5 }}>
          <svg viewBox="0 0 1200 300" preserveAspectRatio="none">
            <polygon points="0,300 0,240 1200,280 1200,300" fill="#2d4425" />
            <polygon points="0,240 0,190 1200,230 1200,280" fill="#39542f" />
          </svg>
        </div>
        <div className="wrap">
          <p className="eyebrow on-dark">Berita &amp; Pengumuman</p>
          <h1 className="font-heading font-semibold tracking-[-0.01em]">Kegiatan, agenda, dan pengumuman resmi desa</h1>
        </div>
      </div>

      {/* FULL BERITA GRID */}
      <section className="block">
        <div className="wrap">
          <div className="grid cols-3">
            {beritaData.map((b, idx) => {
              const imageList = parseImagesList(b.images);
              const firstImage = imageList[0] || null;
              return (
                <Link href={`/berita/${b.id}`} target="_blank" key={idx} style={{ textDecoration: "none", color: "inherit" }} className="h-full block">
                  <Card 
                    className="card info-card shadow-none border border-[color:var(--line)] transition-transform hover:-translate-y-1 hover:shadow-sm duration-200 cursor-pointer h-full flex flex-col justify-between overflow-hidden"
                    style={{ padding: 0 }}
                  >
                    {firstImage && (
                      <div className="w-full h-44 overflow-hidden border-b border-[color:var(--line)] relative bg-black/5">
                        <Image
                          src={firstImage}
                          alt={b.title}
                          fill
                          unoptimized
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "10px", flex: 1, justifyContent: "space-between" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <Badge className={`tag ${b.cls} border-none w-fit inline-flex justify-center`} variant="default" style={{ height: "auto", margin: 0 }}>
                          {b.tag}
                        </Badge>
                        <h3 className="font-heading" style={{ margin: 0, fontSize: "1.15rem", lineHeight: "1.35", color: "var(--ink)" }}>{b.title}</h3>
                        <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: "14px", lineHeight: "1.5" }} className="line-clamp-3">{b.desc}</p>
                      </div>
                      <div className="date" style={{ marginTop: "12px", borderTop: "1px solid var(--line)", paddingTop: "12px", fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--ink-soft)" }}>
                        {b.date}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

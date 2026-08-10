import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBeritaList, getBeritaById } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MediaCarousel from "@/components/MediaCarousel";
import { parseImagesList } from "@/lib/utils";
import { defaultOgImage } from "@/lib/site";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  const beritaData = await getBeritaList();
  return beritaData.map((b) => ({
    id: b.id ? b.id.toString() : "",
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const b = await getBeritaById(parseInt(id));
  if (!b) {
    return {
      title: "Berita Tidak Ditemukan",
    };
  }
  return {
    title: `${b.title} — Kabar Desa Sukoharjo`,
    description: b.desc,
    alternates: { canonical: `/berita/${id}` },
    openGraph: { type: "article", title: b.title, description: b.desc, images: [{ url: parseImagesList(b.images)[0] || defaultOgImage, alt: b.title }] },
    twitter: { card: "summary_large_image", title: b.title, description: b.desc, images: [parseImagesList(b.images)[0] || defaultOgImage] },
  };
}

export default async function BeritaDetailPage({ params }: Props) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    notFound();
  }

  const b = await getBeritaById(numId);

  if (!b) {
    notFound();
  }

  const imageList = parseImagesList(b.images);

  const icCal = (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="18" height="18">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="16" y1="3" x2="16" y2="7" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="3" y1="11" x2="21" y2="11" />
    </svg>
  );

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
          <Button asChild className="btn btn-ghost border border-white/35" style={{ marginBottom: "20px", display: "inline-flex" }}>
            <Link href="/berita">← Kembali ke Berita</Link>
          </Button>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <Badge className={`tag ${b.cls} border-none w-fit inline-flex justify-center`} variant="default" style={{ height: "auto", margin: 0 }}>
              {b.tag}
            </Badge>
          </div>
          <h1 style={{ fontSize: "2.4rem", lineHeight: "1.2", maxWidth: "900px" }}>{b.title}</h1>
        </div>
      </div>

      {/* ARTICLE CONTENT */}
      <section className="block">
        <div className="wrap" style={{ maxWidth: "800px" }}>
          <Card className="border border-[color:var(--line)] shadow-none p-8 md:p-10 rounded-2xl bg-[color:var(--card)]">
            <div 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px", 
                color: "var(--ink-soft)", 
                fontSize: "14px", 
                fontFamily: "var(--font-mono)", 
                marginBottom: "28px",
                borderBottom: "1px solid var(--line)",
                paddingBottom: "16px"
              }}
            >
              {icCal}
              <span>Dipublikasikan pada {b.date}</span>
            </div>
            
            <div className="mb-8">
              <MediaCarousel
                imagesData={b.images}
                title={b.title}
                badge={b.tag}
                aspectRatio="h-[300px] sm:h-[420px]"
              />
            </div>
            
            <article 
              className="prose max-w-none text-[color:var(--ink)]"
              style={{ 
                fontSize: "17px", 
                lineHeight: "1.8", 
                whiteSpace: "pre-wrap",
                textAlign: "justify" 
              }}
            >
              {b.desc}
            </article>
          </Card>
        </div>
      </section>
    </div>
  );
}

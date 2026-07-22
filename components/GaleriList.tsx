"use client";

import { useState } from "react";
import Image from "next/image";
import { GaleriItem } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  initialGaleriData: GaleriItem[];
}

export default function GaleriList({ initialGaleriData }: Props) {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [selectedItem, setSelectedItem] = useState<GaleriItem | null>(null);

  const categories = ["Semua", ...Array.from(new Set(initialGaleriData.map((g) => g.cat)))];

  const filteredGaleri = initialGaleriData.filter(
    (g) => activeCategory === "Semua" || g.cat === activeCategory
  );

  const icZoom = (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="20" height="20" className="z-10">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  const icClose = (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor" width="20" height="20">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  return (
    <div className="wrap">
      <div className="gal-filters" id="galFilters">
        {categories.map((c) => (
          <Button
            key={c}
            variant={activeCategory === c ? "default" : "outline"}
            className={`chip ${activeCategory === c ? "active" : ""}`}
            style={{ display: "inline-flex", height: "auto", border: "1px solid var(--line)" }}
            onClick={() => setActiveCategory(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      <div className="gal-grid mt-6" id="galGrid">
        {filteredGaleri.map((g, idx) => (
          <div 
            key={idx} 
            className="gal-tile relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-200" 
            style={!g.image ? { background: g.grad } : undefined}
            onClick={() => setSelectedItem(g)}
          >
            {g.image && (
              <Image
                src={g.image}
                alt={g.label}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            )}
            {icZoom}
            <span className="z-10 relative">{g.label}</span>
          </div>
        ))}
      </div>

      {/* LIGHTBOX MODAL */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="bg-[color:var(--card)] border border-[color:var(--line)] w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/95 text-[color:var(--forest-deep)] hover:bg-white flex items-center justify-center shadow-lg border-none cursor-pointer transition-colors"
              title="Tutup detail"
            >
              {icClose}
            </button>

            {/* Full Image Container */}
            <div className="relative w-full min-h-[300px] max-h-[55vh] overflow-hidden bg-black/5 flex items-center justify-center">
              {selectedItem.image ? (
                <div className="relative w-full h-[50vh]">
                  <Image 
                    src={selectedItem.image} 
                    alt={selectedItem.label} 
                    fill
                    sizes="(max-width: 768px) 100vw, 800px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <div 
                  className="w-full h-64 flex items-center justify-center text-white text-lg font-medium"
                  style={{ background: selectedItem.grad }}
                >
                  {selectedItem.label}
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="p-6 md:p-8 flex flex-col gap-3 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <Badge className="tag border-none w-fit inline-flex justify-center" variant="default" style={{ height: "auto", margin: 0, background: "var(--forest)" }}>
                  {selectedItem.cat}
                </Badge>
              </div>

              <h2 className="text-xl font-heading text-[color:var(--forest-deep)] leading-snug">
                {selectedItem.label}
              </h2>

              <p 
                className="text-[color:var(--ink-soft)] text-sm leading-relaxed whitespace-pre-wrap" 
              >
                {selectedItem.desc || "Dokumentasi foto kegiatan pembangunan, UMKM unggulan, atau potensi pariwisata Desa Sukoharjo."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Umkm } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { parseImagesList } from "@/lib/utils";

interface Props {
  initialUmkmData: Umkm[];
}

const ITEMS_PER_PAGE = 8;

export default function UmkmList({ initialUmkmData }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);

  const categories = ["Semua", ...Array.from(new Set(initialUmkmData.map((u) => u.category)))];

  const filteredUmkm = initialUmkmData.filter((u) => {
    const term = searchTerm.trim().toLowerCase();
    const matchCat = activeCategory === "Semua" || u.category === activeCategory;
    const matchTerm =
      !term ||
      [u.name, u.product, u.owner].join(" ").toLowerCase().includes(term);
    return matchCat && matchTerm;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUmkm.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedUmkm = filteredUmkm.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const handleFilterChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  return (
    <div className="wrap">
      <div className="umkm-toolbar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-muted-foreground">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <Input
            type="text"
            id="umkmSearch"
            placeholder="Cari nama UMKM, produk, atau pemilik…"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-[42px] pr-4 py-3 rounded-full border border-[color:var(--line)] bg-[color:var(--card)] text-sm font-sans h-[46px]"
          />
        </div>
      </div>

      <div className="filter-chips mb-5" id="umkmFilters">
        {categories.map((c) => (
          <Button
            key={c}
            variant={activeCategory === c ? "default" : "outline"}
            className={`chip ${activeCategory === c ? "active" : ""}`}
            style={{ display: "inline-flex", height: "auto", border: "1px solid var(--line)" }}
            onClick={() => handleFilterChange(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="result-count" id="umkmResultCount">
          {filteredUmkm.length} UMKM ditemukan
        </p>
        {totalPages > 1 && (
          <span className="text-xs font-mono text-[color:var(--ink-soft)]">
            Halaman {safePage} / {totalPages}
          </span>
        )}
      </div>

      <div className="grid cols-4" id="umkmGrid">
        {pagedUmkm.length > 0 ? (
          pagedUmkm.map((u) => {
            const images = parseImagesList(u.images);
            const cover = images[0] || u.image;

            return (
              <Link href={`/umkm/${u.id}`} key={u.id} className="umkm-card no-underline group">
                <Card className="umkm-card border border-[color:var(--line)] shadow-none flex flex-col h-full overflow-hidden rounded-[var(--radius)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-md p-0 pt-0 py-0">
                  <div
                    className="cover relative w-full h-48 sm:h-52 bg-slate-950/10 overflow-hidden"
                    style={!cover ? { background: u.grad } : undefined}
                  >
                    {cover && (
                      <Image
                        src={cover}
                        alt={u.name}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                    <Badge className="cat-badge border-none z-10 bg-[#212f1c]/75 text-white">{u.category}</Badge>
                    {images.length > 1 && (
                      <Badge className="absolute bottom-3 right-3 z-10 bg-black/75 text-white text-[10px] font-mono border border-white/20">
                        📷 {images.length} Foto
                      </Badge>
                    )}
                  </div>
                  <div className="body flex flex-col justify-between flex-1 p-5">
                    <div>
                      <h3 className="font-heading font-semibold text-lg text-[color:var(--ink)] leading-snug">{u.name}</h3>
                      <div className="owner text-xs text-[color:var(--ink-soft)] mt-1">
                        {u.owner} · sejak {u.year}
                      </div>
                    </div>
                    <div className="product text-xs text-[color:var(--ink-soft)] mt-3 pt-3 border-t border-[color:var(--line)]">
                      <b className="text-[color:var(--forest-deep)] font-semibold">Produk:</b> {u.product}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })
        ) : (
          <div className="empty-state col-span-full">
            Tidak ada UMKM yang cocok dengan pencarian atau filter ini.
          </div>
        )}
      </div>

      {/* PAGINATION ARROWS */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            aria-label="Halaman sebelumnya"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              border: "1px solid var(--line)",
              background: safePage === 1 ? "var(--parchment-2)" : "var(--card)",
              cursor: safePage === 1 ? "not-allowed" : "pointer",
              opacity: safePage === 1 ? 0.4 : 1,
              transition: "background 0.15s, opacity 0.15s",
              flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                aria-label={`Halaman ${page}`}
                aria-current={page === safePage ? "page" : undefined}
                style={{
                  width: page === safePage ? "36px" : "32px",
                  height: page === safePage ? "36px" : "32px",
                  borderRadius: "50%",
                  border: "1px solid var(--line)",
                  background: page === safePage ? "var(--forest)" : "var(--card)",
                  color: page === safePage ? "#fff" : "var(--ink)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  fontWeight: page === safePage ? 700 : 400,
                  cursor: "pointer",
                  transition: "background 0.15s, transform 0.1s",
                  transform: page === safePage ? "scale(1.05)" : "none",
                  flexShrink: 0,
                }}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            aria-label="Halaman berikutnya"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              border: "1px solid var(--line)",
              background: safePage === totalPages ? "var(--parchment-2)" : "var(--card)",
              cursor: safePage === totalPages ? "not-allowed" : "pointer",
              opacity: safePage === totalPages ? 0.4 : 1,
              transition: "background 0.15s, opacity 0.15s",
              flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

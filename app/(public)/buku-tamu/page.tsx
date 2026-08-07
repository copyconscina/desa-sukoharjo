import { Metadata } from "next";
import { getBukuTamuList } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BukuTamuClient from "./BukuTamuClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

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
          <h1 className="font-heading font-semibold tracking-[-0.01em]">Buku Tamu Warga & Pengunjung</h1>
          <p>
            Sampaikan saran, kesan, pesan, atau salam hangat Anda untuk Pemerintah Desa dan warga Desa Sukoharjo.
          </p>
        </div>
      </header>

      <BukuTamuClient initialList={guestbook} />
    </div>
  );
}

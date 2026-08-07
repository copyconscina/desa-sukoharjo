"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Pengaduan } from "@/lib/data";
import { addPengaduanPublicAction, uploadPublicFotoAction } from "@/app/admin/actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  initialList: Pengaduan[];
}

export default function PengaduanClient({ initialList }: Props) {
  const [list, setList] = useState<Pengaduan[]>(initialList);
  const [nama, setNama] = useState("");
  const [dusun, setDusun] = useState("");
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 15 * 1024 * 1024) {
        setError("Ukuran foto tidak boleh melebihi 15MB.");
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!judul.trim() || !isi.trim()) {
      setError("Judul dan Rincian Laporan wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      let uploadedFotoUrl: string | undefined = undefined;

      // 1. Upload photo if citizen attached one (compressed by sharp, 15MB limit, all formats supported, NO cropping)
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await uploadPublicFotoAction(formData);
        if (!uploadRes.success || !uploadRes.url) {
          setError(uploadRes.error || "Gagal mengunggah foto bukti pengaduan.");
          setLoading(false);
          return;
        }
        uploadedFotoUrl = uploadRes.url;
      }

      // 2. Submit complaint
      const res = await addPengaduanPublicAction(nama, dusun, judul, isi, uploadedFotoUrl);
      if (res.success && res.item) {
        setList([res.item, ...list]);
        setSuccess("Laporan pengaduan Anda telah berhasil terkirim dan akan ditindaklanjuti Pemerintah Desa.");
        setNama("");
        setDusun("");
        setJudul("");
        setIsi("");
        setFile(null);
        setPreviewUrl(null);
        
        const fileInput = document.getElementById("publicPengaduanFileInput") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        setError(res.error || "Gagal mengirim pengaduan.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Terjadi kesalahan saat mengirim pengaduan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="block">
      <div className="wrap two-col">
        {/* FORM PENGADUAN */}
        <Card className="card shadow-none border border-[color:var(--line)] p-6 bg-[color:var(--card)]">
          <h2 className="font-heading font-semibold text-2xl mb-2 text-[color:var(--ink)]">Laporan / Pengaduan Baru</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-mono text-[color:var(--ink-soft)] mb-1">
                Nama Pelapor 
              </label>
              <Input
                type="text"
                placeholder="Nama Anda atau biarkan kosong jika Anonim"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment)] text-sm focus:outline-none focus:border-[color:var(--forest)]"
              />
            </div>

            <div>
              <label className="block text-sm font-mono text-[color:var(--ink-soft)] mb-1">
                Dusun / Alamat Pelapor
              </label>
              <Input
                type="text"
                placeholder="Contoh: Dusun Sukoharjo / RT 02 RW 02"
                value={dusun}
                onChange={(e) => setDusun(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment)] text-sm focus:outline-none focus:border-[color:var(--forest)]"
              />
            </div>

            <div>
              <label className="block text-sm font-mono text-[color:var(--ink-soft)] mb-1">
                Judul Laporan *
              </label>
              <Input
                type="text"
                placeholder="Ringkasan singkat masalah"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment)] text-sm focus:outline-none focus:border-[color:var(--forest)]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-mono text-[color:var(--ink-soft)] mb-1">
                Rincian Laporan & Lokasi *
              </label>
              <Textarea
                rows={4}
                placeholder="Jelaskan detail lokasi dan permasalahan yang dialami..."
                value={isi}
                onChange={(e) => setIsi(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment)] text-sm focus:outline-none focus:border-[color:var(--forest)] resize-none"
                required
              />
            </div>

            {/* FOTO BUKTI PENGADUAN (NO CROPPING) */}
            <div>
              <label className="block text-sm font-mono text-[color:var(--ink-soft)] mb-1">
                Foto Bukti / Lampiran (Opsional)
              </label>
              <input
                type="file"
                id="publicPengaduanFileInput"
                accept="image/*,.jpg,.jpeg,.png,.webp,.jfif,.avif,.heic"
                onChange={handleFileChange}
                className="w-full text-xs text-[color:var(--ink-soft)]
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border file:border-[color:var(--line)]
                  file:text-xs file:font-semibold
                  file:bg-[color:var(--parchment)] file:text-[color:var(--forest)]
                  hover:file:bg-[color:var(--line)] cursor-pointer"
              />
            </div>

            {previewUrl && (
              <div className="mt-1">
                <span className="block text-[11px] font-mono text-[color:var(--ink-soft)] uppercase mb-1">Preview Lampiran Foto:</span>
                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[color:var(--line)] bg-slate-900/10">
                  <Image src={previewUrl} alt="Preview Bukti" fill className="object-cover" />
                </div>
              </div>
            )}

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
              {loading ? "Mengirim Laporan..." : "Kirim Pengaduan Warga"}
            </Button>
          </form>
        </Card>

        {/* LIST ADUAN TERBARU */}
        <div className="flex flex-col gap-4">
          <h3 className="font-heading text-xl text-[color:var(--ink)]">
            Daftar Laporan Terkini ({list.length})
          </h3>
          {list.length === 0 ? (
            <Card className="p-6 text-center text-sm text-[color:var(--ink-soft)] border border-[color:var(--line)]">
              Belum ada laporan pengaduan warga.
            </Card>
          ) : (
            list.map((aduan) => {
              const fotoUrl = aduan.foto || aduan.image;
              return (
                <Card key={aduan.id} className="card shadow-none border border-[color:var(--line)] bg-[color:var(--card)] flex flex-col" style={{ padding: "12px 16px", gap: "4px" }}>
                  <div className="flex justify-between items-center gap-2 m-0 p-0">
                    <Badge className={`border-none text-[10px] px-2 py-0.5 ${aduan.status === 'Selesai' ? 'bg-[color:var(--forest)]' : aduan.status === 'Diproses' ? 'bg-amber-600' : 'bg-[color:var(--clay)]'} text-white`}>
                      {aduan.status}
                    </Badge>
                    <span className="text-[11px] font-mono text-[color:var(--ink-soft)]">{aduan.tanggal}</span>
                  </div>
                  <h4 className="font-semibold text-[color:var(--ink)] text-sm md:text-base leading-snug m-0 p-0 mt-0.5">{aduan.judul}</h4>
                  <p className="text-[11px] font-mono text-[color:var(--ink-soft)] m-0 p-0">
                    Pelapor: {aduan.nama} · Dusun: {aduan.dusun}
                  </p>
                  <p className="text-xs md:text-sm text-[color:var(--ink-soft)] leading-relaxed m-0 p-0 mt-1">{aduan.isi}</p>
                  
                  {fotoUrl && (
                    <div className="mt-2 relative w-full h-36 rounded-lg overflow-hidden border border-[color:var(--line)]">
                      <Image src={fotoUrl} alt={aduan.judul} fill className="object-cover" />
                    </div>
                  )}

                  {aduan.tanggapan && (
                    <div className="mt-2 text-xs bg-[color:var(--forest)]/10 text-[color:var(--forest-deep)] p-2 rounded-lg border border-[color:var(--forest)]/20">
                      <strong>Tanggapan Resmi Desa:</strong> {aduan.tanggapan}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

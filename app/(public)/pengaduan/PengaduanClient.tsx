"use client";

import React, { useState } from "react";
import Image from "next/image";
import { addPengaduanPublicAction, uploadPublicFotoAction } from "@/app/admin/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MAX_UPLOAD_FILE_BYTES, MAX_UPLOAD_FILE_LABEL } from "@/lib/upload-limits";

export default function PengaduanClient() {
  const [nama, setNama] = useState("");
  const [dusun, setDusun] = useState("");
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > MAX_UPLOAD_FILE_BYTES) {
      setError(`Ukuran foto tidak boleh melebihi ${MAX_UPLOAD_FILE_LABEL}.`);
      e.target.value = "";
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!judul.trim() || !isi.trim()) {
      setError("Judul dan rincian laporan wajib diisi.");
      return;
    }

    if (!consent) {
      setError("Persetujuan pemrosesan data wajib dicentang sebelum mengirim laporan.");
      return;
    }

    setLoading(true);

    try {
      let uploadedFotoUrl: string | undefined;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await uploadPublicFotoAction(formData);
        if (!uploadRes.success || !uploadRes.url) {
          setError(uploadRes.error || "Gagal mengunggah foto bukti pengaduan.");
          return;
        }
        uploadedFotoUrl = uploadRes.url;
      }

      const res = await addPengaduanPublicAction(
        nama,
        dusun,
        judul,
        isi,
        uploadedFotoUrl,
        consent,
      );

      if (res.success && res.item) {
        setSuccess("Laporan pengaduan Anda berhasil terkirim dan akan diverifikasi Pemerintah Desa.");
        setNama("");
        setDusun("");
        setJudul("");
        setIsi("");
        setFile(null);
        setPreviewUrl(null);
        setConsent(false);

        const fileInput = document.getElementById("publicPengaduanFileInput") as HTMLInputElement | null;
        if (fileInput) fileInput.value = "";
      } else {
        setError(res.error || "Gagal mengirim pengaduan.");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat mengirim pengaduan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="block">
      <div className="wrap two-col">
        <Card className="card shadow-none border border-[color:var(--line)] p-6 bg-[color:var(--card)]">
          <h2 className="font-heading font-semibold text-2xl mb-2 text-[color:var(--ink)]">
            Laporan / Pengaduan Baru
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-mono text-[color:var(--ink-soft)] mb-1">
                Nama Pelapor
              </label>
              <Input
                type="text"
                placeholder="Nama Anda atau biarkan kosong jika anonim"
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
              <p className="mt-1 text-[11px] text-[color:var(--ink-soft)]">
                Maksimal {MAX_UPLOAD_FILE_LABEL}.
              </p>
            </div>

            {previewUrl && (
              <div className="mt-1">
                <span className="block text-[11px] font-mono text-[color:var(--ink-soft)] uppercase mb-1">
                  Preview Lampiran Foto:
                </span>
                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[color:var(--line)] bg-slate-900/10">
                  <Image src={previewUrl} alt="Preview bukti" fill className="object-cover" />
                </div>
              </div>
            )}

            <div className="rounded-lg border border-[color:var(--line)] bg-[color:var(--parchment)] p-3 text-xs leading-relaxed text-[color:var(--ink-soft)]">
              Foto dan data pengaduan disimpan di penyimpanan cloud dan hanya digunakan Pemerintah Desa untuk menindaklanjuti laporan.
            </div>
            <label className="flex gap-2 items-start text-xs leading-relaxed text-[color:var(--ink-soft)] cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5"
                required
              />
              <span>
                Saya menyetujui pemrosesan data laporan saya sesuai{" "}
                <a href="/kebijakan-privasi" className="underline">
                  Kebijakan Privasi
                </a>
                .
              </span>
            </label>

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

        <div className="flex flex-col gap-4">
          <h3 className="font-heading font-semibold text-xl text-[color:var(--ink)]">
            Privasi Laporan Anda
          </h3>
          <Card className="card shadow-none border border-[color:var(--line)] bg-[color:var(--card)] p-6">
            <p className="text-sm leading-relaxed text-[color:var(--ink-soft)]">
              Detail laporan, identitas pelapor, dan foto bukti tidak ditampilkan di halaman publik. Data hanya dapat diakses oleh petugas atau admin desa untuk proses verifikasi dan tindak lanjut.
            </p>
            <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
              Setelah laporan terkirim, pemerintah desa akan meninjau laporan melalui panel admin. Publikasi tindak lanjut sebaiknya dilakukan lewat berita atau pengumuman tanpa memuat data pribadi warga.
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  EXPORT_MODULES,
  buildExportFilename,
  type ExportData,
  type ExportModuleKey,
  type ExportSelection,
} from "@/lib/pdf/generateLaporanPdf";

type Props = {
  data: ExportData;
};

const defaultSelection: ExportSelection = {
  profil: true,
  layanan: true,
  transparansi: true,
  berita: true,
  umkm: true,
  galeri: true,
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="3" stroke="currentColor" width="13" height="13">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function ExportClientPage({ data }: Props) {
  const [selection, setSelection] = useState<ExportSelection>(defaultSelection);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const counts: Record<ExportModuleKey, number> = useMemo(
    () => ({
      profil: data.lembagaList.length + data.potensiList.length + 1,
      layanan: data.agendaList.length + data.pengaduanList.length + data.bukuTamuList.length,
      transparansi:
        data.apbdesBidangList.length +
        data.produkHukumList.length +
        data.statistikPenduduk.dusunList.length +
        1,
      berita: data.beritaList.length,
      umkm: data.umkmList.length,
      galeri: data.galeriList.length,
    }),
    [data]
  );

  const totalSelected = EXPORT_MODULES.filter((m) => selection[m.key]).length;
  const allSelected = totalSelected === EXPORT_MODULES.length;
  const noneSelected = totalSelected === 0;

  function toggleModule(key: ExportModuleKey) {
    setSelection((prev) => ({ ...prev, [key]: !prev[key] }));
    setSuccessMsg(null);
  }

  function toggleAll() {
    const next = !allSelected;
    setSelection(
      EXPORT_MODULES.reduce((acc, m) => {
        acc[m.key] = next;
        return acc;
      }, {} as ExportSelection)
    );
    setSuccessMsg(null);
  }

  async function handleExport() {
    if (noneSelected) return;
    setIsGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Beri jeda 1 frame supaya UI loading sempat tampil sebelum proses
    // pembuatan PDF yang bersifat sinkron dijalankan.
    await new Promise((resolve) => setTimeout(resolve, 30));

    try {
      const { generateLaporanPdf } = await import("@/lib/pdf/generateLaporanPdf");
      const doc = generateLaporanPdf(data, selection);
      const filename = buildExportFilename(selection);
      doc.save(filename);
      setSuccessMsg(`Berkas "${filename}" berhasil diunduh.`);
    } catch (err) {
      console.error("Gagal membuat PDF ekspor:", err);
      setErrorMsg("Terjadi kesalahan saat membuat berkas PDF. Silakan coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="admin-dashboard flex flex-col gap-8">
      {/* Header */}
      <div className="admin-welcome">
        <p className="eyebrow">Data &amp; Pelaporan</p>
        <h1 className="text-3xl font-heading mt-2" style={{ color: "var(--forest-deep)" }}>
          Ekspor Data ke PDF
        </h1>
        <p className="text-sm text-[color:var(--ink-soft)] mt-1 max-w-2xl">
          Unduh seluruh data website Desa Sukoharjo yang tersimpan di Supabase menjadi satu berkas PDF
          resmi, rapi, dan siap cetak. Pilih modul data yang ingin disertakan, lalu klik &ldquo;Unduh PDF&rdquo;.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Module selection */}
        <Card className="admin-surface border border-[color:var(--line)] p-6 bg-[color:var(--card)] flex flex-col gap-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg" style={{ color: "var(--forest-deep)" }}>
              Pilih Modul Data
            </h3>
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs font-semibold text-[color:var(--forest)] hover:underline cursor-pointer bg-transparent border-none"
            >
              {allSelected ? "Batalkan semua" : "Pilih semua"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXPORT_MODULES.map((mod) => {
              const checked = selection[mod.key];
              return (
                <button
                  type="button"
                  key={mod.key}
                  onClick={() => toggleModule(mod.key)}
                  className={cn(
                    "text-left flex items-start gap-3 p-4 rounded-xl border transition-all duration-150 cursor-pointer",
                    checked
                      ? "border-[color:var(--forest)] bg-[color:var(--forest)]/5"
                      : "border-[color:var(--line)] bg-[color:var(--parchment-2)]/40 hover:border-[color:var(--sawah)]"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors duration-150",
                      checked
                        ? "bg-[color:var(--forest)] border-[color:var(--forest)] text-white"
                        : "border-[color:var(--line)] bg-white text-transparent"
                    )}
                  >
                    <CheckIcon />
                  </span>
                  <span className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-semibold text-[color:var(--ink)]">{mod.label}</span>
                    <span className="text-xs text-[color:var(--ink-soft)]">{mod.desc}</span>
                    <span className="text-[10px] font-mono uppercase tracking-wide text-[color:var(--clay)] mt-1">
                      {counts[mod.key]} entri data
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Summary & action */}
        <Card className="admin-surface border border-[color:var(--line)] p-6 bg-[color:var(--card)] flex flex-col gap-5 sticky top-24">
          <div>
            <h3 className="font-heading text-lg" style={{ color: "var(--forest-deep)" }}>
              Ringkasan Ekspor
            </h3>
            <p className="text-xs text-[color:var(--ink-soft)] mt-1">
              {totalSelected} dari {EXPORT_MODULES.length} modul dipilih
            </p>
          </div>

          <div className="flex flex-col divide-y divide-[color:var(--line)] text-sm">
            {EXPORT_MODULES.map((mod) => (
              <div key={mod.key} className="flex items-center justify-between py-2">
                <span
                  className={cn(
                    "text-[color:var(--ink)]",
                    !selection[mod.key] && "text-[color:var(--ink-soft)] line-through"
                  )}
                >
                  {mod.label}
                </span>
                <span className="text-xs font-mono text-[color:var(--ink-soft)]">{counts[mod.key]}</span>
              </div>
            ))}
          </div>

          {errorMsg && (
            <div className="text-xs font-medium text-white bg-[color:var(--red)] px-3 py-2 rounded-lg">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
              {successMsg}
            </div>
          )}

          <Button
            onClick={handleExport}
            disabled={noneSelected || isGenerating}
            className="w-full justify-center bg-[color:var(--forest)] hover:bg-[color:var(--forest-mid)] text-white py-3 rounded-xl font-semibold"
          >
            {isGenerating ? "Membuat PDF..." : "Unduh PDF"}
          </Button>
          <p className="text-[11px] text-[color:var(--ink-soft)] text-center -mt-2">
            Format A4 · Diproses langsung di peramban Anda, tanpa diunggah ke server lain.
          </p>
        </Card>
      </div>
    </div>
  );
}

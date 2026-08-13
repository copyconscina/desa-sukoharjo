"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
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
import {
  archiveForBackupAction,
  getArchivedItemsAction,
  undoArchiveAction,
} from "@/app/admin/actions";
import type { ArchivedItem, ArchivedItemType } from "@/lib/db";

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

  // ─── Arsip & Backup ke Google Drive ────────────────────────────────────────
  const GDRIVE_BACKUP_URL =
    process.env.NEXT_PUBLIC_GDRIVE_BACKUP_URL;

  const [selectedGaleri, setSelectedGaleri] = useState<Set<number>>(new Set());
  const [selectedUmkm, setSelectedUmkm] = useState<Set<number>>(new Set());
  const [selectedHukum, setSelectedHukum] = useState<Set<number>>(new Set());
  const [confirmBackup, setConfirmBackup] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [archiveSuccess, setArchiveSuccess] = useState<string | null>(null);

  const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>([]);
  const [isLoadingArchive, setIsLoadingArchive] = useState(true);
  const [undoingId, setUndoingId] = useState<string | null>(null);

  const totalArchiveSelected = selectedGaleri.size + selectedUmkm.size + selectedHukum.size;

  const galeriIds = useMemo(
    () => data.galeriList.map((g) => g.id).filter((id): id is number => id != null),
    [data]
  );
  const umkmIds = useMemo(
    () => data.umkmList.map((u) => u.id).filter((id): id is number => id != null),
    [data]
  );
  const hukumIds = useMemo(
    () => data.produkHukumList.map((p) => p.id).filter((id): id is number => id != null),
    [data]
  );

  const allGaleriSelected = galeriIds.length > 0 && galeriIds.every((id) => selectedGaleri.has(id));
  const allUmkmSelected = umkmIds.length > 0 && umkmIds.every((id) => selectedUmkm.has(id));
  const allHukumSelected = hukumIds.length > 0 && hukumIds.every((id) => selectedHukum.has(id));

  function toggleSelectAllArchive(ids: number[], current: Set<number>, setter: (next: Set<number>) => void) {
    setArchiveSuccess(null);
    const allSelected = ids.length > 0 && ids.every((id) => current.has(id));
    setter(allSelected ? new Set() : new Set(ids));
  }

  const loadArchivedItems = useCallback(async () => {
    setIsLoadingArchive(true);
    try {
      const res = await getArchivedItemsAction();
      if (res.success) setArchivedItems(res.items as ArchivedItem[]);
    } catch (err) {
      console.error("Gagal memuat daftar arsip:", err);
    } finally {
      setIsLoadingArchive(false);
    }
  }, []);

  useEffect(() => {
    loadArchivedItems();
  }, [loadArchivedItems]);

  function toggleArchiveItem(type: ArchivedItemType, id: number) {
    setArchiveSuccess(null);
    const setterMap = {
      galeri: [selectedGaleri, setSelectedGaleri] as const,
      umkm: [selectedUmkm, setSelectedUmkm] as const,
      produk_hukum: [selectedHukum, setSelectedHukum] as const,
    };
    const [current, setter] = setterMap[type];
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  }

  async function handleArchiveSubmit() {
    if (totalArchiveSelected === 0 || !confirmBackup) return;
    setIsArchiving(true);
    setArchiveError(null);
    setArchiveSuccess(null);
    try {
      const res = await archiveForBackupAction(
        Array.from(selectedGaleri),
        Array.from(selectedUmkm),
        Array.from(selectedHukum)
      );
      if (res.success) {
        setArchiveSuccess(`${res.archived} item berhasil diarsipkan dan disembunyikan dari website publik.`);
        setSelectedGaleri(new Set());
        setSelectedUmkm(new Set());
        setSelectedHukum(new Set());
        setConfirmBackup(false);
        await loadArchivedItems();
      } else {
        setArchiveError(res.error || "Gagal mengarsipkan item.");
      }
    } catch (err) {
      setArchiveError(err instanceof Error ? err.message : "Gagal mengarsipkan item.");
    } finally {
      setIsArchiving(false);
    }
  }

  async function handleUndo(id: number, type: ArchivedItemType) {
    const key = `${type}-${id}`;
    setUndoingId(key);
    setArchiveError(null);
    try {
      const res = await undoArchiveAction(id, type);
      if (res.success) {
        setArchivedItems((prev) => prev.filter((it) => !(it.id === id && it.type === type)));
      } else {
        setArchiveError(res.error || "Gagal merestore item.");
      }
    } catch (err) {
      setArchiveError(err instanceof Error ? err.message : "Gagal merestore item.");
    } finally {
      setUndoingId(null);
    }
  }

  function daysLeftLabel(purgeAt: string): string {
    const diffMs = new Date(purgeAt).getTime() - Date.now();
    const days = Math.max(0, Math.ceil(diffMs / 86400_000));
    if (days === 0) return "Hari ini dihapus permanen";
    if (days === 1) return "1 hari lagi dihapus permanen";
    return `${days} hari lagi dihapus permanen`;
  }

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

      {/* ─── Arsip & Backup ke Google Drive ─────────────────────────────── */}
      <Card className="admin-surface border border-[color:var(--line)] p-6 bg-[color:var(--card)] flex flex-col gap-5">
        <div>
          <h3 className="font-heading text-lg" style={{ color: "var(--forest-deep)" }}>
            Arsip &amp; Backup Foto/Dokumen ke Google Drive
          </h3>
          <p className="text-sm text-[color:var(--ink-soft)] mt-1 max-w-2xl">
            Cadangkan foto Galeri, UMKM, atau dokumen Produk Hukum ke Google Drive, lalu arsipkan agar
            hilang dari website publik tanpa langsung dihapus. Ada masa tenggang 30 hari untuk membatalkan
            (Undo) sebelum file dihapus permanen.
          </p>
        </div>

        {/* Langkah 1 & 2 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-[color:var(--line)] bg-[color:var(--parchment-2)]/40">
          <div className="flex-1 text-sm text-[color:var(--ink)]">
            <span className="font-semibold">Langkah 1–2:</span> Buka folder Drive, lalu unduh &amp; unggah
            manual file yang ingin dicadangkan.
          </div>
          <a href={GDRIVE_BACKUP_URL} target="_blank" rel="noopener noreferrer">
            <Button
              type="button"
              className="bg-[color:var(--forest)] hover:bg-[color:var(--forest-mid)] text-white rounded-xl font-semibold whitespace-nowrap"
            >
              Buka Folder Drive Backup ↗
            </Button>
          </a>
        </div>

        {/* Langkah 3: pilih item */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-[color:var(--ink)]">
            Langkah 3: Centang item yang sudah dibackup ke Drive
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Galeri */}
            <div className="border border-[color:var(--line)] rounded-xl p-3 flex flex-col gap-2 max-h-64 overflow-y-auto">
              <div className="flex items-center justify-between gap-2 sticky top-0 bg-[color:var(--card)]">
                <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--clay)]">
                  Galeri ({data.galeriList.length})
                </span>
                {data.galeriList.length > 0 && (
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[color:var(--forest)] hover:underline cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      checked={allGaleriSelected}
                      onChange={() =>
                        toggleSelectAllArchive(galeriIds, selectedGaleri, setSelectedGaleri)
                      }
                      className="accent-[color:var(--forest)]"
                    />
                    {allGaleriSelected ? "Batalkan" : "Pilih semua"}
                  </label>
                )}
              </div>
              {data.galeriList.length === 0 && (
                <span className="text-xs text-[color:var(--ink-soft)]">Tidak ada item.</span>
              )}
              {data.galeriList.map((g) => (
                <label key={`galeri-${g.id}`} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={g.id != null && selectedGaleri.has(g.id)}
                    onChange={() => g.id != null && toggleArchiveItem("galeri", g.id)}
                    className="accent-[color:var(--forest)]"
                  />
                  <span className="truncate" title={g.label}>{g.label}</span>
                </label>
              ))}
            </div>

            {/* UMKM */}
            <div className="border border-[color:var(--line)] rounded-xl p-3 flex flex-col gap-2 max-h-64 overflow-y-auto">
              <div className="flex items-center justify-between gap-2 sticky top-0 bg-[color:var(--card)]">
                <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--clay)]">
                  UMKM ({data.umkmList.length})
                </span>
                {data.umkmList.length > 0 && (
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[color:var(--forest)] hover:underline cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      checked={allUmkmSelected}
                      onChange={() => toggleSelectAllArchive(umkmIds, selectedUmkm, setSelectedUmkm)}
                      className="accent-[color:var(--forest)]"
                    />
                    {allUmkmSelected ? "Batalkan" : "Pilih semua"}
                  </label>
                )}
              </div>
              {data.umkmList.length === 0 && (
                <span className="text-xs text-[color:var(--ink-soft)]">Tidak ada item.</span>
              )}
              {data.umkmList.map((u) => (
                <label key={`umkm-${u.id}`} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={u.id != null && selectedUmkm.has(u.id)}
                    onChange={() => u.id != null && toggleArchiveItem("umkm", u.id)}
                    className="accent-[color:var(--forest)]"
                  />
                  <span className="truncate" title={u.name}>{u.name}</span>
                </label>
              ))}
            </div>

            {/* Produk Hukum */}
            <div className="border border-[color:var(--line)] rounded-xl p-3 flex flex-col gap-2 max-h-64 overflow-y-auto">
              <div className="flex items-center justify-between gap-2 sticky top-0 bg-[color:var(--card)]">
                <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--clay)]">
                  Produk Hukum ({data.produkHukumList.length})
                </span>
                {data.produkHukumList.length > 0 && (
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[color:var(--forest)] hover:underline cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      checked={allHukumSelected}
                      onChange={() => toggleSelectAllArchive(hukumIds, selectedHukum, setSelectedHukum)}
                      className="accent-[color:var(--forest)]"
                    />
                    {allHukumSelected ? "Batalkan" : "Pilih semua"}
                  </label>
                )}
              </div>
              {data.produkHukumList.length === 0 && (
                <span className="text-xs text-[color:var(--ink-soft)]">Tidak ada item.</span>
              )}
              {data.produkHukumList.map((p) => (
                <label key={`hukum-${p.id}`} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={p.id != null && selectedHukum.has(p.id)}
                    onChange={() => p.id != null && toggleArchiveItem("produk_hukum", p.id)}
                    className="accent-[color:var(--forest)]"
                  />
                  <span className="truncate" title={p.judul}>{p.judul}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={confirmBackup}
              onChange={(e) => setConfirmBackup(e.target.checked)}
              className="mt-0.5 accent-[color:var(--forest)]"
            />
            <span className="text-[color:var(--ink)]">
              Saya sudah mem-backup manual seluruh item yang dicentang di atas ke Google Drive.
            </span>
          </label>

          {archiveError && (
            <div className="text-xs font-medium text-white bg-[color:var(--red)] px-3 py-2 rounded-lg">
              {archiveError}
            </div>
          )}
          {archiveSuccess && (
            <div className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
              {archiveSuccess}
            </div>
          )}

          <Button
            type="button"
            onClick={handleArchiveSubmit}
            disabled={totalArchiveSelected === 0 || !confirmBackup || isArchiving}
            className="self-start bg-[color:var(--forest)] hover:bg-[color:var(--forest-mid)] text-white px-6 py-2.5 rounded-xl font-semibold"
          >
            {isArchiving ? "Mengarsipkan..." : `Arsipkan ${totalArchiveSelected > 0 ? `(${totalArchiveSelected}) ` : ""}Item`}
          </Button>
        </div>

        {/* Daftar item yang sedang diarsipkan + Undo */}
        <div className="flex flex-col gap-2 pt-4 border-t border-[color:var(--line)]">
          <p className="text-sm font-semibold text-[color:var(--ink)]">
            Item dalam Arsip (bisa di-undo sebelum dihapus permanen)
          </p>
          {isLoadingArchive ? (
            <span className="text-xs text-[color:var(--ink-soft)]">Memuat daftar arsip...</span>
          ) : archivedItems.length === 0 ? (
            <span className="text-xs text-[color:var(--ink-soft)]">Belum ada item yang diarsipkan.</span>
          ) : (
            <div className="flex flex-col divide-y divide-[color:var(--line)]">
              {archivedItems.map((item) => {
                const key = `${item.type}-${item.id}`;
                return (
                  <div key={key} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[color:var(--ink)] truncate">{item.label}</p>
                      <p className="text-[11px] text-[color:var(--ink-soft)]">
                        {item.type === "galeri" ? "Galeri" : item.type === "umkm" ? "UMKM" : "Produk Hukum"}
                        {" · "}
                        {daysLeftLabel(item.purgeAt)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleUndo(item.id, item.type)}
                      disabled={undoingId === key}
                      className="shrink-0 bg-white border border-[color:var(--forest)] text-[color:var(--forest)] hover:bg-[color:var(--forest)]/10 px-4 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      {undoingId === key ? "Memproses..." : "Undo"}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

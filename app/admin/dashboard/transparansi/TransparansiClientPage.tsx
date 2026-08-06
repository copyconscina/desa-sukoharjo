"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ApbdesRingkasan,
  ApbdesBidang,
  ProdukHukum,
  StatistikPenduduk,
} from "@/lib/data";
import {
  updateApbdesRingkasanAction,
  saveApbdesBidangAction,
  deleteApbdesBidangAction,
  saveProdukHukumAction,
  deleteProdukHukumAction,
  updateStatistikPendudukAction,
  uploadPdfAction,
} from "@/app/admin/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ConfirmModal from "@/components/ConfirmModal";

interface Props {
  initialRingkasan: ApbdesRingkasan;
  initialBidangList: ApbdesBidang[];
  initialProdukHukum: ProdukHukum[];
  initialStatistik: StatistikPenduduk;
}

export default function TransparansiClientPage({
  initialRingkasan,
  initialBidangList,
  initialProdukHukum,
  initialStatistik,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"apbdes" | "produkhukum" | "statistik">("apbdes");

  // State
  const [ringkasan, setRingkasan] = useState<ApbdesRingkasan>(initialRingkasan);
  const [bidangList, setBidangList] = useState<ApbdesBidang[]>(initialBidangList);
  const [produkHukumList, setProdukHukumList] = useState<ProdukHukum[]>(initialProdukHukum);
  const [statistik, setStatistik] = useState<StatistikPenduduk>(initialStatistik);

  // Ringkasan & Bidang state
  const [isRingkasanSaving, setIsRingkasanSaving] = useState(false);
  const [editingBidang, setEditingBidang] = useState<Partial<ApbdesBidang> | null>(null);
  const [isBidangModalOpen, setIsBidangModalOpen] = useState(false);

  // Produk Hukum state
  const [editingProdukHukum, setEditingProdukHukum] = useState<Partial<ProdukHukum> | null>(null);
  const [isProdukHukumModalOpen, setIsProdukHukumModalOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isProdukHukumSaving, setIsProdukHukumSaving] = useState(false);

  // Statistik state
  const [isStatistikSaving, setIsStatistikSaving] = useState(false);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // --- HANDLERS APBDES ---
  const promptSaveRingkasan = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi APBDes Ringkasan",
      message: "Apakah Anda yakin ingin menyimpan perubahan ringkasan APBDes?",
      onConfirm: executeSaveRingkasan,
    });
  };

  const executeSaveRingkasan = async () => {
    setIsRingkasanSaving(true);
    try {
      await updateApbdesRingkasanAction(ringkasan);
      alert("Ringkasan APBDes berhasil diperbarui dan tersimpan!");
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      router.refresh();
    } catch (err: any) {
      alert("Gagal menyimpan APBDes: " + err.message);
    } finally {
      setIsRingkasanSaving(false);
    }
  };

  const promptSaveBidang = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBidang?.name) {
      alert("Nama bidang belanja wajib diisi!");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: editingBidang.id ? "Konfirmasi Edit Bidang APBDes" : "Konfirmasi Bidang APBDes Baru",
      message: `Apakah Anda yakin ingin menyimpan bidang belanja "${editingBidang.name}"?`,
      onConfirm: executeSaveBidang,
    });
  };

  const executeSaveBidang = async () => {
    if (!editingBidang?.name) return;
    try {
      const res = await saveApbdesBidangAction({
        id: editingBidang.id,
        name: editingBidang.name || "",
        anggaran: editingBidang.anggaran || "Rp 0",
        realisasi: editingBidang.realisasi || "Rp 0",
        pct: editingBidang.pct || "0%",
        desc: editingBidang.desc || "",
      });
      if (res.success && res.item) {
        if (editingBidang.id) {
          setBidangList(bidangList.map((b) => (b.id === res.item.id ? res.item : b)));
        } else {
          setBidangList([...bidangList, res.item]);
        }
        setIsBidangModalOpen(false);
        setEditingBidang(null);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        alert(`Bidang belanja "${res.item.name}" berhasil disimpan!`);
        router.refresh();
      }
    } catch (err: any) {
      alert("Gagal menyimpan bidang belanja: " + err.message);
    }
  };

  const handleDeleteBidang = async (id: number, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Hapus Bidang APBDes",
      message: `Apakah Anda yakin ingin menghapus bidang belanja "${name}"?`,
      onConfirm: async () => {
        await deleteApbdesBidangAction(id);
        setBidangList(bidangList.filter((b) => b.id !== id));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        alert("Bidang belanja berhasil dihapus!");
        router.refresh();
      },
    });
  };

  // --- HANDLERS PRODUK HUKUM ---
  const promptSaveProdukHukum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProdukHukum?.judul) {
      alert("Judul dokumen wajib diisi!");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: editingProdukHukum.id ? "Konfirmasi Edit Produk Hukum" : "Konfirmasi Produk Hukum Baru",
      message: `Apakah Anda yakin ingin menyimpan dokumen produk hukum "${editingProdukHukum.judul}"?`,
      onConfirm: executeSaveProdukHukum,
    });
  };

  const executeSaveProdukHukum = async () => {
    if (!editingProdukHukum?.judul) return;
    setIsProdukHukumSaving(true);
    try {
      let finalFileUrl = editingProdukHukum.fileUrl || "";

      if (pdfFile) {
        setIsUploadingPdf(true);
        const formData = new FormData();
        formData.append("file", pdfFile);
        const uploadRes = await uploadPdfAction(formData);
        if (uploadRes.success && uploadRes.url) {
          finalFileUrl = uploadRes.url;
        }
      }

      const res = await saveProdukHukumAction({
        id: editingProdukHukum.id,
        nomor: editingProdukHukum.nomor || "",
        judul: editingProdukHukum.judul || "",
        kategori: editingProdukHukum.kategori || "Peraturan Desa",
        tanggal: editingProdukHukum.tanggal || new Date().toLocaleDateString("id-ID"),
        fileUrl: finalFileUrl,
      });
      if (res.success && res.item) {
        if (editingProdukHukum.id) {
          setProdukHukumList(produkHukumList.map((p) => (p.id === res.item.id ? res.item : p)));
        } else {
          setProdukHukumList([res.item, ...produkHukumList]);
        }
        setIsProdukHukumModalOpen(false);
        setEditingProdukHukum(null);
        setPdfFile(null);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        alert(`Produk hukum "${res.item.judul}" berhasil disimpan!`);
        router.refresh();
      }
    } catch (err: any) {
      alert("Gagal menyimpan produk hukum: " + err.message);
    } finally {
      setIsUploadingPdf(false);
      setIsProdukHukumSaving(false);
    }
  };

  const handleDeleteProdukHukum = async (id: number, judul: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Hapus Produk Hukum",
      message: `Apakah Anda yakin ingin menghapus produk hukum "${judul}"?`,
      onConfirm: async () => {
        await deleteProdukHukumAction(id);
        setProdukHukumList(produkHukumList.filter((p) => p.id !== id));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        alert("Dokumen berhasil dihapus!");
        router.refresh();
      },
    });
  };

  // --- HANDLERS STATISTIK ---
  const promptSaveStatistik = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Statistik Kependudukan",
      message: "Apakah Anda yakin ingin menyimpan perubahan data statistik kependudukan?",
      onConfirm: executeSaveStatistik,
    });
  };

  const executeSaveStatistik = async () => {
    setIsStatistikSaving(true);
    try {
      await updateStatistikPendudukAction(statistik);
      alert("Statistik kependudukan berhasil disimpan!");
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      router.refresh();
    } catch (err: any) {
      alert("Gagal menyimpan statistik: " + err.message);
    } finally {
      setIsStatistikSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <p className="eyebrow">Kelola Transparansi Desa</p>
        <h1 className="text-3xl font-heading mt-1" style={{ color: "var(--forest-deep)" }}>
          APBDes, Produk Hukum & Statistik Kependudukan
        </h1>
        <p className="text-sm text-[color:var(--ink-soft)] mt-1">
          Kelola transparansi keuangan APBDes, arsip Peraturan Desa / SK Kades, serta demografi statistik kependudukan.
        </p>
      </div>

      {/* TABS */}
      <div className="flex border-b border-[color:var(--line)] gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("apbdes")}
          className={`pb-3 px-2 font-medium text-sm border-b-2 transition-colors duration-200 cursor-pointer ${
            activeTab === "apbdes"
              ? "border-[color:var(--forest)] text-[color:var(--forest)] font-semibold"
              : "border-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
          }`}
        >
          💰 APBDes & Keuangan
        </button>
        <button
          onClick={() => setActiveTab("produkhukum")}
          className={`pb-3 px-2 font-medium text-sm border-b-2 transition-colors duration-200 cursor-pointer ${
            activeTab === "produkhukum"
              ? "border-[color:var(--forest)] text-[color:var(--forest)] font-semibold"
              : "border-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
          }`}
        >
          📜 Produk Hukum Desa
        </button>
        <button
          onClick={() => setActiveTab("statistik")}
          className={`pb-3 px-2 font-medium text-sm border-b-2 transition-colors duration-200 cursor-pointer ${
            activeTab === "statistik"
              ? "border-[color:var(--forest)] text-[color:var(--forest)] font-semibold"
              : "border-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
          }`}
        >
          📊 Statistik Kependudukan
        </button>
      </div>

      {/* TAB 1: APBDES */}
      {activeTab === "apbdes" && (
        <div className="flex flex-col gap-6">
          {/* Ringkasan Form */}
          <Card className="p-6 border border-[color:var(--line)] shadow-sm bg-[color:var(--card)]">
            <h3 className="text-lg font-heading mb-4 text-[color:var(--ink)]">Ringkasan APBDes TA {ringkasan.tahun}</h3>
            <form onSubmit={promptSaveRingkasan} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[color:var(--ink-soft)] mb-1">Tahun Anggaran</label>
                <input
                  type="number"
                  value={ringkasan.tahun}
                  onChange={(e) => setRingkasan({ ...ringkasan, tahun: parseInt(e.target.value) || 2026 })}
                  className="w-full px-3 py-2 border border-[color:var(--line)] rounded-lg text-sm bg-[color:var(--parchment)]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-[color:var(--ink-soft)] mb-1">Total Pendapatan</label>
                <input
                  type="text"
                  value={ringkasan.pendapatan}
                  onChange={(e) => setRingkasan({ ...ringkasan, pendapatan: e.target.value })}
                  className="w-full px-3 py-2 border border-[color:var(--line)] rounded-lg text-sm bg-[color:var(--parchment)]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-[color:var(--ink-soft)] mb-1">Total Belanja</label>
                <input
                  type="text"
                  value={ringkasan.belanja}
                  onChange={(e) => setRingkasan({ ...ringkasan, belanja: e.target.value })}
                  className="w-full px-3 py-2 border border-[color:var(--line)] rounded-lg text-sm bg-[color:var(--parchment)]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-[color:var(--ink-soft)] mb-1">Pembiayaan</label>
                <input
                  type="text"
                  value={ringkasan.pembiayaan}
                  onChange={(e) => setRingkasan({ ...ringkasan, pembiayaan: e.target.value })}
                  className="w-full px-3 py-2 border border-[color:var(--line)] rounded-lg text-sm bg-[color:var(--parchment)]"
                />
              </div>
              <div className="md:col-span-4 flex justify-end">
                <Button type="submit" disabled={isRingkasanSaving} className="btn btn-primary bg-[color:var(--forest)] text-white border-none px-6">
                  {isRingkasanSaving ? "Menyimpan..." : "Simpan Ringkasan APBDes"}
                </Button>
              </div>
            </form>
          </Card>

          {/* Bidang Belanja Table */}
          <Card className="p-6 border border-[color:var(--line)] shadow-sm bg-[color:var(--card)] flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-heading text-[color:var(--ink)]">Rincian Realisasi Belanja per Bidang</h3>
              <Button
                onClick={() => {
                  setEditingBidang({ name: "", anggaran: "", realisasi: "", pct: "", desc: "" });
                  setIsBidangModalOpen(true);
                }}
                className="btn btn-primary bg-[color:var(--forest)] text-white border-none text-xs"
              >
                + Tambah Bidang Belanja
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              {bidangList.map((b) => (
                <div key={b.id} className="p-4 border border-[color:var(--line)] rounded-xl bg-[color:var(--parchment)] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <h4 className="font-heading font-semibold text-base text-[color:var(--ink)]">{b.name}</h4>
                    <p className="text-xs text-[color:var(--ink-soft)] mt-1">{b.desc}</p>
                    <div className="flex gap-4 mt-2 text-xs font-mono">
                      <span>Anggaran: <strong>{b.anggaran}</strong></span>
                      <span>Realisasi: <strong className="text-[color:var(--forest)]">{b.realisasi} ({b.pct})</strong></span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setEditingBidang(b);
                        setIsBidangModalOpen(true);
                      }}
                      variant="outline"
                      className="text-xs border-[color:var(--line)] px-3 py-1"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteBidang(b.id, b.name)}
                      variant="outline"
                      className="text-xs border-red-200 text-red-600 hover:bg-red-50 px-3 py-1"
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: PRODUK HUKUM */}
      {activeTab === "produkhukum" && (
        <Card className="p-6 border border-[color:var(--line)] shadow-sm bg-[color:var(--card)] flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-heading text-[color:var(--ink)]">Daftar Peraturan Desa & SK Kades</h3>
            <Button
              onClick={() => {
                setEditingProdukHukum({ nomor: "", judul: "", kategori: "Peraturan Desa", tanggal: "", fileUrl: "" });
                setIsProdukHukumModalOpen(true);
              }}
              className="btn btn-primary bg-[color:var(--forest)] text-white border-none text-xs"
            >
              + Tambah Dokumen Hukum
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {produkHukumList.map((doc) => (
              <div key={doc.id} className="p-4 border border-[color:var(--line)] rounded-xl bg-[color:var(--parchment)] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-[color:var(--clay)] text-white border-none text-xs">{doc.kategori}</Badge>
                    <span className="font-mono text-xs text-[color:var(--ink-soft)]">{doc.nomor}</span>
                  </div>
                  <h4 className="font-heading font-semibold text-base text-[color:var(--ink)]">{doc.judul}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-mono text-[color:var(--ink-soft)]">Ditetapkan: {doc.tanggal}</span>
                    {doc.fileUrl ? (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-[color:var(--forest)] hover:underline inline-flex items-center gap-1"
                      >
                        📄 Lihat Dokumen PDF
                      </a>
                    ) : (
                      <span className="text-xs text-amber-600 font-mono">⚠️ Belum Ada PDF</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {doc.fileUrl && (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline text-xs border-[color:var(--line)] px-3 py-1 inline-flex items-center gap-1"
                    >
                      📄 PDF
                    </a>
                  )}
                  <Button
                    onClick={() => {
                      setEditingProdukHukum(doc);
                      setPdfFile(null);
                      setIsProdukHukumModalOpen(true);
                    }}
                    variant="outline"
                    className="text-xs border-[color:var(--line)] px-3 py-1"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteProdukHukum(doc.id, doc.judul)}
                    variant="outline"
                    className="text-xs border-red-200 text-red-600 hover:bg-red-50 px-3 py-1"
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 3: STATISTIK KEPENDUDUKAN */}
      {activeTab === "statistik" && (
        <Card className="p-6 border border-[color:var(--line)] shadow-sm bg-[color:var(--card)] flex flex-col gap-6">
          <h3 className="text-lg font-heading text-[color:var(--ink)]">Kelola Statistik Kependudukan Publik</h3>
          <form onSubmit={promptSaveStatistik} className="flex flex-col gap-8">
            
            {/* 1. REKAP TOTAL */}
            <div>
              <h4 className="font-heading font-semibold text-sm mb-3 text-[color:var(--ink)] border-b pb-2">1. Rekapitulasi Penduduk Utama</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[color:var(--ink-soft)] mb-1">Total Penduduk (Jiwa)</label>
                  <input
                    type="number"
                    value={statistik.totalPenduduk}
                    onChange={(e) => setStatistik({ ...statistik, totalPenduduk: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-[color:var(--line)] rounded-lg text-sm bg-[color:var(--parchment)] font-bold text-[color:var(--forest)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[color:var(--ink-soft)] mb-1">Total KK</label>
                  <input
                    type="number"
                    value={statistik.totalKk}
                    onChange={(e) => setStatistik({ ...statistik, totalKk: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-[color:var(--line)] rounded-lg text-sm bg-[color:var(--parchment)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[color:var(--ink-soft)] mb-1">Laki-Laki (Jiwa)</label>
                  <input
                    type="number"
                    value={statistik.lakiLaki}
                    onChange={(e) => setStatistik({ ...statistik, lakiLaki: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-[color:var(--line)] rounded-lg text-sm bg-[color:var(--parchment)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[color:var(--ink-soft)] mb-1">Perempuan (Jiwa)</label>
                  <input
                    type="number"
                    value={statistik.perempuan}
                    onChange={(e) => setStatistik({ ...statistik, perempuan: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-[color:var(--line)] rounded-lg text-sm bg-[color:var(--parchment)]"
                  />
                </div>
              </div>
            </div>

            {/* 2. DEMOGRAFI PER DUSUN */}
            <div>
              <div className="flex justify-between items-center mb-3 border-b pb-2">
                <h4 className="font-heading font-semibold text-sm text-[color:var(--ink)]">2. Sebaran Demografi per Dusun</h4>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStatistik({
                      ...statistik,
                      dusunList: [...(statistik.dusunList || []), { nama: "Dusun Baru", rt: 0, rw: 0, jiwa: 0 }],
                    });
                  }}
                  className="text-xs border-[color:var(--line)]"
                >
                  + Tambah Dusun
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(statistik.dusunList || []).map((dusun, idx) => (
                  <div key={idx} className="p-3 border border-[color:var(--line)] rounded-lg bg-[color:var(--parchment)] flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={dusun.nama}
                      onChange={(e) => {
                        const newList = [...statistik.dusunList];
                        newList[idx].nama = e.target.value;
                        setStatistik({ ...statistik, dusunList: newList });
                      }}
                      className="w-36 px-2 py-1 border rounded text-xs bg-[color:var(--card)] font-medium truncate"
                      placeholder="Nama Dusun"
                    />
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-[color:var(--ink-soft)]">RT:</span>
                      <input
                        type="number"
                        value={dusun.rt}
                        onChange={(e) => {
                          const newList = [...statistik.dusunList];
                          newList[idx].rt = parseInt(e.target.value) || 0;
                          setStatistik({ ...statistik, dusunList: newList });
                        }}
                        className="w-12 px-1 py-1 border rounded text-xs text-center"
                      />
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-[color:var(--ink-soft)]">RW:</span>
                      <input
                        type="number"
                        value={dusun.rw}
                        onChange={(e) => {
                          const newList = [...statistik.dusunList];
                          newList[idx].rw = parseInt(e.target.value) || 0;
                          setStatistik({ ...statistik, dusunList: newList });
                        }}
                        className="w-12 px-1 py-1 border rounded text-xs text-center"
                      />
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-[color:var(--ink-soft)]">Jiwa:</span>
                      <input
                        type="number"
                        value={dusun.jiwa}
                        onChange={(e) => {
                          const newList = [...statistik.dusunList];
                          newList[idx].jiwa = parseInt(e.target.value) || 0;
                          setStatistik({ ...statistik, dusunList: newList });
                        }}
                        className="w-16 px-1 py-1 border rounded text-xs text-center font-bold text-[color:var(--forest)]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newList = statistik.dusunList.filter((_, i) => i !== idx);
                        setStatistik({ ...statistik, dusunList: newList });
                      }}
                      className="text-red-500 hover:text-red-700 text-xs px-1"
                      title="Hapus Dusun"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. TINGKAT PENDIDIKAN */}
            <div>
              <div className="flex justify-between items-center mb-3 border-b pb-2">
                <h4 className="font-heading font-semibold text-sm text-[color:var(--ink)]">3. Data Tingkat Pendidikan</h4>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStatistik({
                      ...statistik,
                      pendidikanList: [...(statistik.pendidikanList || []), { name: "Jenjang Baru", count: 0 }],
                    });
                  }}
                  className="text-xs border-[color:var(--line)]"
                >
                  + Tambah Tingkat Pendidikan
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(statistik.pendidikanList || []).map((item, idx) => (
                  <div key={idx} className="p-3 border border-[color:var(--line)] rounded-lg bg-[color:var(--parchment)] flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        const newList = [...statistik.pendidikanList];
                        newList[idx].name = e.target.value;
                        setStatistik({ ...statistik, pendidikanList: newList });
                      }}
                      className="flex-1 px-2.5 py-1 border rounded text-xs bg-[color:var(--card)] font-medium"
                      placeholder="Nama Jenjang Pendidikan"
                    />
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-[color:var(--ink-soft)]">Jiwa:</span>
                      <input
                        type="number"
                        value={item.count}
                        onChange={(e) => {
                          const newList = [...statistik.pendidikanList];
                          newList[idx].count = parseInt(e.target.value) || 0;
                          setStatistik({ ...statistik, pendidikanList: newList });
                        }}
                        className="w-24 px-2 py-1 border rounded text-xs text-right font-mono font-bold text-[color:var(--forest)]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newList = statistik.pendidikanList.filter((_, i) => i !== idx);
                        setStatistik({ ...statistik, pendidikanList: newList });
                      }}
                      className="text-red-500 hover:text-red-700 text-xs px-1"
                      title="Hapus"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. MATA PENCAHARIAN UTAMA */}
            <div>
              <div className="flex justify-between items-center mb-3 border-b pb-2">
                <h4 className="font-heading font-semibold text-sm text-[color:var(--ink)]">4. Mata Pencaharian Utama</h4>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStatistik({
                      ...statistik,
                      pekerjaanList: [...(statistik.pekerjaanList || []), { name: "Pekerjaan Baru", count: 0, pct: 0 }],
                    });
                  }}
                  className="text-xs border-[color:var(--line)]"
                >
                  + Tambah Mata Pencaharian
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(statistik.pekerjaanList || []).map((item, idx) => (
                  <div key={idx} className="p-3 border border-[color:var(--line)] rounded-lg bg-[color:var(--parchment)] flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        const newList = [...statistik.pekerjaanList];
                        newList[idx].name = e.target.value;
                        setStatistik({ ...statistik, pekerjaanList: newList });
                      }}
                      className="w-40 px-2.5 py-1 border rounded text-xs bg-[color:var(--card)] font-medium truncate"
                      placeholder="Mata Pencaharian"
                    />
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-[color:var(--ink-soft)]">Jiwa:</span>
                      <input
                        type="number"
                        value={item.count}
                        onChange={(e) => {
                          const newList = [...statistik.pekerjaanList];
                          newList[idx].count = parseInt(e.target.value) || 0;
                          setStatistik({ ...statistik, pekerjaanList: newList });
                        }}
                        className="w-20 px-1.5 py-1 border rounded text-xs text-right font-mono font-bold text-[color:var(--clay)]"
                      />
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-[color:var(--ink-soft)]">%:</span>
                      <input
                        type="number"
                        value={item.pct}
                        onChange={(e) => {
                          const newList = [...statistik.pekerjaanList];
                          newList[idx].pct = parseFloat(e.target.value) || 0;
                          setStatistik({ ...statistik, pekerjaanList: newList });
                        }}
                        className="w-14 px-1.5 py-1 border rounded text-xs text-center font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newList = statistik.pekerjaanList.filter((_, i) => i !== idx);
                        setStatistik({ ...statistik, pekerjaanList: newList });
                      }}
                      className="text-red-500 hover:text-red-700 text-xs px-1"
                      title="Hapus"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={isStatistikSaving} className="btn btn-primary bg-[color:var(--forest)] text-white border-none px-6">
                {isStatistikSaving ? "Menyimpan..." : "Simpan Statistik Kependudukan"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* MODAL BIDANG BELANJA */}
      {isBidangModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 bg-[color:var(--card)] border border-[color:var(--line)] shadow-xl">
            <h3 className="text-xl font-heading mb-4">Edit / Tambah Bidang Belanja APBDes</h3>
            <form onSubmit={promptSaveBidang} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-mono uppercase mb-1">Nama Bidang</label>
                <input
                  type="text"
                  required
                  value={editingBidang?.name || ""}
                  onChange={(e) => setEditingBidang({ ...editingBidang, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-[color:var(--parchment)]"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Anggaran</label>
                  <input
                    type="text"
                    required
                    value={editingBidang?.anggaran || ""}
                    onChange={(e) => setEditingBidang({ ...editingBidang, anggaran: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-[color:var(--parchment)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Realisasi</label>
                  <input
                    type="text"
                    required
                    value={editingBidang?.realisasi || ""}
                    onChange={(e) => setEditingBidang({ ...editingBidang, realisasi: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-[color:var(--parchment)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Persen (%)</label>
                  <input
                    type="text"
                    required
                    value={editingBidang?.pct || ""}
                    onChange={(e) => setEditingBidang({ ...editingBidang, pct: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-[color:var(--parchment)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase mb-1">Deskripsi Kegiatan</label>
                <textarea
                  rows={3}
                  value={editingBidang?.desc || ""}
                  onChange={(e) => setEditingBidang({ ...editingBidang, desc: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-[color:var(--parchment)]"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button type="button" variant="outline" onClick={() => setIsBidangModalOpen(false)}>Batal</Button>
                <Button type="submit" className="bg-[color:var(--forest)] text-white">Simpan Bidang</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL PRODUK HUKUM */}
      {isProdukHukumModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 bg-[color:var(--card)] border border-[color:var(--line)] shadow-xl">
            <h3 className="text-xl font-heading mb-4">Edit / Tambah Produk Hukum</h3>
            <form onSubmit={promptSaveProdukHukum} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-mono uppercase mb-1">Nomor / Tahun Peraturan</label>
                <input
                  type="text"
                  required
                  placeholder="Perdes No. 03 Tahun 2026"
                  value={editingProdukHukum?.nomor || ""}
                  onChange={(e) => setEditingProdukHukum({ ...editingProdukHukum, nomor: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-[color:var(--parchment)]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase mb-1">Judul Peraturan</label>
                <input
                  type="text"
                  required
                  value={editingProdukHukum?.judul || ""}
                  onChange={(e) => setEditingProdukHukum({ ...editingProdukHukum, judul: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-[color:var(--parchment)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Kategori</label>
                  <select
                    value={editingProdukHukum?.kategori || "Peraturan Desa"}
                    onChange={(e) => setEditingProdukHukum({ ...editingProdukHukum, kategori: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-[color:var(--parchment)]"
                  >
                    <option value="Peraturan Desa">Peraturan Desa</option>
                    <option value="Peraturan Kades">Peraturan Kades</option>
                    <option value="SK Kepala Desa">SK Kepala Desa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Tanggal Penetapan</label>
                  <input
                    type="text"
                    placeholder="10 Januari 2026"
                    value={editingProdukHukum?.tanggal || ""}
                    onChange={(e) => setEditingProdukHukum({ ...editingProdukHukum, tanggal: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-[color:var(--parchment)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase mb-1">Upload File Dokumen PDF (.pdf)</label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
                        alert("File harus berformat PDF (.pdf)!");
                        return;
                      }
                      setPdfFile(file);
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-[color:var(--parchment)] file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[color:var(--forest)] file:text-white hover:file:opacity-90 cursor-pointer"
                />
                {pdfFile && (
                  <p className="text-xs text-[color:var(--forest-deep)] mt-1 font-mono font-medium">
                    ✅ Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                {editingProdukHukum?.fileUrl && !pdfFile && (
                  <div className="mt-2 text-xs flex items-center gap-2">
                    <span className="text-[color:var(--ink-soft)]">File PDF Terpasang:</span>
                    <a
                      href={editingProdukHukum.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[color:var(--forest)] underline font-medium inline-flex items-center gap-1"
                    >
                      📄 Buka/Lihat PDF
                    </a>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <Button type="button" variant="outline" onClick={() => setIsProdukHukumModalOpen(false)}>Batal</Button>
                <Button type="submit" disabled={isProdukHukumSaving || isUploadingPdf} className="bg-[color:var(--forest)] text-white">
                  {isUploadingPdf ? "Mengunggah PDF..." : isProdukHukumSaving ? "Menyimpan..." : "Simpan Dokumen"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        isLoading={isRingkasanSaving || isStatistikSaving}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  ApbdesRingkasan,
  ApbdesBidang,
  ProdukHukum,
  PpidItem,
  BansosItem,
} from "@/lib/data";
import {
  updateApbdesRingkasanAction,
  saveApbdesBidangAction,
  deleteApbdesBidangAction,
  saveProdukHukumAction,
  deleteProdukHukumAction,
  savePpidAction,
  deletePpidAction,
  saveBansosAction,
  deleteBansosAction,
} from "@/app/admin/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  initialRingkasan: ApbdesRingkasan;
  initialBidangList: ApbdesBidang[];
  initialProdukHukum: ProdukHukum[];
  initialPpid: PpidItem[];
  initialBansos: BansosItem[];
}

export default function TransparansiClientPage({
  initialRingkasan,
  initialBidangList,
  initialProdukHukum,
  initialPpid,
  initialBansos,
}: Props) {
  const [activeTab, setActiveTab] = useState<"apbdes" | "produkhukum" | "ppid" | "bansos">("apbdes");

  // State
  const [ringkasan, setRingkasan] = useState<ApbdesRingkasan>(initialRingkasan);
  const [bidangList, setBidangList] = useState<ApbdesBidang[]>(initialBidangList);
  const [produkHukumList, setProdukHukumList] = useState<ProdukHukum[]>(initialProdukHukum);
  const [ppidList, setPpidList] = useState<PpidItem[]>(initialPpid);
  const [bansosList, setBansosList] = useState<BansosItem[]>(initialBansos);

  // Modals state
  const [isRingkasanSaving, setIsRingkasanSaving] = useState(false);

  const [editingBidang, setEditingBidang] = useState<Partial<ApbdesBidang> | null>(null);
  const [isBidangModalOpen, setIsBidangModalOpen] = useState(false);

  const [editingProdukHukum, setEditingProdukHukum] = useState<Partial<ProdukHukum> | null>(null);
  const [isProdukHukumModalOpen, setIsProdukHukumModalOpen] = useState(false);

  const [editingPpid, setEditingPpid] = useState<Partial<PpidItem> | null>(null);
  const [isPpidModalOpen, setIsPpidModalOpen] = useState(false);

  const [editingBansos, setEditingBansos] = useState<Partial<BansosItem> | null>(null);
  const [isBansosModalOpen, setIsBansosModalOpen] = useState(false);

  // APBDES RINGKASAN
  const handleSaveRingkasan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRingkasanSaving(true);
    try {
      await updateApbdesRingkasanAction(ringkasan);
      alert("Ringkasan APBDes berhasil diperbarui!");
    } catch (err: any) {
      alert("Gagal memperbarui ringkasan: " + err.message);
    } finally {
      setIsRingkasanSaving(false);
    }
  };

  // APBDES BIDANG
  const handleSaveBidang = async (e: React.FormEvent) => {
    e.preventDefault();
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
      }
    } catch (err: any) {
      alert("Gagal menyimpan bidang APBDes: " + err.message);
    }
  };

  const handleDeleteBidang = async (id: number) => {
    if (!confirm("Hapus bidang belanja ini?")) return;
    await deleteApbdesBidangAction(id);
    setBidangList(bidangList.filter((b) => b.id !== id));
  };

  // PRODUK HUKUM
  const handleSaveProdukHukum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProdukHukum?.judul) return;
    try {
      const res = await saveProdukHukumAction({
        id: editingProdukHukum.id,
        nomor: editingProdukHukum.nomor || "",
        judul: editingProdukHukum.judul || "",
        kategori: editingProdukHukum.kategori || "Peraturan Desa",
        tanggal: editingProdukHukum.tanggal || "",
        fileUrl: editingProdukHukum.fileUrl || "",
      });
      if (res.success && res.item) {
        if (editingProdukHukum.id) {
          setProdukHukumList(produkHukumList.map((p) => (p.id === res.item.id ? res.item : p)));
        } else {
          setProdukHukumList([res.item, ...produkHukumList]);
        }
        setIsProdukHukumModalOpen(false);
      }
    } catch (err: any) {
      alert("Gagal menyimpan produk hukum: " + err.message);
    }
  };

  const handleDeleteProdukHukum = async (id: number) => {
    if (!confirm("Hapus produk hukum ini?")) return;
    await deleteProdukHukumAction(id);
    setProdukHukumList(produkHukumList.filter((p) => p.id !== id));
  };

  // PPID
  const handleSavePpid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPpid?.judul) return;
    try {
      const res = await savePpidAction({
        id: editingPpid.id,
        judul: editingPpid.judul || "",
        kategori: (editingPpid.kategori as any) || "Berkala",
        format: editingPpid.format || "PDF",
        ukuran: editingPpid.ukuran || "1 MB",
        tanggal: editingPpid.tanggal || "",
        fileUrl: editingPpid.fileUrl || "",
      });
      if (res.success && res.item) {
        if (editingPpid.id) {
          setPpidList(ppidList.map((p) => (p.id === res.item.id ? res.item : p)));
        } else {
          setPpidList([res.item, ...ppidList]);
        }
        setIsPpidModalOpen(false);
      }
    } catch (err: any) {
      alert("Gagal menyimpan PPID: " + err.message);
    }
  };

  const handleDeletePpid = async (id: number) => {
    if (!confirm("Hapus dokumen PPID ini?")) return;
    await deletePpidAction(id);
    setPpidList(ppidList.filter((p) => p.id !== id));
  };

  // BANSOS
  const handleSaveBansos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBansos?.name) return;
    try {
      const res = await saveBansosAction({
        id: editingBansos.id,
        name: editingBansos.name || "",
        source: editingBansos.source || "",
        kpmCount: Number(editingBansos.kpmCount) || 0,
        nominal: editingBansos.nominal || "",
        status: editingBansos.status || "Aktif",
        desc: editingBansos.desc || "",
      });
      if (res.success && res.item) {
        if (editingBansos.id) {
          setBansosList(bansosList.map((b) => (b.id === res.item.id ? res.item : b)));
        } else {
          setBansosList([...bansosList, res.item]);
        }
        setIsBansosModalOpen(false);
      }
    } catch (err: any) {
      alert("Gagal menyimpan bansos: " + err.message);
    }
  };

  const handleDeleteBansos = async (id: number) => {
    if (!confirm("Hapus program bansos ini?")) return;
    await deleteBansosAction(id);
    setBansosList(bansosList.filter((b) => b.id !== id));
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <p className="eyebrow">Kelola Transparansi Desa</p>
        <h1 className="text-3xl font-heading mt-1" style={{ color: "var(--forest-deep)" }}>
          APBDes, Produk Hukum, PPID & Bansos
        </h1>
        <p className="text-sm text-[color:var(--ink-soft)] mt-1">
          Kelola transparansi keuangan desa (APBDes), regulasi Perdes/SK Kades, dokumen PPID KIP, dan program bantuan sosial.
        </p>
      </div>

      {/* TABS */}
      <div className="flex border-b border-[color:var(--line)] gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("apbdes")}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
            activeTab === "apbdes"
              ? "border-[color:var(--forest)] text-[color:var(--forest)]"
              : "border-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
          }`}
        >
          APBDes & Keuangan ({bidangList.length} Bidang)
        </button>
        <button
          onClick={() => setActiveTab("produkhukum")}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
            activeTab === "produkhukum"
              ? "border-[color:var(--forest)] text-[color:var(--forest)]"
              : "border-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
          }`}
        >
          Produk Hukum ({produkHukumList.length})
        </button>
        <button
          onClick={() => setActiveTab("ppid")}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
            activeTab === "ppid"
              ? "border-[color:var(--forest)] text-[color:var(--forest)]"
              : "border-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
          }`}
        >
          PPID Informasi Publik ({ppidList.length})
        </button>
        <button
          onClick={() => setActiveTab("bansos")}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
            activeTab === "bansos"
              ? "border-[color:var(--forest)] text-[color:var(--forest)]"
              : "border-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
          }`}
        >
          Transparansi Bansos ({bansosList.length})
        </button>
      </div>

      {/* TAB APBDES */}
      {activeTab === "apbdes" && (
        <div className="flex flex-col gap-6">
          {/* RINGKASAN FORM */}
          <Card className="p-6 border border-[color:var(--line)] bg-[color:var(--card)] shadow-sm">
            <h3 className="font-heading text-lg text-[color:var(--forest-deep)] mb-4">
              Ringkasan APBDes TA {ringkasan.tahun}
            </h3>
            <form onSubmit={handleSaveRingkasan} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Tahun Anggaran</label>
                <input
                  type="number"
                  value={ringkasan.tahun}
                  onChange={(e) => setRingkasan({ ...ringkasan, tahun: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg border text-sm font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Total Pendapatan</label>
                <input
                  type="text"
                  value={ringkasan.pendapatan}
                  onChange={(e) => setRingkasan({ ...ringkasan, pendapatan: e.target.value })}
                  className="w-full p-2.5 rounded-lg border text-sm font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Total Belanja</label>
                <input
                  type="text"
                  value={ringkasan.belanja}
                  onChange={(e) => setRingkasan({ ...ringkasan, belanja: e.target.value })}
                  className="w-full p-2.5 rounded-lg border text-sm font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Pembiayaan / SILPA</label>
                <input
                  type="text"
                  value={ringkasan.pembiayaan}
                  onChange={(e) => setRingkasan({ ...ringkasan, pembiayaan: e.target.value })}
                  className="w-full p-2.5 rounded-lg border text-sm font-mono"
                  required
                />
              </div>
              <div className="md:col-span-4 flex justify-end">
                <Button type="submit" disabled={isRingkasanSaving} className="bg-[color:var(--forest)] text-white text-xs px-5">
                  {isRingkasanSaving ? "Menyimpan..." : "Simpan Ringkasan APBDes"}
                </Button>
              </div>
            </form>
          </Card>

          {/* DETAIL BIDANG BELANJA */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-heading text-lg text-[color:var(--ink)]">Rincian Realisasi per Bidang</h3>
              <Button
                onClick={() => {
                  setEditingBidang({ name: "", anggaran: "Rp ", realisasi: "Rp ", pct: "0%", desc: "" });
                  setIsBidangModalOpen(true);
                }}
                className="bg-[color:var(--forest)] text-white text-sm"
              >
                + Tambah Bidang Belanja
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {bidangList.map((item) => (
                <Card key={item.id} className="p-5 border border-[color:var(--line)] bg-[color:var(--card)] flex flex-col gap-2 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                    <h4 className="font-heading text-lg text-[color:var(--ink)]">{item.name}</h4>
                    <div className="flex items-center gap-3 font-mono text-sm">
                      <span>Anggaran: <strong>{item.anggaran}</strong></span>
                      <span>Realisasi: <strong>{item.realisasi}</strong></span>
                      <Badge className="bg-[color:var(--forest)] text-white border-none">{item.pct}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-[color:var(--ink-soft)]">{item.desc}</p>
                  <div className="flex justify-end gap-2 border-t border-[color:var(--line)] pt-3 mt-2">
                    <button
                      onClick={() => {
                        setEditingBidang(item);
                        setIsBidangModalOpen(true);
                      }}
                      className="text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded font-semibold cursor-pointer border border-amber-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBidang(item.id)}
                      className="text-xs text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded font-semibold cursor-pointer border border-red-200"
                    >
                      Hapus
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB PRODUK HUKUM */}
      {activeTab === "produkhukum" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-[color:var(--ink-soft)]">
              Peraturan Desa (Perdes) dan Keputusan Kepala Desa (SK Kades).
            </p>
            <Button
              onClick={() => {
                setEditingProdukHukum({
                  nomor: "Perdes No. 00 Tahun 2026",
                  judul: "",
                  kategori: "Peraturan Desa",
                  tanggal: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
                  fileUrl: "",
                });
                setIsProdukHukumModalOpen(true);
              }}
              className="bg-[color:var(--forest)] text-white text-sm"
            >
              + Tambah Dokumen Hukum
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {produkHukumList.map((item) => (
              <Card key={item.id} className="p-5 border border-[color:var(--line)] bg-[color:var(--card)] flex flex-col justify-between shadow-sm">
                <div>
                  <Badge className="bg-[color:var(--forest)] text-white text-xs mb-2 border-none">
                    {item.kategori}
                  </Badge>
                  <h4 className="font-mono text-xs font-bold text-[color:var(--clay)]">{item.nomor}</h4>
                  <h3 className="font-heading text-base font-semibold text-[color:var(--ink)] mt-1 mb-2">{item.judul}</h3>
                  <span className="text-xs font-mono text-[color:var(--ink-soft)] block">Ditetapkan: {item.tanggal}</span>
                </div>
                <div className="flex justify-end gap-2 border-t border-[color:var(--line)] pt-3 mt-3">
                  <button
                    onClick={() => {
                      setEditingProdukHukum(item);
                      setIsProdukHukumModalOpen(true);
                    }}
                    className="text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded font-semibold cursor-pointer border border-amber-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProdukHukum(item.id)}
                    className="text-xs text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded font-semibold cursor-pointer border border-red-200"
                  >
                    Hapus
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB PPID */}
      {activeTab === "ppid" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-[color:var(--ink-soft)]">
              Dokumen Layanan Keterbukaan Informasi Publik (UU KIP).
            </p>
            <Button
              onClick={() => {
                setEditingPpid({
                  judul: "",
                  kategori: "Berkala",
                  format: "PDF",
                  ukuran: "500 KB",
                  tanggal: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
                });
                setIsPpidModalOpen(true);
              }}
              className="bg-[color:var(--forest)] text-white text-sm"
            >
              + Tambah Dokumen PPID
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ppidList.map((item) => (
              <Card key={item.id} className="p-5 border border-[color:var(--line)] bg-[color:var(--card)] flex flex-col justify-between shadow-sm">
                <div>
                  <Badge className="bg-[color:var(--forest)] text-white text-xs mb-2 border-none">
                    Info {item.kategori}
                  </Badge>
                  <h3 className="font-heading text-base font-semibold text-[color:var(--ink)] mb-2">{item.judul}</h3>
                  <span className="text-xs font-mono text-[color:var(--ink-soft)] block">Format: {item.format} ({item.ukuran}) · {item.tanggal}</span>
                </div>
                <div className="flex justify-end gap-2 border-t border-[color:var(--line)] pt-3 mt-3">
                  <button
                    onClick={() => {
                      setEditingPpid(item);
                      setIsPpidModalOpen(true);
                    }}
                    className="text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded font-semibold cursor-pointer border border-amber-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePpid(item.id)}
                    className="text-xs text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded font-semibold cursor-pointer border border-red-200"
                  >
                    Hapus
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB BANSOS */}
      {activeTab === "bansos" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-[color:var(--ink-soft)]">
              Program Bantuan Sosial Warga (BLT Dana Desa, PKH, BPNT, dsb.).
            </p>
            <Button
              onClick={() => {
                setEditingBansos({
                  name: "",
                  source: "Dana Desa Sukoharjo",
                  kpmCount: 50,
                  nominal: "Rp 300.000 / Bulan",
                  status: "Aktif Penyaluran",
                  desc: "",
                });
                setIsBansosModalOpen(true);
              }}
              className="bg-[color:var(--forest)] text-white text-sm"
            >
              + Tambah Program Bansos
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bansosList.map((item) => (
              <Card key={item.id} className="p-5 border border-[color:var(--line)] bg-[color:var(--card)] flex flex-col justify-between shadow-sm">
                <div>
                  <Badge className="bg-[color:var(--forest)] text-white text-xs mb-2 border-none">
                    {item.status}
                  </Badge>
                  <h3 className="font-heading text-base font-semibold text-[color:var(--ink)] mb-1">{item.name}</h3>
                  <span className="text-xs font-mono text-[color:var(--clay)] font-semibold block mb-2">Sumber: {item.source}</span>
                  <p className="text-xs text-[color:var(--ink-soft)] mb-3">{item.desc}</p>
                  <div className="text-xs font-mono text-[color:var(--ink)] bg-[color:var(--parchment-2)] p-2.5 rounded-lg border">
                    👥 <strong>{item.kpmCount} KPM</strong> · 💰 <strong>{item.nominal}</strong>
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-[color:var(--line)] pt-3 mt-4">
                  <button
                    onClick={() => {
                      setEditingBansos(item);
                      setIsBansosModalOpen(true);
                    }}
                    className="text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded font-semibold cursor-pointer border border-amber-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBansos(item.id)}
                    className="text-xs text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded font-semibold cursor-pointer border border-red-200"
                  >
                    Hapus
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* MODAL BIDANG APBDES */}
      {isBidangModalOpen && editingBidang && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 border">
            <h3 className="font-heading text-xl text-[color:var(--forest-deep)]">
              {editingBidang.id ? "Edit Bidang Belanja APBDes" : "Tambah Bidang Belanja"}
            </h3>
            <form onSubmit={handleSaveBidang} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Nama Bidang</label>
                <input
                  type="text"
                  required
                  value={editingBidang.name || ""}
                  onChange={(e) => setEditingBidang({ ...editingBidang, name: e.target.value })}
                  placeholder="Bidang Pembangunan Desa"
                  className="w-full p-2.5 rounded-lg border text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Anggaran</label>
                  <input
                    type="text"
                    required
                    value={editingBidang.anggaran || ""}
                    onChange={(e) => setEditingBidang({ ...editingBidang, anggaran: e.target.value })}
                    className="w-full p-2.5 rounded-lg border text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Realisasi</label>
                  <input
                    type="text"
                    required
                    value={editingBidang.realisasi || ""}
                    onChange={(e) => setEditingBidang({ ...editingBidang, realisasi: e.target.value })}
                    className="w-full p-2.5 rounded-lg border text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Persen %</label>
                  <input
                    type="text"
                    required
                    value={editingBidang.pct || ""}
                    onChange={(e) => setEditingBidang({ ...editingBidang, pct: e.target.value })}
                    className="w-full p-2.5 rounded-lg border text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Deskripsi Kegiatan</label>
                <textarea
                  rows={3}
                  value={editingBidang.desc || ""}
                  onChange={(e) => setEditingBidang({ ...editingBidang, desc: e.target.value })}
                  className="w-full p-2.5 rounded-lg border text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button type="button" variant="outline" onClick={() => setIsBidangModalOpen(false)} className="text-xs">Batal</Button>
                <Button type="submit" className="bg-[color:var(--forest)] text-white text-xs">Simpan Bidang</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRODUK HUKUM */}
      {isProdukHukumModalOpen && editingProdukHukum && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 border">
            <h3 className="font-heading text-xl text-[color:var(--forest-deep)]">
              {editingProdukHukum.id ? "Edit Dokumen Hukum" : "Tambah Dokumen Hukum"}
            </h3>
            <form onSubmit={handleSaveProdukHukum} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Nomor / Tahun</label>
                <input
                  type="text"
                  required
                  value={editingProdukHukum.nomor || ""}
                  onChange={(e) => setEditingProdukHukum({ ...editingProdukHukum, nomor: e.target.value })}
                  placeholder="Perdes No. 03 Tahun 2026"
                  className="w-full p-2.5 rounded-lg border text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Judul Peraturan</label>
                <input
                  type="text"
                  required
                  value={editingProdukHukum.judul || ""}
                  onChange={(e) => setEditingProdukHukum({ ...editingProdukHukum, judul: e.target.value })}
                  placeholder="Judul lengkap peraturan..."
                  className="w-full p-2.5 rounded-lg border text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Kategori</label>
                  <select
                    value={editingProdukHukum.kategori || "Peraturan Desa"}
                    onChange={(e) => setEditingProdukHukum({ ...editingProdukHukum, kategori: e.target.value })}
                    className="w-full p-2.5 rounded-lg border text-sm"
                  >
                    <option value="Peraturan Desa">Peraturan Desa</option>
                    <option value="SK Kepala Desa">SK Kepala Desa</option>
                    <option value="Peraturan Kepala Desa">Peraturan Kepala Desa</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Tanggal Penetapan</label>
                  <input
                    type="text"
                    required
                    value={editingProdukHukum.tanggal || ""}
                    onChange={(e) => setEditingProdukHukum({ ...editingProdukHukum, tanggal: e.target.value })}
                    placeholder="10 Januari 2026"
                    className="w-full p-2.5 rounded-lg border text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button type="button" variant="outline" onClick={() => setIsProdukHukumModalOpen(false)} className="text-xs">Batal</Button>
                <Button type="submit" className="bg-[color:var(--forest)] text-white text-xs">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PPID */}
      {isPpidModalOpen && editingPpid && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 border">
            <h3 className="font-heading text-xl text-[color:var(--forest-deep)]">
              {editingPpid.id ? "Edit Dokumen PPID" : "Tambah Dokumen PPID"}
            </h3>
            <form onSubmit={handleSavePpid} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Judul Dokumen</label>
                <input
                  type="text"
                  required
                  value={editingPpid.judul || ""}
                  onChange={(e) => setEditingPpid({ ...editingPpid, judul: e.target.value })}
                  placeholder="Laporan Realisasi APBDes TA 2025"
                  className="w-full p-2.5 rounded-lg border text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Kategori</label>
                  <select
                    value={editingPpid.kategori || "Berkala"}
                    onChange={(e) => setEditingPpid({ ...editingPpid, kategori: e.target.value as any })}
                    className="w-full p-2 rounded-lg border text-xs"
                  >
                    <option value="Berkala">Berkala</option>
                    <option value="Serta-Merta">Serta-Merta</option>
                    <option value="Setiap Saat">Setiap Saat</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Format</label>
                  <input
                    type="text"
                    value={editingPpid.format || "PDF"}
                    onChange={(e) => setEditingPpid({ ...editingPpid, format: e.target.value })}
                    className="w-full p-2 rounded-lg border text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Ukuran</label>
                  <input
                    type="text"
                    value={editingPpid.ukuran || "1 MB"}
                    onChange={(e) => setEditingPpid({ ...editingPpid, ukuran: e.target.value })}
                    className="w-full p-2 rounded-lg border text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Tanggal Terbit</label>
                <input
                  type="text"
                  value={editingPpid.tanggal || ""}
                  onChange={(e) => setEditingPpid({ ...editingPpid, tanggal: e.target.value })}
                  className="w-full p-2.5 rounded-lg border text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button type="button" variant="outline" onClick={() => setIsPpidModalOpen(false)} className="text-xs">Batal</Button>
                <Button type="submit" className="bg-[color:var(--forest)] text-white text-xs">Simpan PPID</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BANSOS */}
      {isBansosModalOpen && editingBansos && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 border">
            <h3 className="font-heading text-xl text-[color:var(--forest-deep)]">
              {editingBansos.id ? "Edit Program Bansos" : "Tambah Program Bansos"}
            </h3>
            <form onSubmit={handleSaveBansos} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Nama Program Bantuan</label>
                <input
                  type="text"
                  required
                  value={editingBansos.name || ""}
                  onChange={(e) => setEditingBansos({ ...editingBansos, name: e.target.value })}
                  placeholder="BLT Dana Desa"
                  className="w-full p-2.5 rounded-lg border text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Sumber Dana</label>
                  <input
                    type="text"
                    required
                    value={editingBansos.source || ""}
                    onChange={(e) => setEditingBansos({ ...editingBansos, source: e.target.value })}
                    placeholder="Dana Desa Sukoharjo"
                    className="w-full p-2.5 rounded-lg border text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Jumlah KPM</label>
                  <input
                    type="number"
                    required
                    value={editingBansos.kpmCount || 0}
                    onChange={(e) => setEditingBansos({ ...editingBansos, kpmCount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Nominal Bantuan</label>
                  <input
                    type="text"
                    required
                    value={editingBansos.nominal || ""}
                    onChange={(e) => setEditingBansos({ ...editingBansos, nominal: e.target.value })}
                    placeholder="Rp 300.000 / Bulan"
                    className="w-full p-2.5 rounded-lg border text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Status Penyaluran</label>
                  <input
                    type="text"
                    required
                    value={editingBansos.status || ""}
                    onChange={(e) => setEditingBansos({ ...editingBansos, status: e.target.value })}
                    placeholder="Tersalurkan Tahap II"
                    className="w-full p-2.5 rounded-lg border text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Kriteria KPM / Deskripsi</label>
                <textarea
                  rows={3}
                  value={editingBansos.desc || ""}
                  onChange={(e) => setEditingBansos({ ...editingBansos, desc: e.target.value })}
                  placeholder="Kriteria penerima..."
                  className="w-full p-2.5 rounded-lg border text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button type="button" variant="outline" onClick={() => setIsBansosModalOpen(false)} className="text-xs">Batal</Button>
                <Button type="submit" className="bg-[color:var(--forest)] text-white text-xs">Simpan Program</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

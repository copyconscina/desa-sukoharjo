"use client";

import { useState } from "react";
import { Agenda, BukuTamu, Pengaduan } from "@/lib/data";
import {
  saveAgendaAction,
  deleteAgendaAction,
  deleteBukuTamuAction,
  updateStatusPengaduanAction,
  deletePengaduanAction,
} from "@/app/admin/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  initialAgenda: Agenda[];
  initialBukuTamu: BukuTamu[];
  initialPengaduan: Pengaduan[];
}

export default function LayananClientPage({
  initialAgenda,
  initialBukuTamu,
  initialPengaduan,
}: Props) {
  const [activeTab, setActiveTab] = useState<"pengaduan" | "agenda" | "bukutamu">("pengaduan");

  // State
  const [agendaList, setAgendaList] = useState<Agenda[]>(initialAgenda);
  const [bukuTamuList, setBukuTamuList] = useState<BukuTamu[]>(initialBukuTamu);
  const [pengaduanList, setPengaduanList] = useState<Pengaduan[]>(initialPengaduan);

  // Agenda Form Modal State
  const [editingAgenda, setEditingAgenda] = useState<Partial<Agenda> | null>(null);
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [isSubmittingAgenda, setIsSubmittingAgenda] = useState(false);

  // Pengaduan Status Modal State
  const [selectedPengaduan, setSelectedPengaduan] = useState<Pengaduan | null>(null);
  const [pengaduanStatusInput, setPengaduanStatusInput] = useState<Pengaduan["status"]>("Diproses");
  const [pengaduanTanggapanInput, setPengaduanTanggapanInput] = useState("");

  // AGENDA HANDLERS
  const handleOpenAddAgenda = () => {
    setEditingAgenda({
      title: "",
      desc: "",
      location: "Balai Desa Sukoharjo",
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      time: "09:00 WIB",
      category: "Pemerintahan",
    });
    setIsAgendaModalOpen(true);
  };

  const handleSaveAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgenda?.title) return;
    setIsSubmittingAgenda(true);
    try {
      const res = await saveAgendaAction({
        id: editingAgenda.id,
        title: editingAgenda.title || "",
        desc: editingAgenda.desc || "",
        location: editingAgenda.location || "",
        date: editingAgenda.date || "",
        time: editingAgenda.time || "",
        category: editingAgenda.category || "Pemerintahan",
      });
      if (res.success && res.item) {
        if (editingAgenda.id) {
          setAgendaList(agendaList.map((a) => (a.id === res.item.id ? res.item : a)));
        } else {
          setAgendaList([res.item, ...agendaList]);
        }
        setIsAgendaModalOpen(false);
        setEditingAgenda(null);
      }
    } catch (err: any) {
      alert("Gagal menyimpan agenda: " + err.message);
    } finally {
      setIsSubmittingAgenda(false);
    }
  };

  const handleDeleteAgenda = async (id: number) => {
    if (!confirm("Hapus agenda ini?")) return;
    await deleteAgendaAction(id);
    setAgendaList(agendaList.filter((a) => a.id !== id));
  };

  // PENGADUAN HANDLERS
  const handleSavePengaduanStatus = async () => {
    if (!selectedPengaduan) return;
    try {
      await updateStatusPengaduanAction(selectedPengaduan.id, pengaduanStatusInput, pengaduanTanggapanInput);
      setPengaduanList(
        pengaduanList.map((p) =>
          p.id === selectedPengaduan.id
            ? { ...p, status: pengaduanStatusInput, tanggapan: pengaduanTanggapanInput }
            : p
        )
      );
      setSelectedPengaduan(null);
    } catch (err: any) {
      alert("Gagal memperbarui status pengaduan: " + err.message);
    }
  };

  const handleDeletePengaduan = async (id: number) => {
    if (!confirm("Hapus pengaduan ini?")) return;
    await deletePengaduanAction(id);
    setPengaduanList(pengaduanList.filter((p) => p.id !== id));
  };

  // BUKU TAMU HANDLERS
  const handleDeleteBukuTamu = async (id: number) => {
    if (!confirm("Hapus entri buku tamu ini?")) return;
    await deleteBukuTamuAction(id);
    setBukuTamuList(bukuTamuList.filter((b) => b.id !== id));
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <p className="eyebrow">Kelola Layanan Desa</p>
        <h1 className="text-3xl font-heading mt-1" style={{ color: "var(--forest-deep)" }}>
          Pengaduan Warga, Agenda & Buku Tamu
        </h1>
        <p className="text-sm text-[color:var(--ink-soft)] mt-1">
          Tindak lanjuti laporan pengaduan warga, kelola agenda kegiatan desa, dan moderasi buku tamu.
        </p>
      </div>

      {/* TABS */}
      <div className="flex border-b border-[color:var(--line)] gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("pengaduan")}
          className={`pb-3 px-2 font-medium text-sm border-b-2 transition-colors duration-200 cursor-pointer ${
            activeTab === "pengaduan"
              ? "border-[color:var(--forest)] text-[color:var(--forest)] font-semibold"
              : "border-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
          }`}
        >
          📢 Pengaduan Warga ({pengaduanList.length})
        </button>
        <button
          onClick={() => setActiveTab("agenda")}
          className={`pb-3 px-2 font-medium text-sm border-b-2 transition-colors duration-200 cursor-pointer ${
            activeTab === "agenda"
              ? "border-[color:var(--forest)] text-[color:var(--forest)] font-semibold"
              : "border-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
          }`}
        >
          📅 Agenda Kegiatan ({agendaList.length})
        </button>
        <button
          onClick={() => setActiveTab("bukutamu")}
          className={`pb-3 px-2 font-medium text-sm border-b-2 transition-colors duration-200 cursor-pointer ${
            activeTab === "bukutamu"
              ? "border-[color:var(--forest)] text-[color:var(--forest)] font-semibold"
              : "border-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
          }`}
        >
          📖 Buku Tamu ({bukuTamuList.length})
        </button>
      </div>

      {/* TAB 1: PENGADUAN WARGA */}
      {activeTab === "pengaduan" && (
        <Card className="p-6 border border-[color:var(--line)] shadow-sm bg-[color:var(--card)] flex flex-col gap-4">
          <h3 className="text-lg font-heading text-[color:var(--ink)]">Pengaduan & Laporan Masalah Warga</h3>
          <div className="flex flex-col gap-3">
            {pengaduanList.length === 0 ? (
              <p className="text-sm text-[color:var(--ink-soft)] italic">Belum ada pengaduan warga.</p>
            ) : (
              pengaduanList.map((p) => (
                <div key={p.id} className="p-4 border border-[color:var(--line)] rounded-xl bg-[color:var(--parchment)] flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-[color:var(--clay)] text-white border-none text-xs">{p.status}</Badge>
                        <span className="font-mono text-xs text-[color:var(--ink-soft)]">Dusun: {p.dusun}</span>
                        <span className="font-mono text-xs text-[color:var(--ink-soft)]">• {p.tanggal}</span>
                      </div>
                      <h4 className="font-heading font-semibold text-base text-[color:var(--ink)]">{p.judul}</h4>
                      <p className="text-xs text-[color:var(--ink-soft)] font-mono">Pelapor: {p.nama}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setSelectedPengaduan(p);
                          setPengaduanStatusInput(p.status);
                          setPengaduanTanggapanInput(p.tanggapan || "");
                        }}
                        className="bg-[color:var(--forest)] text-white text-xs px-3 py-1 border-none"
                      >
                        Tindak Lanjuti
                      </Button>
                      <Button
                        onClick={() => handleDeletePengaduan(p.id)}
                        variant="outline"
                        className="text-xs border-red-200 text-red-600 hover:bg-red-50 px-3 py-1"
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-[color:var(--ink)] bg-[color:var(--card)] p-3 rounded-lg border border-[color:var(--line)]">{p.isi}</p>
                  {p.tanggapan && (
                    <div className="text-xs bg-[color:var(--forest)]/10 text-[color:var(--forest-deep)] p-2.5 rounded-lg border border-[color:var(--forest)]/20">
                      <strong>Tanggapan Resmi Desa:</strong> {p.tanggapan}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* TAB 2: AGENDA KEGIATAN */}
      {activeTab === "agenda" && (
        <Card className="p-6 border border-[color:var(--line)] shadow-sm bg-[color:var(--card)] flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-heading text-[color:var(--ink)]">Agenda & Kalender Kegiatan Desa</h3>
            <Button onClick={handleOpenAddAgenda} className="btn btn-primary bg-[color:var(--forest)] text-white border-none text-xs">
              + Tambah Agenda Baru
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {agendaList.map((a) => (
              <div key={a.id} className="p-4 border border-[color:var(--line)] rounded-xl bg-[color:var(--parchment)] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-[color:var(--forest)] text-white border-none text-xs">{a.category}</Badge>
                    <span className="font-mono text-xs text-[color:var(--ink-soft)]">📍 {a.location}</span>
                    <span className="font-mono text-xs text-[color:var(--ink-soft)]">📅 {a.date} ({a.time})</span>
                  </div>
                  <h4 className="font-heading font-semibold text-base text-[color:var(--ink)]">{a.title}</h4>
                  <p className="text-xs text-[color:var(--ink-soft)] mt-1">{a.desc}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setEditingAgenda(a);
                      setIsAgendaModalOpen(true);
                    }}
                    variant="outline"
                    className="text-xs border-[color:var(--line)] px-3 py-1"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteAgenda(a.id)}
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

      {/* TAB 3: BUKU TAMU */}
      {activeTab === "bukutamu" && (
        <Card className="p-6 border border-[color:var(--line)] shadow-sm bg-[color:var(--card)] flex flex-col gap-4">
          <h3 className="text-lg font-heading text-[color:var(--ink)]">Moderasi Pesan Buku Tamu</h3>
          <div className="flex flex-col gap-3">
            {bukuTamuList.map((b) => (
              <div key={b.id} className="p-4 border border-[color:var(--line)] rounded-xl bg-[color:var(--parchment)] flex justify-between items-start gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-[color:var(--ink)]">{b.name}</span>
                    <span className="text-xs font-mono text-[color:var(--clay)]">({b.origin})</span>
                    <span className="text-xs font-mono text-[color:var(--ink-soft)]">• {b.date}</span>
                  </div>
                  <p className="text-sm text-[color:var(--ink-soft)] italic">"{b.message}"</p>
                </div>
                <Button
                  onClick={() => handleDeleteBukuTamu(b.id)}
                  variant="outline"
                  className="text-xs border-red-200 text-red-600 hover:bg-red-50 px-3 py-1"
                >
                  Hapus
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* MODAL AGENDA */}
      {isAgendaModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 bg-[color:var(--card)] border border-[color:var(--line)] shadow-xl">
            <h3 className="text-xl font-heading mb-4">{editingAgenda?.id ? "Edit Agenda Desa" : "Tambah Agenda Baru"}</h3>
            <form onSubmit={handleSaveAgenda} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-mono uppercase mb-1">Judul Agenda</label>
                <input
                  type="text"
                  required
                  value={editingAgenda?.title || ""}
                  onChange={(e) => setEditingAgenda({ ...editingAgenda, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-[color:var(--parchment)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Kategori</label>
                  <select
                    value={editingAgenda?.category || "Pemerintahan"}
                    onChange={(e) => setEditingAgenda({ ...editingAgenda, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-[color:var(--parchment)]"
                  >
                    <option value="Pemerintahan">Pemerintahan</option>
                    <option value="Ekonomi">Ekonomi / UMKM</option>
                    <option value="Kemasyarakatan">Kemasyarakatan</option>
                    <option value="Budaya">Budaya & Olahraga</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Lokasi</label>
                  <input
                    type="text"
                    required
                    value={editingAgenda?.location || ""}
                    onChange={(e) => setEditingAgenda({ ...editingAgenda, location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-[color:var(--parchment)]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Tanggal</label>
                  <input
                    type="text"
                    required
                    placeholder="15 Juli 2026"
                    value={editingAgenda?.date || ""}
                    onChange={(e) => setEditingAgenda({ ...editingAgenda, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-[color:var(--parchment)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Waktu / Jam</label>
                  <input
                    type="text"
                    required
                    placeholder="09:00 WIB"
                    value={editingAgenda?.time || ""}
                    onChange={(e) => setEditingAgenda({ ...editingAgenda, time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-[color:var(--parchment)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase mb-1">Deskripsi Kegiatan</label>
                <textarea
                  rows={3}
                  value={editingAgenda?.desc || ""}
                  onChange={(e) => setEditingAgenda({ ...editingAgenda, desc: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-[color:var(--parchment)]"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button type="button" variant="outline" onClick={() => setIsAgendaModalOpen(false)}>Batal</Button>
                <Button type="submit" disabled={isSubmittingAgenda} className="bg-[color:var(--forest)] text-white">
                  {isSubmittingAgenda ? "Menyimpan..." : "Simpan Agenda"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL PENGADUAN STATUS */}
      {selectedPengaduan && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 bg-[color:var(--card)] border border-[color:var(--line)] shadow-xl">
            <h3 className="text-xl font-heading mb-4">Tindak Lanjuti Pengaduan Warga</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-mono uppercase mb-1">Status Penanganan</label>
                <select
                  value={pengaduanStatusInput}
                  onChange={(e) => setPengaduanStatusInput(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-[color:var(--parchment)]"
                >
                  <option value="Baru">Baru</option>
                  <option value="Diproses">Diproses</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase mb-1">Tanggapan Resmi Desa</label>
                <textarea
                  rows={4}
                  placeholder="Masukkan tanggapan atau instruksi penyelesaian dari Balai Desa..."
                  value={pengaduanTanggapanInput}
                  onChange={(e) => setPengaduanTanggapanInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-[color:var(--parchment)]"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => setSelectedPengaduan(null)}>Batal</Button>
                <Button onClick={handleSavePengaduanStatus} className="bg-[color:var(--forest)] text-white">
                  Simpan Tanggapan
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

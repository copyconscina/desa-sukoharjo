"use client";

import { useState } from "react";
import { Agenda, BukuTamu, PermohonanSurat, Pengaduan } from "@/lib/data";
import {
  saveAgendaAction,
  deleteAgendaAction,
  deleteBukuTamuAction,
  updateStatusSuratAction,
  deletePermohonanSuratAction,
  updateStatusPengaduanAction,
  deletePengaduanAction,
} from "@/app/admin/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  initialAgenda: Agenda[];
  initialBukuTamu: BukuTamu[];
  initialSurat: PermohonanSurat[];
  initialPengaduan: Pengaduan[];
}

export default function LayananClientPage({
  initialAgenda,
  initialBukuTamu,
  initialSurat,
  initialPengaduan,
}: Props) {
  const [activeTab, setActiveTab] = useState<"surat" | "pengaduan" | "agenda" | "bukutamu">("surat");

  // State
  const [agendaList, setAgendaList] = useState<Agenda[]>(initialAgenda);
  const [bukuTamuList, setBukuTamuList] = useState<BukuTamu[]>(initialBukuTamu);
  const [suratList, setSuratList] = useState<PermohonanSurat[]>(initialSurat);
  const [pengaduanList, setPengaduanList] = useState<Pengaduan[]>(initialPengaduan);

  // Agenda Form Modal State
  const [editingAgenda, setEditingAgenda] = useState<Partial<Agenda> | null>(null);
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [isSubmittingAgenda, setIsSubmittingAgenda] = useState(false);

  // Status Modals State
  const [selectedSurat, setSelectedSurat] = useState<PermohonanSurat | null>(null);
  const [suratStatusInput, setSuratStatusInput] = useState<PermohonanSurat["status"]>("Diproses");
  const [suratCatatanInput, setSuratCatatanInput] = useState("");

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

  // SURAT HANDLERS
  const handleSaveSuratStatus = async () => {
    if (!selectedSurat) return;
    try {
      await updateStatusSuratAction(selectedSurat.id, suratStatusInput, suratCatatanInput);
      setSuratList(
        suratList.map((s) =>
          s.id === selectedSurat.id ? { ...s, status: suratStatusInput, catatan: suratCatatanInput } : s
        )
      );
      setSelectedSurat(null);
    } catch (err: any) {
      alert("Gagal memperbarui status surat: " + err.message);
    }
  };

  const handleDeleteSurat = async (id: number) => {
    if (!confirm("Hapus permohonan surat ini?")) return;
    await deletePermohonanSuratAction(id);
    setSuratList(suratList.filter((s) => s.id !== id));
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
          Pengaduan, Surat Mandiri & Agenda Desa
        </h1>
        <p className="text-sm text-[color:var(--ink-soft)] mt-1">
          Kelola respon pengajuan surat warga, tindak lanjuti laporan pengaduan, agenda kegiatan desa, dan moderasi buku tamu.
        </p>
      </div>

      {/* TABS */}
      <div className="flex border-b border-[color:var(--line)] gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("surat")}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
            activeTab === "surat"
              ? "border-[color:var(--forest)] text-[color:var(--forest)]"
              : "border-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
          }`}
        >
          Permohonan Surat ({suratList.length})
        </button>
        <button
          onClick={() => setActiveTab("pengaduan")}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
            activeTab === "pengaduan"
              ? "border-[color:var(--forest)] text-[color:var(--forest)]"
              : "border-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
          }`}
        >
          Pengaduan Warga ({pengaduanList.length})
        </button>
        <button
          onClick={() => setActiveTab("agenda")}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
            activeTab === "agenda"
              ? "border-[color:var(--forest)] text-[color:var(--forest)]"
              : "border-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
          }`}
        >
          Agenda Kegiatan ({agendaList.length})
        </button>
        <button
          onClick={() => setActiveTab("bukutamu")}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
            activeTab === "bukutamu"
              ? "border-[color:var(--forest)] text-[color:var(--forest)]"
              : "border-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
          }`}
        >
          Buku Tamu ({bukuTamuList.length})
        </button>
      </div>

      {/* TAB PERMOHONAN SURAT */}
      {activeTab === "surat" && (
        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto border border-[color:var(--line)] rounded-xl bg-[color:var(--card)] shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-[color:var(--parchment-2)] text-xs uppercase font-mono text-[color:var(--ink-soft)] border-b border-[color:var(--line)]">
                <tr>
                  <th className="p-3.5">Pemohon</th>
                  <th className="p-3.5">Jenis Surat & Keperluan</th>
                  <th className="p-3.5">Kontak</th>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--line)]">
                {suratList.map((item) => (
                  <tr key={item.id} className="hover:bg-[color:var(--parchment)]">
                    <td className="p-3.5">
                      <span className="font-semibold block text-[color:var(--ink)]">{item.nama}</span>
                      <span className="text-xs font-mono text-[color:var(--ink-soft)]">NIK: {item.nik}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-medium block text-[color:var(--forest-deep)]">{item.jenisSurat}</span>
                      <span className="text-xs text-[color:var(--ink-soft)]">{item.keperluan}</span>
                    </td>
                    <td className="p-3.5 text-xs font-mono text-[color:var(--ink-soft)]">{item.telepon}</td>
                    <td className="p-3.5 text-xs font-mono text-[color:var(--ink-soft)]">{item.tanggal}</td>
                    <td className="p-3.5">
                      <Badge
                        className={
                          item.status === "Selesai"
                            ? "bg-emerald-600 text-white"
                            : item.status === "Diproses"
                            ? "bg-amber-600 text-white"
                            : item.status === "Ditolak"
                            ? "bg-red-600 text-white"
                            : "bg-slate-600 text-white"
                        }
                      >
                        {item.status}
                      </Badge>
                      {item.catatan && <span className="text-[11px] text-[color:var(--ink-soft)] block mt-1">Note: {item.catatan}</span>}
                    </td>
                    <td className="p-3.5 text-right flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedSurat(item);
                          setSuratStatusInput(item.status);
                          setSuratCatatanInput(item.catatan || "");
                        }}
                        className="text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold px-2.5 py-1 rounded border border-amber-200 cursor-pointer"
                      >
                        Respon
                      </button>
                      <button
                        onClick={() => handleDeleteSurat(item.id)}
                        className="text-xs bg-red-50 text-red-700 hover:bg-red-100 font-semibold px-2.5 py-1 rounded border border-red-200 cursor-pointer"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB PENGADUAN WARGA */}
      {activeTab === "pengaduan" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4">
            {pengaduanList.map((item) => (
              <Card key={item.id} className="p-5 border border-[color:var(--line)] bg-[color:var(--card)] flex flex-col gap-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-semibold text-lg text-[color:var(--ink)]">{item.judul}</span>
                    <Badge
                      className={
                        item.status === "Selesai"
                          ? "bg-emerald-600 text-white"
                          : item.status === "Diproses"
                          ? "bg-amber-600 text-white"
                          : item.status === "Ditolak"
                          ? "bg-red-600 text-white"
                          : "bg-blue-600 text-white"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <span className="text-xs font-mono text-[color:var(--ink-soft)]">{item.tanggal}</span>
                </div>
                <p className="text-sm text-[color:var(--ink-soft)] leading-relaxed">{item.isi}</p>
                <div className="text-xs font-mono text-[color:var(--clay)] font-medium">
                  Pelapor: {item.nama} (Dusun {item.dusun})
                </div>

                {item.tanggapan && (
                  <div className="p-3 bg-[color:var(--parchment-2)] rounded-lg border-l-4 border-l-[color:var(--forest)] text-xs text-[color:var(--ink)] mt-1">
                    <strong className="block text-[color:var(--forest)] mb-0.5">Tanggapan Admin Desa:</strong>
                    {item.tanggapan}
                  </div>
                )}

                <div className="flex justify-end gap-2 border-t border-[color:var(--line)] pt-3">
                  <button
                    onClick={() => {
                      setSelectedPengaduan(item);
                      setPengaduanStatusInput(item.status);
                      setPengaduanTanggapanInput(item.tanggapan || "");
                    }}
                    className="text-xs bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold px-3 py-1.5 rounded border border-emerald-200 cursor-pointer"
                  >
                    Tindak Lanjuti & Tanggapi
                  </button>
                  <button
                    onClick={() => handleDeletePengaduan(item.id)}
                    className="text-xs bg-red-50 text-red-700 hover:bg-red-100 font-semibold px-3 py-1.5 rounded border border-red-200 cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB AGENDA KEGIATAN */}
      {activeTab === "agenda" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-[color:var(--ink-soft)]">
              Kalender kegiatan pemerintahan & kemasyarakatan Desa Sukoharjo.
            </p>
            <Button onClick={handleOpenAddAgenda} className="bg-[color:var(--forest)] text-white text-sm">
              + Tambah Agenda Baru
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agendaList.map((item) => (
              <Card key={item.id} className="p-5 border border-[color:var(--line)] bg-[color:var(--card)] flex flex-col justify-between shadow-sm">
                <div>
                  <Badge className="bg-[color:var(--forest)] text-white text-xs mb-2 border-none">
                    {item.category}
                  </Badge>
                  <h3 className="font-heading text-lg text-[color:var(--ink)] mb-2">{item.title}</h3>
                  <p className="text-xs text-[color:var(--ink-soft)] mb-4">{item.desc}</p>
                </div>
                <div className="border-t border-[color:var(--line)] pt-3 flex flex-col gap-2">
                  <div className="text-xs font-mono text-[color:var(--ink-soft)]">
                    📍 {item.location} <br />
                    📅 {item.date} · {item.time}
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => {
                        setEditingAgenda(item);
                        setIsAgendaModalOpen(true);
                      }}
                      className="text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded font-semibold cursor-pointer border border-amber-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAgenda(item.id)}
                      className="text-xs text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded font-semibold cursor-pointer border border-red-200"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB BUKU TAMU */}
      {activeTab === "bukutamu" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bukuTamuList.map((item) => (
              <Card key={item.id} className="p-5 border border-[color:var(--line)] bg-[color:var(--card)] flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-heading text-base font-semibold text-[color:var(--ink)]">{item.name}</h3>
                    <span className="text-xs font-mono text-[color:var(--ink-soft)]">{item.date}</span>
                  </div>
                  <span className="text-xs font-mono text-[color:var(--forest)] block mb-3">Asal: {item.origin}</span>
                  <p className="text-sm text-[color:var(--ink-soft)] italic bg-[color:var(--parchment-2)] p-3 rounded-lg border border-[color:var(--line)]">
                    "{item.message}"
                  </p>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => handleDeleteBukuTamu(item.id)}
                    className="text-xs bg-red-50 text-red-700 hover:bg-red-100 font-semibold px-3 py-1 rounded border border-red-200 cursor-pointer"
                  >
                    Hapus Entri
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* MODAL RESPON SURAT */}
      {selectedSurat && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 border border-[color:var(--line)]">
            <h3 className="font-heading text-xl text-[color:var(--forest-deep)]">Respon Permohonan Surat</h3>
            <div className="text-xs text-[color:var(--ink-soft)] font-mono bg-[color:var(--parchment-2)] p-3 rounded-lg border">
              Pemohon: <strong>{selectedSurat.nama}</strong> ({selectedSurat.jenisSurat})
            </div>
            <div>
              <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Status Permohonan</label>
              <select
                value={suratStatusInput}
                onChange={(e) => setSuratStatusInput(e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-[color:var(--line)] text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--forest)]"
              >
                <option value="Menunggu">Menunggu</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai (Siap Diambil)</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Catatan Admin / Syarat Tambahan</label>
              <textarea
                rows={3}
                value={suratCatatanInput}
                onChange={(e) => setSuratCatatanInput(e.target.value)}
                placeholder="Misal: Surat selesai dicetak, silakan ambil di Balai Desa dengan membawa Pengantar RT."
                className="w-full p-2.5 rounded-lg border border-[color:var(--line)] text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--forest)]"
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={() => setSelectedSurat(null)} className="text-xs">Batal</Button>
              <Button onClick={handleSaveSuratStatus} className="bg-[color:var(--forest)] text-white text-xs">Simpan Respon</Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PENGADUAN */}
      {selectedPengaduan && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 border border-[color:var(--line)]">
            <h3 className="font-heading text-xl text-[color:var(--forest-deep)]">Tanggapi Laporan Pengaduan</h3>
            <div className="text-xs text-[color:var(--ink-soft)] bg-[color:var(--parchment-2)] p-3 rounded-lg border">
              Judul: <strong>{selectedPengaduan.judul}</strong> ({selectedPengaduan.nama})
            </div>
            <div>
              <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Status Penanganan</label>
              <select
                value={pengaduanStatusInput}
                onChange={(e) => setPengaduanStatusInput(e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-[color:var(--line)] text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--forest)]"
              >
                <option value="Baru">Baru</option>
                <option value="Diproses">Diproses (Ditinjau)</option>
                <option value="Selesai">Selesai Ditangani</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Tanggapan / Jawaban Resmi Desa</label>
              <textarea
                rows={3}
                value={pengaduanTanggapanInput}
                onChange={(e) => setPengaduanTanggapanInput(e.target.value)}
                placeholder="Tuliskan tindakan atau klarifikasi dari pihak pemerintah desa..."
                className="w-full p-2.5 rounded-lg border border-[color:var(--line)] text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--forest)]"
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={() => setSelectedPengaduan(null)} className="text-xs">Batal</Button>
              <Button onClick={handleSavePengaduanStatus} className="bg-[color:var(--forest)] text-white text-xs">Simpan Tanggapan</Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGENDA */}
      {isAgendaModalOpen && editingAgenda && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 border border-[color:var(--line)]">
            <h3 className="font-heading text-xl text-[color:var(--forest-deep)]">
              {editingAgenda.id ? "Edit Agenda Desa" : "Tambah Agenda Baru"}
            </h3>
            <form onSubmit={handleSaveAgenda} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Judul Agenda</label>
                <input
                  type="text"
                  required
                  value={editingAgenda.title || ""}
                  onChange={(e) => setEditingAgenda({ ...editingAgenda, title: e.target.value })}
                  placeholder="Misal: Pelatihan Kemasan UMKM"
                  className="w-full p-2.5 rounded-lg border border-[color:var(--line)] text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--forest)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Kategori</label>
                  <select
                    value={editingAgenda.category || "Pemerintahan"}
                    onChange={(e) => setEditingAgenda({ ...editingAgenda, category: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[color:var(--line)] text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--forest)]"
                  >
                    <option value="Pemerintahan">Pemerintahan</option>
                    <option value="Ekonomi">Ekonomi</option>
                    <option value="Kemasyarakatan">Kemasyarakatan</option>
                    <option value="Budaya">Budaya</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Lokasi</label>
                  <input
                    type="text"
                    required
                    value={editingAgenda.location || ""}
                    onChange={(e) => setEditingAgenda({ ...editingAgenda, location: e.target.value })}
                    placeholder="Balai Desa Sukoharjo"
                    className="w-full p-2.5 rounded-lg border border-[color:var(--line)] text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--forest)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Tanggal</label>
                  <input
                    type="text"
                    required
                    value={editingAgenda.date || ""}
                    onChange={(e) => setEditingAgenda({ ...editingAgenda, date: e.target.value })}
                    placeholder="25 Juli 2026"
                    className="w-full p-2.5 rounded-lg border border-[color:var(--line)] text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--forest)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Waktu / Jam</label>
                  <input
                    type="text"
                    required
                    value={editingAgenda.time || ""}
                    onChange={(e) => setEditingAgenda({ ...editingAgenda, time: e.target.value })}
                    placeholder="09:00 WIB"
                    className="w-full p-2.5 rounded-lg border border-[color:var(--line)] text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--forest)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Deskripsi Ringkas</label>
                <textarea
                  rows={3}
                  value={editingAgenda.desc || ""}
                  onChange={(e) => setEditingAgenda({ ...editingAgenda, desc: e.target.value })}
                  placeholder="Rincian kegiatan..."
                  className="w-full p-2.5 rounded-lg border border-[color:var(--line)] text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--forest)]"
                />
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <Button type="button" variant="outline" onClick={() => setIsAgendaModalOpen(false)} className="text-xs">Batal</Button>
                <Button type="submit" disabled={isSubmittingAgenda} className="bg-[color:var(--forest)] text-white text-xs">
                  {isSubmittingAgenda ? "Menyimpan..." : "Simpan Agenda"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

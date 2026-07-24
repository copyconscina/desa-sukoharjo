"use client";

import { useState } from "react";
import { ProfilDesa, Lembaga } from "@/lib/data";
import {
  updateProfilVisiMisiAction,
  saveLembagaAction,
  deleteLembagaAction,
} from "@/app/admin/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  initialProfil: ProfilDesa;
  initialLembagaList: Lembaga[];
}

export default function ProfilClientPage({ initialProfil, initialLembagaList }: Props) {
  const [activeTab, setActiveTab] = useState<"visi" | "lembaga">("visi");
  const [visi, setVisi] = useState(initialProfil.visi);
  const [misiList, setMisiList] = useState<string[]>(initialProfil.misi || []);
  const [newMisiItem, setNewMisiItem] = useState("");
  const [isSavingVisi, setIsSavingVisi] = useState(false);

  // Lembaga State
  const [lembagaList, setLembagaList] = useState<Lembaga[]>(initialLembagaList);
  const [editingLembaga, setEditingLembaga] = useState<Partial<Lembaga> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittingLembaga, setIsSubmittingLembaga] = useState(false);

  // Visi Misi Handlers
  const handleAddMisi = () => {
    if (!newMisiItem.trim()) return;
    setMisiList([...misiList, newMisiItem.trim()]);
    setNewMisiItem("");
  };

  const handleRemoveMisi = (index: number) => {
    setMisiList(misiList.filter((_, i) => i !== index));
  };

  const handleSaveVisiMisi = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingVisi(true);
    try {
      await updateProfilVisiMisiAction(visi, misiList);
      alert("Visi & Misi Desa berhasil diperbarui!");
    } catch (err: any) {
      alert("Gagal memperbarui Visi & Misi: " + err.message);
    } finally {
      setIsSavingVisi(false);
    }
  };

  // Lembaga Handlers
  const handleOpenAddLembaga = () => {
    setEditingLembaga({
      name: "",
      leader: "",
      desc: "",
      members: "",
      icon: "🏛️",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditLembaga = (item: Lembaga) => {
    setEditingLembaga(item);
    setIsModalOpen(true);
  };

  const handleSaveLembaga = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLembaga?.name || !editingLembaga?.leader) return;

    setIsSubmittingLembaga(true);
    try {
      const res = await saveLembagaAction({
        id: editingLembaga.id,
        name: editingLembaga.name || "",
        leader: editingLembaga.leader || "",
        desc: editingLembaga.desc || "",
        members: editingLembaga.members || "",
        icon: editingLembaga.icon || "🏛️",
      });
      if (res.success && res.item) {
        if (editingLembaga.id) {
          setLembagaList(lembagaList.map((l) => (l.id === res.item.id ? res.item : l)));
        } else {
          setLembagaList([...lembagaList, res.item]);
        }
        setIsModalOpen(false);
        setEditingLembaga(null);
      }
    } catch (err: any) {
      alert("Gagal menyimpan lembaga: " + err.message);
    } finally {
      setIsSubmittingLembaga(false);
    }
  };

  const handleDeleteLembaga = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus lembaga ini?")) return;
    try {
      await deleteLembagaAction(id);
      setLembagaList(lembagaList.filter((l) => l.id !== id));
    } catch (err: any) {
      alert("Gagal menghapus lembaga: " + err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <p className="eyebrow">Kelola Profil Desa</p>
        <h1 className="text-3xl font-heading mt-1" style={{ color: "var(--forest-deep)" }}>
          Pengaturan Profil & Lembaga Desa
        </h1>
        <p className="text-sm text-[color:var(--ink-soft)] mt-1">
          Kelola visi & misi desa serta struktur organisasi kelembagaan (BPD, PKK, Karang Taruna, LPMD, RT/RW).
        </p>
      </div>

      {/* TABS */}
      <div className="flex border-b border-[color:var(--line)] gap-4">
        <button
          onClick={() => setActiveTab("visi")}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 ${
            activeTab === "visi"
              ? "border-[color:var(--forest)] text-[color:var(--forest)]"
              : "border-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
          }`}
        >
          Visi & Misi Desa
        </button>
        <button
          onClick={() => setActiveTab("lembaga")}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 ${
            activeTab === "lembaga"
              ? "border-[color:var(--forest)] text-[color:var(--forest)]"
              : "border-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
          }`}
        >
          Lembaga Desa ({lembagaList.length})
        </button>
      </div>

      {/* TAB VISI MISI */}
      {activeTab === "visi" && (
        <form onSubmit={handleSaveVisiMisi} className="flex flex-col gap-6 max-w-4xl">
          <Card className="p-6 border border-[color:var(--line)] bg-[color:var(--card)] flex flex-col gap-4 shadow-sm">
            <h3 className="font-heading text-lg text-[color:var(--forest-deep)]">Visi Desa</h3>
            <div>
              <label className="text-xs font-mono uppercase text-[color:var(--ink-soft)] block mb-1">
                Pernyataan Visi Desa
              </label>
              <textarea
                value={visi}
                onChange={(e) => setVisi(e.target.value)}
                rows={3}
                required
                className="w-full p-3 rounded-lg border border-[color:var(--line)] bg-[#fbfaf5] text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--forest)]"
              />
            </div>
          </Card>

          <Card className="p-6 border border-[color:var(--line)] bg-[color:var(--card)] flex flex-col gap-4 shadow-sm">
            <h3 className="font-heading text-lg text-[color:var(--forest-deep)]">Misi Desa</h3>
            <div className="flex flex-col gap-3">
              {misiList.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-[color:var(--parchment-2)] rounded-lg border border-[color:var(--line)] text-sm">
                  <span className="font-mono text-xs text-[color:var(--forest)] font-bold">{idx + 1}.</span>
                  <span className="flex-1 text-[color:var(--ink)]">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMisi(idx)}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1 bg-red-50 rounded cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              ))}

              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Tambah butir Misi baru..."
                  value={newMisiItem}
                  onChange={(e) => setNewMisiItem(e.target.value)}
                  className="flex-1 p-2.5 rounded-lg border border-[color:var(--line)] bg-[#fbfaf5] text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--forest)]"
                />
                <Button type="button" onClick={handleAddMisi} className="bg-[color:var(--forest)] text-white text-xs">
                  + Tambah
                </Button>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSavingVisi} className="bg-[color:var(--forest)] text-white px-6">
              {isSavingVisi ? "Menyimpan..." : "Simpan Visi & Misi"}
            </Button>
          </div>
        </form>
      )}

      {/* TAB LEMBAGA DESA */}
      {activeTab === "lembaga" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-[color:var(--ink-soft)]">
              Daftar organisasi kelembagaan resmi di Desa Sukoharjo.
            </p>
            <Button onClick={handleOpenAddLembaga} className="bg-[color:var(--forest)] text-white text-sm">
              + Tambah Lembaga Baru
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lembagaList.map((item) => (
              <Card key={item.id} className="p-5 border border-[color:var(--line)] bg-[color:var(--card)] flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{item.icon}</span>
                    <Badge className="bg-[color:var(--forest)] text-white text-xs border-none">
                      {item.members}
                    </Badge>
                  </div>
                  <h3 className="font-heading text-lg text-[color:var(--ink)] mb-1">{item.name}</h3>
                  <p className="text-xs font-mono text-[color:var(--clay)] font-semibold mb-2">{item.leader}</p>
                  <p className="text-xs text-[color:var(--ink-soft)] leading-relaxed">{item.desc}</p>
                </div>
                <div className="flex justify-end gap-2 border-t border-[color:var(--line)] pt-3 mt-4">
                  <button
                    onClick={() => handleOpenEditLembaga(item)}
                    className="text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-md font-semibold cursor-pointer border border-amber-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteLembaga(item.id)}
                    className="text-xs text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md font-semibold cursor-pointer border border-red-200"
                  >
                    Hapus
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* MODAL FORM LEMBAGA */}
      {isModalOpen && editingLembaga && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 border border-[color:var(--line)]">
            <h3 className="font-heading text-xl text-[color:var(--forest-deep)]">
              {editingLembaga.id ? "Edit Lembaga Desa" : "Tambah Lembaga Baru"}
            </h3>
            <form onSubmit={handleSaveLembaga} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Nama Lembaga</label>
                <input
                  type="text"
                  required
                  value={editingLembaga.name || ""}
                  onChange={(e) => setEditingLembaga({ ...editingLembaga, name: e.target.value })}
                  placeholder="Misal: Karang Taruna Dusun"
                  className="w-full p-2.5 rounded-lg border border-[color:var(--line)] text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--forest)]"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Ketua / Penanggung Jawab</label>
                <input
                  type="text"
                  required
                  value={editingLembaga.leader || ""}
                  onChange={(e) => setEditingLembaga({ ...editingLembaga, leader: e.target.value })}
                  placeholder="Ketua: Bpk. Nama Lengkap"
                  className="w-full p-2.5 rounded-lg border border-[color:var(--line)] text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--forest)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Jumlah Anggota</label>
                  <input
                    type="text"
                    required
                    value={editingLembaga.members || ""}
                    onChange={(e) => setEditingLembaga({ ...editingLembaga, members: e.target.value })}
                    placeholder="15 Anggota"
                    className="w-full p-2.5 rounded-lg border border-[color:var(--line)] text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--forest)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Icon (Emoji)</label>
                  <input
                    type="text"
                    value={editingLembaga.icon || "🏛️"}
                    onChange={(e) => setEditingLembaga({ ...editingLembaga, icon: e.target.value })}
                    placeholder="🏛️"
                    className="w-full p-2.5 rounded-lg border border-[color:var(--line)] text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--forest)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-[color:var(--ink-soft)] block mb-1">Deskripsi & Tugas</label>
                <textarea
                  rows={3}
                  value={editingLembaga.desc || ""}
                  onChange={(e) => setEditingLembaga({ ...editingLembaga, desc: e.target.value })}
                  placeholder="Deskripsi singkat fungsi dan peran lembaga..."
                  className="w-full p-2.5 rounded-lg border border-[color:var(--line)] text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--forest)]"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs"
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmittingLembaga} className="bg-[color:var(--forest)] text-white text-xs">
                  {isSubmittingLembaga ? "Menyimpan..." : "Simpan Data"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

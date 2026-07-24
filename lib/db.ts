import { supabase, isPlaceholderSupabase } from "@/utils/supabase/static";
import { supabaseServer } from "@/utils/supabase/admin";
import {
  Umkm,
  Berita,
  GaleriItem,
  Potensi,
  Lembaga,
  ProfilDesa,
  Agenda,
  BukuTamu,
  PermohonanSurat,
  Pengaduan,
  ApbdesRingkasan,
  ApbdesBidang,
  ProdukHukum,
  PpidItem,
  BansosItem,
} from "./data";
import dbJson from "./db.json";

// UMKM DB Operations
export async function getUmkmList(): Promise<Umkm[]> {
  if (isPlaceholderSupabase) {
    return dbJson.umkmData as Umkm[];
  }
  const { data, error } = await supabase
    .from("umkm")
    .select("*")
    .order("id", { ascending: true });
    
  if (error) {
    console.warn("Using fallback UMKM list due to connection error:", error.message);
    return dbJson.umkmData as Umkm[];
  }
  return data as Umkm[];
}

export async function getUmkmById(id: number): Promise<Umkm | undefined> {
  if (isPlaceholderSupabase) {
    return (dbJson.umkmData.find((u) => u.id === id) || dbJson.umkmData[0]) as Umkm;
  }
  const { data, error } = await supabase
    .from("umkm")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.warn(`Using fallback UMKM for id ${id}`);
    return dbJson.umkmData.find((u) => u.id === id) as Umkm | undefined;
  }
  return data as Umkm;
}

export async function saveUmkm(item: Omit<Umkm, "id"> & { id?: number }): Promise<Umkm> {
  const payload = {
    name: item.name,
    owner: item.owner,
    category: item.category,
    year: item.year,
    product: item.product,
    desc: item.desc,
    address: item.address,
    wa: item.wa,
    social: item.social || null,
    grad: item.grad || "",
    image: item.image || null,
  };

  if (item.id) {
    const { data, error } = await supabaseServer
      .from("umkm")
      .update(payload)
      .eq("id", item.id)
      .select()
      .single();
      
    if (error) throw error;
    return data as Umkm;
  } else {
    const { data, error } = await supabaseServer
      .from("umkm")
      .insert(payload)
      .select()
      .single();
      
    if (error) throw error;
    return data as Umkm;
  }
}

export async function deleteUmkm(id: number): Promise<boolean> {
  const { error } = await supabaseServer
    .from("umkm")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting UMKM ${id}:`, error);
    return false;
  }
  return true;
}

// Berita DB Operations
export async function getBeritaList(): Promise<Berita[]> {
  if (isPlaceholderSupabase) {
    return dbJson.beritaData.map((b, idx) => ({
      id: idx + 1,
      tag: b.tag,
      cls: b.cls || "",
      title: b.title,
      desc: b.desc || "",
      date: b.date,
      images: undefined,
    })) as Berita[];
  }

  const { data, error } = await supabase
    .from("berita")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    console.warn("Using fallback Berita list due to connection error:", error.message);
    return dbJson.beritaData.map((b, idx) => ({
      id: idx + 1,
      tag: b.tag,
      cls: b.cls || "",
      title: b.title,
      desc: b.desc || "",
      date: b.date,
      images: undefined,
    })) as Berita[];
  }

  return data.map((b: any) => ({
    id: b.id,
    tag: b.tag ? b.tag.charAt(0).toUpperCase() + b.tag.slice(1) : "",
    cls: b.cls || "",
    title: b.title,
    desc: b.desc || "",
    date: new Date(b.published_at).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    images: b.images || null,
  })) as Berita[];
}

export async function getBeritaById(id: number): Promise<Berita | undefined> {
  if (isPlaceholderSupabase) {
    const list = dbJson.beritaData.map((b, idx) => ({
      id: idx + 1,
      tag: b.tag,
      cls: b.cls || "",
      title: b.title,
      desc: b.desc || "",
      date: b.date,
      images: undefined,
    }));
    return list.find((b) => b.id === id) || list[0];
  }

  const { data, error } = await supabase
    .from("berita")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.warn(`Using fallback Berita for id ${id}`);
    return undefined;
  }

  return {
    id: data.id,
    tag: data.tag ? data.tag.charAt(0).toUpperCase() + data.tag.slice(1) : "",
    cls: data.cls || "",
    title: data.title,
    desc: data.desc || "",
    date: new Date(data.published_at).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    images: data.images || undefined,
  } as Berita;
}

export async function addBerita(item: Omit<Berita, "date"> & { date?: string }): Promise<Berita> {
  const { data, error } = await supabaseServer
    .from("berita")
    .insert({
      tag: item.tag.toLowerCase(),
      cls: item.cls || "",
      title: item.title,
      desc: item.desc,
      published_at: new Date().toISOString(),
      images: item.images || null,
    })
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    tag: data.tag ? data.tag.charAt(0).toUpperCase() + data.tag.slice(1) : "",
    cls: data.cls || "",
    title: data.title,
    desc: data.desc || "",
    date: new Date(data.published_at).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    images: data.images || undefined,
  };
}

export async function deleteBeritaById(id: number): Promise<boolean> {
  const { error } = await supabaseServer
    .from("berita")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting Berita with id ${id}:`, error);
    return false;
  }
  return true;
}

export async function deleteBerita(id: number): Promise<boolean> {
  return deleteBeritaById(id);
}


// Galeri DB Operations
export async function getGaleriList(): Promise<GaleriItem[]> {
  if (isPlaceholderSupabase) {
    return dbJson.galeriData.map((g, idx) => ({
      id: idx + 1,
      label: g.label,
      cat: g.cat,
      grad: g.grad || "",
      image: undefined,
      desc: "",
    })) as GaleriItem[];
  }

  const { data, error } = await supabase
    .from("galeri")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Using fallback Galeri list due to connection error:", error.message);
    return dbJson.galeriData.map((g, idx) => ({
      id: idx + 1,
      label: g.label,
      cat: g.cat,
      grad: g.grad || "",
      image: undefined,
      desc: "",
    })) as GaleriItem[];
  }
  return data.map((g: any) => ({
    id: g.id,
    label: g.label,
    cat: g.cat,
    grad: g.grad || "",
    image: g.image || null,
    desc: g.desc || "",
  })) as GaleriItem[];
}

export async function addGaleri(item: GaleriItem): Promise<GaleriItem> {
  const { data, error } = await supabaseServer
    .from("galeri")
    .insert({
      label: item.label,
      cat: item.cat,
      grad: item.grad || "",
      image: item.image || null,
      desc: item.desc || null,
    })
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    label: data.label,
    cat: data.cat,
    grad: data.grad || "",
    image: data.image || null,
    desc: data.desc || "",
  } as GaleriItem;
}

export async function deleteGaleriById(id: number): Promise<boolean> {
  const { error } = await supabaseServer
    .from("galeri")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting Galeri with id ${id}:`, error);
    return false;
  }
  return true;
}

export async function deleteGaleri(id: number): Promise<boolean> {
  return deleteGaleriById(id);
}

// Potensi DB Operations
export async function getPotensiList(): Promise<Potensi[]> {
  if (isPlaceholderSupabase) {
    return dbJson.potensiData as Potensi[];
  }

  const { data, error } = await supabase
    .from("potensi")
    .select("*")
    .order("num", { ascending: true });

  if (error) {
    console.warn("Using fallback Potensi list due to connection error:", error.message);
    return dbJson.potensiData as Potensi[];
  }
  return data as Potensi[];
}

export async function updatePotensi(num: string, title: string, desc: string): Promise<boolean> {
  const { error } = await supabaseServer
    .from("potensi")
    .update({ title, desc, updated_at: new Date().toISOString() })
    .eq("num", num);

  if (error) {
    console.error(`Error updating Potensi ${num}:`, error);
    return false;
  }
  return true;
}

// In-Memory Data Stores for Fallback / Local Mode
let memoryLembaga: Lembaga[] = [
  { id: 1, name: "Pemerintah Desa Sukoharjo", leader: "Kepala Desa: Bpk. Sunarto", desc: "Unsur penyelenggara pemerintahan desa yang bertugas memimpin pelaksanaan urusan pemerintahan, pembangunan, dan kemasyarakatan.", members: "14 Perangkat Desa & Staf", icon: "🏛️" },
  { id: 2, name: "Badan Permusyawaratan Desa (BPD)", leader: "Ketua: Bpk. Drs. Mulyono", desc: "Lembaga perwujudan demokrasi dalam penyelenggaraan pemerintahan desa yang mengawasi kinerja Kades dan menyalurkan aspirasi warga.", members: "9 Anggota BPD", icon: "📜" },
  { id: 3, name: "Pemberdayaan Kesejahteraan Keluarga (PKK)", leader: "Ketua: Ibu Suparmi", desc: "Lembaga kemasyarakatan sebagai mitra kerja pemerintah desa dalam membina dan memberdayakan keluarga sejahtera.", members: "35 Pengurus & Kader Pokja", icon: "🌸" },
  { id: 4, name: "Karang Taruna Sukoharjo Mandiri", leader: "Ketua: Mas Rizky Febrian", desc: "Wadah pengembangan generasi muda desa di bidang olahraga, kebudayaan, sosial, dan kewirausahaan pemuda.", members: "45 Pemuda & Pemudi Dusun", icon: "⚽" },
  { id: 5, name: "Lembaga Pemberdayaan Masyarakat Desa (LPMD)", leader: "Ketua: Bpk. Suroto", desc: "Wadah yang dibentuk atas prakarsa masyarakat sebagai mitra pemerintah desa dalam menampung dan menyalurkan aspirasi pembangunan.", members: "11 Pengurus LPMD", icon: "🤝" },
  { id: 6, name: "Pengurus RT & RW se-Desa Sukoharjo", leader: "Koordinator: Bpk. Wagiman", desc: "Lembaga kemasyarakatan terdepan yang membantu pelayanan administratif dan menjaga keharmonisan antar warga dusun.", members: "11 RW & 38 RT", icon: "🏡" },
];

let memoryProfil: ProfilDesa = {
  visi: "Nyawiji sesarengan mbangun Desa Sukoharjo menjadi maju, inovatif, dan bermartabat.",
  misi: [
    "Memperkuat tata kelola pemerintah yang bersih, demokratis, dan transparan, meliputi manajemen keuangan dan manajemen pelayanan pada masyarakat.",
    "Pemerataan pembangunan yang berkeadilan.",
    "Meningkatkan sumber daya manusia yang unggul dan berkualitas.",
    "Mendorong kemandirian ekonomi kerakyatan yang berbasis pada sektor pertanian, peternakan, dan industri rumah tangga.",
    "Meningkatkan inovasi desa dengan pemberdayaan masyarakat.",
    "Meningkatkan kualitas kehidupan beragama, serta melestarikan adat istiadat dan budaya pada masyarakat."
  ]
};

let memoryAgenda: Agenda[] = [
  { id: 1, title: "Musyawarah Desa (Musdes) Rencana Pembangunan 2027", desc: "Pembahasan prioritas pembangunan sarana infrastruktur jalan tani dan pemberdayaan ekonomi UMKM desa.", location: "Balai Desa Sukoharjo", date: "15 Juli 2026", time: "09:00 WIB", category: "Pemerintahan" },
  { id: 2, title: "Pelatihan Packaging & Pemasaran Digital UMKM", desc: "Pelatihan pembuatan kemasan produk dan pendaftaran sertifikasi halal untuk pelaku UMKM lokal.", location: "Pendopo Desa Sukoharjo", date: "22 Juli 2026", time: "13:00 WIB", category: "Ekonomi" },
  { id: 3, title: "Gotong Royong & Pembersihan Akses Wisata", desc: "Kerja bakti pembersihan jalur perbukitan dan lingkungan dusun bersama Karang Taruna.", location: "Dusun Ngrancah & Sukorejo", date: "28 Juli 2026", time: "07:00 WIB", category: "Kemasyarakatan" },
];

let memoryBukuTamu: BukuTamu[] = [
  { id: 1, name: "Bpk. Bambang Wijaya", origin: "Semarang", message: "Aplikasi website desanya sangat bagus dan informatif!", date: "20 Juli 2026" },
  { id: 2, name: "Ibu Rina Susanti", origin: "Solo", message: "Mohon info jadwal layanan pembuatan SKU di Balai Desa.", date: "21 Juli 2026" }
];

let memoryPermohonanSurat: PermohonanSurat[] = [
  { id: 1, nama: "Joko Santoso", nik: "3312091408890001", jenisSurat: "Surat Keterangan Usaha (SKU)", keperluan: "Pengajuan KUR Bank BRI", telepon: "081234567890", tanggal: "22 Juli 2026", status: "Diproses", catatan: "Dokumen Persyaratan Lengkap" },
  { id: 2, nama: "Siti Rahma", nik: "3312095203950002", jenisSurat: "Surat Keterangan Tidak Mampu (SKTM)", keperluan: "Beasiswa Kuliah Anak", telepon: "082198765432", tanggal: "23 Juli 2026", status: "Menunggu" }
];

let memoryPengaduan: Pengaduan[] = [
  { id: 1, nama: "Sugeng Mulyono", dusun: "Sukorejo", judul: "Penerangan Jalan Dusun Bonagung Mati", isi: "Lampu PJU dekat pertigaan RT 02 Bonagung padam sejak 3 hari lalu.", tanggal: "21 Juli 2026", status: "Diproses", tanggapan: "Tim teknis perangkat desa akan mengecek lokasi hari ini." }
];

let memoryApbdesRingkasan: ApbdesRingkasan = {
  pendapatan: "Rp 1.485.000.000",
  belanja: "Rp 1.450.000.000",
  pembiayaan: "Rp 35.000.000",
  tahun: 2026,
};

let memoryApbdesBidang: ApbdesBidang[] = [
  { id: 1, name: "Bidang Pembangunan Desa", anggaran: "Rp 680.000.000", realisasi: "Rp 450.000.000", pct: "66.2%", desc: "Pengaspalan jalan tani dusun, perbaikan drainase sawah, dan penerangan jalan umum." },
  { id: 2, name: "Bidang Penyelenggaraan Pemerintahan", anggaran: "Rp 390.000.000", realisasi: "Rp 310.000.000", pct: "79.4%", desc: "Siltap & tunjangan Kades/perangkat, operasional kantor desa, dan tata kelola sistem digital." },
  { id: 3, name: "Bidang Pembinaan Kemasyarakatan", anggaran: "Rp 180.000.000", realisasi: "Rp 145.000.000", pct: "80.5%", desc: "Dukungan kegiatan Karang Taruna, PKK, posyandu balita/lansia, dan festival budaya lokal." },
  { id: 4, name: "Bidang Pemberdayaan Masyarakat (UMKM)", anggaran: "Rp 150.000.000", realisasi: "Rp 110.000.000", pct: "73.3%", desc: "Penyertaan modal BUMDes, pelatihan kemasan UMKM, dan bantuan bibit ternak kambing etawa." },
  { id: 5, name: "Bidang Penanggulangan Bencana & Darurat", anggaran: "Rp 50.000.000", realisasi: "Rp 15.000.000", pct: "30.0%", desc: "Dana siaga bencana alam tanah longsor dan bantuan darurat sosial warga." }
];

let memoryProdukHukum: ProdukHukum[] = [
  { id: 1, nomor: "Perdes No. 03 Tahun 2026", judul: "Peraturan Desa tentang Rencana Kerja Pemerintah Desa (RKPDes) 2026", kategori: "Peraturan Desa", tanggal: "10 Januari 2026" },
  { id: 2, nomor: "SK Kades No. 12 Tahun 2026", judul: "Keputusan Kepala Desa tentang Pengangkatan Pengurus BUMDes Sukoharjo", kategori: "SK Kepala Desa", tanggal: "05 Februari 2026" }
];

let memoryPpid: PpidItem[] = [
  { id: 1, judul: "Laporan Realisasi APBDes Sukoharjo TA 2025", kategori: "Berkala", format: "PDF", ukuran: "1.2 MB", tanggal: "15 Jan 2026" },
  { id: 2, judul: "SOP Pelayanan Permohonan Surat Mandiri Warga", kategori: "Setiap Saat", format: "PDF", ukuran: "450 KB", tanggal: "01 Mar 2026" }
];

let memoryBansos: BansosItem[] = [
  { id: 1, name: "Bantuan Langsung Tunai (BLT Dana Desa)", source: "Dana Desa Sukoharjo", kpmCount: 45, nominal: "Rp 300.000 / Bulan", status: "Tersalurkan Tahap II", desc: "Sasaran keluarga miskin ekstrem yang tidak menerima program bantuan sosial PKH/BPNT." },
  { id: 2, name: "Program Keluarga Harapan (PKH)", source: "Kemensos RI", kpmCount: 120, nominal: "Bervariasi per Komponen", status: "Aktif Penyaluran", desc: "Bantuan bersyarat untuk keluarga memiliki anak sekolah, balita, ibu hamil, dan lansia." },
  { id: 3, name: "Bantuan Sembako (BPNT)", source: "Kemensos RI", kpmCount: 185, nominal: "Rp 200.000 / Bulan", status: "Aktif Penyaluran", desc: "Bantuan Pangan Non-Tunai dalam bentuk e-warong sembako." }
];

// --- LEMBAGA & PROFIL ---
export async function getLembagaList(): Promise<Lembaga[]> {
  if (!isPlaceholderSupabase) {
    const { data, error } = await supabase.from("lembaga").select("*").order("id", { ascending: true });
    if (!error && data) return data as Lembaga[];
  }
  return memoryLembaga;
}

export async function saveLembaga(item: Omit<Lembaga, "id"> & { id?: number }): Promise<Lembaga> {
  if (!isPlaceholderSupabase) {
    if (item.id) {
      const { data, error } = await supabaseServer.from("lembaga").update(item).eq("id", item.id).select().single();
      if (!error && data) return data as Lembaga;
    } else {
      const { data, error } = await supabaseServer.from("lembaga").insert(item).select().single();
      if (!error && data) return data as Lembaga;
    }
  }
  if (item.id) {
    memoryLembaga = memoryLembaga.map((l) => (l.id === item.id ? { ...l, ...item } : l));
    return { ...item, id: item.id };
  } else {
    const newId = memoryLembaga.length > 0 ? Math.max(...memoryLembaga.map((l) => l.id)) + 1 : 1;
    const newItem = { ...item, id: newId };
    memoryLembaga.push(newItem);
    return newItem;
  }
}

export async function deleteLembaga(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    await supabaseServer.from("lembaga").delete().eq("id", id);
  }
  memoryLembaga = memoryLembaga.filter((l) => l.id !== id);
  return true;
}

export async function getProfilData(): Promise<ProfilDesa> {
  if (!isPlaceholderSupabase) {
    const { data } = await supabase.from("profil").select("*").single();
    if (data) return data as ProfilDesa;
  }
  return memoryProfil;
}

export async function updateProfilVisiMisi(visi: string, misi: string[]): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    await supabaseServer.from("profil").upsert({ id: 1, visi, misi });
  }
  memoryProfil = { visi, misi };
  return true;
}

// --- AGENDA ---
export async function getAgendaList(): Promise<Agenda[]> {
  if (!isPlaceholderSupabase) {
    const { data, error } = await supabase.from("agenda").select("*").order("id", { ascending: false });
    if (!error && data) return data as Agenda[];
  }
  return memoryAgenda;
}

export async function saveAgenda(item: Omit<Agenda, "id"> & { id?: number }): Promise<Agenda> {
  if (!isPlaceholderSupabase) {
    if (item.id) {
      const { data, error } = await supabaseServer.from("agenda").update(item).eq("id", item.id).select().single();
      if (!error && data) return data as Agenda;
    } else {
      const { data, error } = await supabaseServer.from("agenda").insert(item).select().single();
      if (!error && data) return data as Agenda;
    }
  }
  if (item.id) {
    memoryAgenda = memoryAgenda.map((a) => (a.id === item.id ? { ...a, ...item } : a));
    return { ...item, id: item.id };
  } else {
    const newId = memoryAgenda.length > 0 ? Math.max(...memoryAgenda.map((a) => a.id)) + 1 : 1;
    const newItem = { ...item, id: newId };
    memoryAgenda.unshift(newItem);
    return newItem;
  }
}

export async function deleteAgenda(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    await supabaseServer.from("agenda").delete().eq("id", id);
  }
  memoryAgenda = memoryAgenda.filter((a) => a.id !== id);
  return true;
}

// --- BUKU TAMU ---
export async function getBukuTamuList(): Promise<BukuTamu[]> {
  if (!isPlaceholderSupabase) {
    const { data, error } = await supabase.from("buku_tamu").select("*").order("id", { ascending: false });
    if (!error && data) return data as BukuTamu[];
  }
  return memoryBukuTamu;
}

export async function addBukuTamu(item: Omit<BukuTamu, "id">): Promise<BukuTamu> {
  if (!isPlaceholderSupabase) {
    const { data, error } = await supabase.from("buku_tamu").insert(item).select().single();
    if (!error && data) return data as BukuTamu;
  }
  const newId = memoryBukuTamu.length > 0 ? Math.max(...memoryBukuTamu.map((b) => b.id)) + 1 : 1;
  const newItem = { ...item, id: newId };
  memoryBukuTamu.unshift(newItem);
  return newItem;
}

export async function deleteBukuTamu(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    await supabaseServer.from("buku_tamu").delete().eq("id", id);
  }
  memoryBukuTamu = memoryBukuTamu.filter((b) => b.id !== id);
  return true;
}

// --- PERMOHONAN SURAT ---
export async function getPermohonanSuratList(): Promise<PermohonanSurat[]> {
  if (!isPlaceholderSupabase) {
    const { data, error } = await supabase.from("permohonan_surat").select("*").order("id", { ascending: false });
    if (!error && data) return data as PermohonanSurat[];
  }
  return memoryPermohonanSurat;
}

export async function addPermohonanSurat(item: Omit<PermohonanSurat, "id" | "status" | "tanggal">): Promise<PermohonanSurat> {
  const payload: Omit<PermohonanSurat, "id"> = {
    ...item,
    tanggal: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    status: "Menunggu",
  };
  if (!isPlaceholderSupabase) {
    const { data, error } = await supabase.from("permohonan_surat").insert(payload).select().single();
    if (!error && data) return data as PermohonanSurat;
  }
  const newId = memoryPermohonanSurat.length > 0 ? Math.max(...memoryPermohonanSurat.map((s) => s.id)) + 1 : 1;
  const newItem = { ...payload, id: newId };
  memoryPermohonanSurat.unshift(newItem);
  return newItem;
}

export async function updateStatusSurat(id: number, status: PermohonanSurat["status"], catatan?: string): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    await supabaseServer.from("permohonan_surat").update({ status, catatan }).eq("id", id);
  }
  memoryPermohonanSurat = memoryPermohonanSurat.map((s) => (s.id === id ? { ...s, status, catatan } : s));
  return true;
}

export async function deletePermohonanSurat(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    await supabaseServer.from("permohonan_surat").delete().eq("id", id);
  }
  memoryPermohonanSurat = memoryPermohonanSurat.filter((s) => s.id !== id);
  return true;
}

// --- PENGADUAN WARGA ---
export async function getPengaduanList(): Promise<Pengaduan[]> {
  if (!isPlaceholderSupabase) {
    const { data, error } = await supabase.from("pengaduan").select("*").order("id", { ascending: false });
    if (!error && data) return data as Pengaduan[];
  }
  return memoryPengaduan;
}

export async function addPengaduan(item: Omit<Pengaduan, "id" | "status" | "tanggal">): Promise<Pengaduan> {
  const payload: Omit<Pengaduan, "id"> = {
    ...item,
    tanggal: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    status: "Baru",
  };
  if (!isPlaceholderSupabase) {
    const { data, error } = await supabase.from("pengaduan").insert(payload).select().single();
    if (!error && data) return data as Pengaduan;
  }
  const newId = memoryPengaduan.length > 0 ? Math.max(...memoryPengaduan.map((p) => p.id)) + 1 : 1;
  const newItem = { ...payload, id: newId };
  memoryPengaduan.unshift(newItem);
  return newItem;
}

export async function updateStatusPengaduan(id: number, status: Pengaduan["status"], tanggapan?: string): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    await supabaseServer.from("pengaduan").update({ status, tanggapan }).eq("id", id);
  }
  memoryPengaduan = memoryPengaduan.map((p) => (p.id === id ? { ...p, status, tanggapan } : p));
  return true;
}

export async function deletePengaduan(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    await supabaseServer.from("pengaduan").delete().eq("id", id);
  }
  memoryPengaduan = memoryPengaduan.filter((p) => p.id !== id);
  return true;
}

// --- APBDES & KEUANGAN ---
export async function getApbdesRingkasan(): Promise<ApbdesRingkasan> {
  if (!isPlaceholderSupabase) {
    const { data } = await supabase.from("apbdes_ringkasan").select("*").single();
    if (data) return data as ApbdesRingkasan;
  }
  return memoryApbdesRingkasan;
}

export async function updateApbdesRingkasan(dataInput: ApbdesRingkasan): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    await supabaseServer.from("apbdes_ringkasan").upsert({ id: 1, ...dataInput });
  }
  memoryApbdesRingkasan = dataInput;
  return true;
}

export async function getApbdesBidangList(): Promise<ApbdesBidang[]> {
  if (!isPlaceholderSupabase) {
    const { data, error } = await supabase.from("apbdes_bidang").select("*").order("id", { ascending: true });
    if (!error && data) return data as ApbdesBidang[];
  }
  return memoryApbdesBidang;
}

export async function saveApbdesBidang(item: Omit<ApbdesBidang, "id"> & { id?: number }): Promise<ApbdesBidang> {
  if (!isPlaceholderSupabase) {
    if (item.id) {
      const { data, error } = await supabaseServer.from("apbdes_bidang").update(item).eq("id", item.id).select().single();
      if (!error && data) return data as ApbdesBidang;
    } else {
      const { data, error } = await supabaseServer.from("apbdes_bidang").insert(item).select().single();
      if (!error && data) return data as ApbdesBidang;
    }
  }
  if (item.id) {
    memoryApbdesBidang = memoryApbdesBidang.map((b) => (b.id === item.id ? { ...b, ...item } : b));
    return { ...item, id: item.id };
  } else {
    const newId = memoryApbdesBidang.length > 0 ? Math.max(...memoryApbdesBidang.map((b) => b.id)) + 1 : 1;
    const newItem = { ...item, id: newId };
    memoryApbdesBidang.push(newItem);
    return newItem;
  }
}

export async function deleteApbdesBidang(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    await supabaseServer.from("apbdes_bidang").delete().eq("id", id);
  }
  memoryApbdesBidang = memoryApbdesBidang.filter((b) => b.id !== id);
  return true;
}

// --- PRODUK HUKUM DESA ---
export async function getProdukHukumList(): Promise<ProdukHukum[]> {
  if (!isPlaceholderSupabase) {
    const { data, error } = await supabase.from("produk_hukum").select("*").order("id", { ascending: false });
    if (!error && data) return data as ProdukHukum[];
  }
  return memoryProdukHukum;
}

export async function saveProdukHukum(item: Omit<ProdukHukum, "id"> & { id?: number }): Promise<ProdukHukum> {
  if (!isPlaceholderSupabase) {
    if (item.id) {
      const { data, error } = await supabaseServer.from("produk_hukum").update(item).eq("id", item.id).select().single();
      if (!error && data) return data as ProdukHukum;
    } else {
      const { data, error } = await supabaseServer.from("produk_hukum").insert(item).select().single();
      if (!error && data) return data as ProdukHukum;
    }
  }
  if (item.id) {
    memoryProdukHukum = memoryProdukHukum.map((p) => (p.id === item.id ? { ...p, ...item } : p));
    return { ...item, id: item.id };
  } else {
    const newId = memoryProdukHukum.length > 0 ? Math.max(...memoryProdukHukum.map((p) => p.id)) + 1 : 1;
    const newItem = { ...item, id: newId };
    memoryProdukHukum.unshift(newItem);
    return newItem;
  }
}

export async function deleteProdukHukum(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    await supabaseServer.from("produk_hukum").delete().eq("id", id);
  }
  memoryProdukHukum = memoryProdukHukum.filter((p) => p.id !== id);
  return true;
}

// --- PPID INFORMASI PUBLIK ---
export async function getPpidList(): Promise<PpidItem[]> {
  if (!isPlaceholderSupabase) {
    const { data, error } = await supabase.from("ppid").select("*").order("id", { ascending: false });
    if (!error && data) return data as PpidItem[];
  }
  return memoryPpid;
}

export async function savePpid(item: Omit<PpidItem, "id"> & { id?: number }): Promise<PpidItem> {
  if (!isPlaceholderSupabase) {
    if (item.id) {
      const { data, error } = await supabaseServer.from("ppid").update(item).eq("id", item.id).select().single();
      if (!error && data) return data as PpidItem;
    } else {
      const { data, error } = await supabaseServer.from("ppid").insert(item).select().single();
      if (!error && data) return data as PpidItem;
    }
  }
  if (item.id) {
    memoryPpid = memoryPpid.map((p) => (p.id === item.id ? { ...p, ...item } : p));
    return { ...item, id: item.id };
  } else {
    const newId = memoryPpid.length > 0 ? Math.max(...memoryPpid.map((p) => p.id)) + 1 : 1;
    const newItem = { ...item, id: newId };
    memoryPpid.unshift(newItem);
    return newItem;
  }
}

export async function deletePpid(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    await supabaseServer.from("ppid").delete().eq("id", id);
  }
  memoryPpid = memoryPpid.filter((p) => p.id !== id);
  return true;
}

// --- BANSOS ---
export async function getBansosList(): Promise<BansosItem[]> {
  if (!isPlaceholderSupabase) {
    const { data, error } = await supabase.from("bansos").select("*").order("id", { ascending: true });
    if (!error && data) return data as BansosItem[];
  }
  return memoryBansos;
}

export async function saveBansos(item: Omit<BansosItem, "id"> & { id?: number }): Promise<BansosItem> {
  if (!isPlaceholderSupabase) {
    if (item.id) {
      const { data, error } = await supabaseServer.from("bansos").update(item).eq("id", item.id).select().single();
      if (!error && data) return data as BansosItem;
    } else {
      const { data, error } = await supabaseServer.from("bansos").insert(item).select().single();
      if (!error && data) return data as BansosItem;
    }
  }
  if (item.id) {
    memoryBansos = memoryBansos.map((b) => (b.id === item.id ? { ...b, ...item } : b));
    return { ...item, id: item.id };
  } else {
    const newId = memoryBansos.length > 0 ? Math.max(...memoryBansos.map((b) => b.id)) + 1 : 1;
    const newItem = { ...item, id: newId };
    memoryBansos.push(newItem);
    return newItem;
  }
}

export async function deleteBansos(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    await supabaseServer.from("bansos").delete().eq("id", id);
  }
  memoryBansos = memoryBansos.filter((b) => b.id !== id);
  return true;
}


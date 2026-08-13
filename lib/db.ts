import fs from "fs";
import path from "path";
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
  Pengaduan,
  ApbdesRingkasan,
  ApbdesBidang,
  ProdukHukum,
  StatistikPenduduk,
} from "./data";
import { parseImagesList } from "./utils";

const STORE_PATH = path.join(process.cwd(), "lib", "store.json");

export type AdminActivity = {
  id?: number;
  module: string;
  action: "create" | "update" | "delete";
  title: string;
  entity_id?: string | null;
  created_at: string;
};

declare global {
  var __DESA_STORE__: any;
}

function readStore(): any {
  if (!globalThis.__DESA_STORE__) {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, "utf-8");
        globalThis.__DESA_STORE__ = JSON.parse(raw);
      }
    } catch (err) {
      console.error("Error reading store.json:", err);
    }
    if (!globalThis.__DESA_STORE__) {
      globalThis.__DESA_STORE__ = {};
    }
  }
  return globalThis.__DESA_STORE__;
}

function writeStore(data: any) {
  // Update in-memory store secara sinkron (source of truth)
  globalThis.__DESA_STORE__ = data;
  // Tulis ke disk secara asinkron — tidak memblokir event loop
  fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf-8", (err) => {
    if (err && (err as NodeJS.ErrnoException).code !== "EROFS") {
      console.error("Error writing store.json:", err);
    }
  });
}

/**
 * Audit trail untuk panel admin. Kegagalan pencatatan tidak boleh
 * menggagalkan penyimpanan konten utama, misalnya ketika mode fallback lokal
 * sedang dipakai atau migrasi belum dijalankan.
 */
async function recordAdminActivity(
  module: string,
  action: AdminActivity["action"],
  title: string,
  entityId?: number | string
): Promise<void> {
  const activity: AdminActivity = {
    module,
    action,
    title,
    entity_id: entityId == null ? null : String(entityId),
    created_at: new Date().toISOString(),
  };

  if (!isPlaceholderSupabase) {
    try {
      const { error } = await supabaseServer.from("admin_activity").insert(activity);
      if (!error) return;
      console.error("Gagal mencatat aktivitas admin:", error.message);
    } catch (error) {
      console.error("Gagal mencatat aktivitas admin:", error);
    }
  }

  const store = readStore();
  const localActivities: AdminActivity[] = store.admin_activity || [];
  store.admin_activity = [{ ...activity, id: Date.now() }, ...localActivities].slice(0, 100);
  writeStore(store);
}

export async function getAdminActivityList(limit = 12): Promise<AdminActivity[]> {
  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabaseServer
        .from("admin_activity")
        .select("id, module, action, title, entity_id, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (!error && data) return data as AdminActivity[];
    } catch (error) {
      console.error("Gagal membaca aktivitas admin:", error);
    }
  }

  const store = readStore();
  return ((store.admin_activity || []) as AdminActivity[]).slice(0, limit);
}

// Helper to filter and merge Supabase list with local edits & deletes
function syncListWithLocal<T extends { id?: number }>(
  supabaseList: T[],
  localList: T[],
  deletedIds: number[] = []
): T[] {
  const deletedSet = new Set(deletedIds || []);
  const result: T[] = [];
  const sbIdSet = new Set((supabaseList || []).map((item) => item.id).filter(Boolean));

  for (const item of supabaseList || []) {
    if (!item.id) continue;
    if (deletedSet.has(item.id)) continue;

    const localMatch = (localList || []).find((l) => l.id === item.id);
    if (localMatch) {
      result.push({ ...item, ...localMatch });
    } else {
      result.push(item);
    }
  }

  for (const localItem of localList || []) {
    if (!localItem.id) continue;
    if (deletedSet.has(localItem.id)) continue;
    if (!sbIdSet.has(localItem.id)) {
      result.push(localItem);
    }
  }

  return result;
}

// ==================== UMKM ====================
export async function getUmkmList(): Promise<Umkm[]> {
  const store = readStore();
  const localList: Umkm[] = store.umkm || [];
  const deletedIds: number[] = store.deletedUmkm || [];

  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("umkm").select("*").is("archived_at", null).order("id", { ascending: true }).limit(200);
      if (!error && data) {
        const sbList = data.map((u: any) => ({
          ...u,
          wa: u.wa || undefined,
          phone: u.phone || undefined,
          mapsUrl: u.maps_url || u.mapsUrl || undefined,
          maps_url: u.maps_url || u.mapsUrl || undefined,
        }));
        // When Supabase is configured it is the source of truth.  Do not merge
        // the build-time fallback store here: on serverless deployments that
        // file cannot be persisted and would otherwise overwrite fresh rows.
        return sbList as Umkm[];
      }
    } catch (e) {
      console.error("getUmkmList supabase exception:", e);
    }
  }
  return localList.filter((u) => !deletedIds.includes(u.id ?? 0));
}

export async function getUmkmCount(): Promise<number> {
  if (!isPlaceholderSupabase) {
    try {
      const { count, error } = await supabase
        .from("umkm")
        .select("*", { count: "exact", head: true });
      if (!error && typeof count === "number") {
        return count;
      }
    } catch (e) {
      console.error("getUmkmCount supabase exception:", e);
    }
  }

  // Fallback: derive count from the local store when Supabase is unavailable.
  const store = readStore();
  const localList: Umkm[] = store.umkm || [];
  const deletedIds: number[] = store.deletedUmkm || [];
  return localList.filter((u) => !deletedIds.includes(u.id ?? 0)).length;
}

export async function getUmkmById(id: number): Promise<Umkm | undefined> {
  if (isNaN(id)) return undefined;
  // Query langsung by ID — tidak perlu fetch semua UMKM
  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("umkm").select("*").eq("id", id).single();
      if (!error && data) {
        return {
          ...data,
          wa: data.wa || undefined,
          phone: data.phone || undefined,
          mapsUrl: data.maps_url || data.mapsUrl || undefined,
          maps_url: data.maps_url || data.mapsUrl || undefined,
        } as Umkm;
      }
    } catch (e) {
      console.error("getUmkmById supabase exception:", e);
    }
  }
  // Fallback: cari di local store
  const store = readStore();
  const localList: Umkm[] = store.umkm || [];
  return localList.find((u) => u.id === id);
}

export async function saveUmkm(item: Omit<Umkm, "id"> & { id?: number }): Promise<Umkm> {
  const sbPayload = {
    name: item.name,
    owner: item.owner,
    category: item.category,
    year: item.year,
    product: item.product,
    tagline: item.tagline || null,
    desc: item.desc,
    address: item.address,
    wa: item.wa || null,
    phone: item.phone || null,
    maps_url: item.mapsUrl || item.maps_url || null,
    social: item.social || null,
    grad: item.grad || "",
    image: item.image || null,
    images: item.images || null,
  };

  const store = readStore();
  const list: Umkm[] = store.umkm || [];
  let resultItem: Umkm;

  if (item.id != null) {
    resultItem = {
      ...sbPayload,
      tagline: sbPayload.tagline || undefined,
      wa: sbPayload.wa || undefined,
      phone: sbPayload.phone || undefined,
      mapsUrl: sbPayload.maps_url || undefined,
      maps_url: sbPayload.maps_url || undefined,
      social: sbPayload.social || undefined,
      image: sbPayload.image || undefined,
      images: sbPayload.images || undefined,
      id: item.id,
    } as Umkm;
    store.umkm = list.map((u) => (u.id === item.id ? resultItem : u));
    store.deletedUmkm = (store.deletedUmkm || []).filter((dId: number) => dId !== item.id);
  } else {
    const newId = list.length > 0 ? Math.max(...list.map((u) => u.id || 0)) + 1 : 1;
    resultItem = {
      ...sbPayload,
      tagline: sbPayload.tagline || undefined,
      wa: sbPayload.wa || undefined,
      phone: sbPayload.phone || undefined,
      mapsUrl: sbPayload.maps_url || undefined,
      maps_url: sbPayload.maps_url || undefined,
      social: sbPayload.social || undefined,
      image: sbPayload.image || undefined,
      images: sbPayload.images || undefined,
      id: newId,
    } as Umkm;
    store.umkm = [...list, resultItem];
  }

  if (!isPlaceholderSupabase) {
    const query = item.id != null
      ? supabaseServer.from("umkm").update(sbPayload).eq("id", item.id)
      : supabaseServer.from("umkm").insert(sbPayload);
    const { data, error } = await query.select().single();
    if (error) throw new Error(`Gagal menyimpan UMKM: ${error.message}`);
    resultItem.id = data.id;
  }

  writeStore(store);
  await recordAdminActivity("UMKM", item.id != null ? "update" : "create", `${item.id != null ? "Memperbarui" : "Menambahkan"} UMKM: ${resultItem.name}`, resultItem.id);
  return resultItem;
}

export async function deleteUmkm(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    const { error } = await supabaseServer.from("umkm").delete().eq("id", id);
    if (error) throw new Error(`Gagal menghapus UMKM: ${error.message}`);
  }

  const store = readStore();
  store.umkm = (store.umkm || []).filter((u: Umkm) => u.id !== id);
  store.deletedUmkm = [...(store.deletedUmkm || []), id];
  writeStore(store);
  await recordAdminActivity("UMKM", "delete", "Menghapus data UMKM", id);
  return true;
}

// ==================== BERITA ====================
export async function getBeritaList(): Promise<Berita[]> {
  const store = readStore();
  const localList: Berita[] = store.berita || [];
  const deletedIds: number[] = store.deletedBerita || [];

  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("berita").select("*").order("published_at", { ascending: false }).limit(100);
      if (!error && data) {
        const sbList = data.map((b: any) => {
          let dateStr = "";
          try {
            if (b.published_at) {
              const d = new Date(b.published_at);
              if (!isNaN(d.getTime())) {
                dateStr = d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
              }
            }
          } catch (e) {}

          if (!dateStr) {
            dateStr = b.date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
          }

          return {
            id: b.id,
            tag: b.tag ? b.tag.charAt(0).toUpperCase() + b.tag.slice(1) : "Umum",
            cls: b.cls || "",
            title: b.title || "",
            desc: b.desc || "",
            date: dateStr,
            publishedAt: b.published_at || null,
            images: b.images || null,
          };
        }) as Berita[];
        return sbList;
      }
    } catch (e) {}
  }
  return localList.filter((b) => !deletedIds.includes(b.id || 0));
}

export async function getBeritaById(id: number): Promise<Berita | undefined> {
  if (isNaN(id)) return undefined;
  // Query langsung by ID — tidak perlu fetch semua berita
  if (!isPlaceholderSupabase) {
    try {
      const { data: b, error } = await supabase.from("berita").select("*").eq("id", id).single();
      if (!error && b) {
        let dateStr = "";
        try {
          if (b.published_at) {
            const d = new Date(b.published_at);
            if (!isNaN(d.getTime())) {
              dateStr = d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
            }
          }
        } catch (e) {}
        if (!dateStr) dateStr = b.date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
        return {
          id: b.id,
          tag: b.tag ? b.tag.charAt(0).toUpperCase() + b.tag.slice(1) : "Umum",
          cls: b.cls || "",
          title: b.title || "",
          desc: b.desc || "",
          date: dateStr,
          publishedAt: b.published_at || null,
          images: b.images || null,
        } as Berita;
      }
    } catch (e) {
      console.error("getBeritaById supabase exception:", e);
    }
  }
  // Fallback: cari di local store
  const store = readStore();
  const localList: Berita[] = store.berita || [];
  return localList.find((b) => b.id === id);
}

export async function addBerita(item: Omit<Berita, "date"> & { date?: string }): Promise<Berita> {
  const store = readStore();
  const list: Berita[] = store.berita || [];
  const newId = list.length > 0 ? Math.max(...list.map((b) => b.id || 0)) + 1 : 1;
  const newItem: Berita = {
    id: newId,
    tag: item.tag,
    cls: item.cls || "",
    title: item.title,
    desc: item.desc,
    date: item.date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
    images: item.images,
  };

  if (!isPlaceholderSupabase) {
    const { data, error } = await supabaseServer.from("berita").insert({
      tag: item.tag.toLowerCase(),
      cls: item.cls || "",
      title: item.title,
      desc: item.desc,
      published_at: new Date().toISOString(),
      images: item.images || null,
    }).select().single();
    if (error) throw new Error(`Gagal menambahkan berita: ${error.message}`);
    newItem.id = data.id;
  }

  store.berita = [newItem, ...list];
  writeStore(store);
  await recordAdminActivity("Berita", "create", `Menambahkan berita: ${newItem.title}`, newItem.id);

  // Otomatis masukkan foto lampiran berita ke Galeri Desa
  const imageUrls = parseImagesList(item.images);
  if (imageUrls.length > 0) {
    const galeriItemsToAdd = imageUrls.map((imgUrl) => ({
      label: item.title,
      cat: item.tag || "Kegiatan Desa",
      grad: "g1",
      image: imgUrl,
      images: imgUrl,
      desc: `Foto Dokumentasi Berita: ${item.title}`,
    }));
    await addGaleriMany(galeriItemsToAdd);
  }

  return newItem;
}

export async function deleteBeritaById(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    const { error } = await supabaseServer.from("berita").delete().eq("id", id);
    if (error) throw new Error(`Gagal menghapus berita: ${error.message}`);
  }

  const store = readStore();
  store.berita = (store.berita || []).filter((b: Berita) => b.id !== id);
  store.deletedBerita = [...(store.deletedBerita || []), id];
  writeStore(store);
  await recordAdminActivity("Berita", "delete", "Menghapus berita", id);
  return true;
}

export async function updateBerita(id: number, item: Omit<Berita, "id" | "date"> & { date?: string }): Promise<Berita> {
  const store = readStore();
  const list: Berita[] = store.berita || [];
  const existing = list.find((b) => b.id === id);
  const updatedItem: Berita = {
    id,
    tag: item.tag,
    cls: item.cls || "",
    title: item.title,
    desc: item.desc,
    date: item.date || existing?.date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
    images: item.images,
  };

  if (!isPlaceholderSupabase) {
    const { data, error } = await supabaseServer
      .from("berita")
      .update({
        tag: item.tag.toLowerCase(),
        cls: item.cls || "",
        title: item.title,
        desc: item.desc,
        images: item.images || null,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(`Gagal memperbarui berita: ${error.message}`);
    updatedItem.id = data.id;
  }

  store.berita = list.map((b) => (b.id === id ? updatedItem : b));
  writeStore(store);
  await recordAdminActivity("Berita", "update", `Memperbarui berita: ${updatedItem.title}`, id);

  // Otomatis masukkan foto lampiran berita ke Galeri Desa
  const imageUrls = parseImagesList(item.images);
  if (imageUrls.length > 0) {
    const galeriItemsToAdd = imageUrls.map((imgUrl) => ({
      label: item.title,
      cat: item.tag || "Kegiatan Desa",
      grad: "g1",
      image: imgUrl,
      images: imgUrl,
      desc: `Foto Dokumentasi Berita: ${item.title}`,
    }));
    await addGaleriMany(galeriItemsToAdd);
  }

  return updatedItem;
}

export async function deleteBerita(id: number): Promise<boolean> {
  return deleteBeritaById(id);
}

// ==================== GALERI ====================
export async function getGaleriList(): Promise<GaleriItem[]> {
  const store = readStore();
  const localList: GaleriItem[] = store.galeri || [];
  const deletedIds: number[] = store.deletedGaleri || [];

  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("galeri").select("*").is("archived_at", null).order("created_at", { ascending: false }).limit(100);
      if (!error && data) {
        const sbList = data.map((g: any) => ({
          ...g,
          image: g.images ? g.images.split(",")[0] : g.image,
          images: g.images || g.image || undefined,
        })) as GaleriItem[];
        return sbList;
      }
    } catch (e) {}
  }

  return localList
    .filter((g) => !deletedIds.includes(g.id || 0))
    .map((g) => ({
      ...g,
      image: g.images ? g.images.split(",")[0] : g.image,
      images: g.images || g.image || undefined,
    }));
}

export async function addGaleri(item: GaleriItem): Promise<GaleriItem> {
  const store = readStore();
  const list: GaleriItem[] = store.galeri || [];
  const newId = list.length > 0 ? Math.max(...list.map((g) => g.id || 0)) + 1 : 1;

  const primaryImage = item.images ? item.images.split(",")[0].trim() : item.image;
  const newItem: GaleriItem = {
    ...item,
    id: newId,
    image: primaryImage,
    images: item.images || item.image || undefined,
  };

  if (!isPlaceholderSupabase) {
    const payload = {
      label: item.label,
      cat: item.cat,
      grad: item.grad || "",
      image: primaryImage || null,
      images: item.images || item.image || null,
      desc: item.desc || null,
    };
    const { data, error } = await supabaseServer.from("galeri").insert(payload).select().single();
    if (error) throw new Error(`Gagal menambahkan galeri: ${error.message}`);
    newItem.id = data.id;
  }

  store.galeri = [newItem, ...list];
  writeStore(store);
  await recordAdminActivity("Galeri", "create", `Menambahkan galeri: ${newItem.label}`, newItem.id);
  return newItem;
}

export async function addGaleriMany(items: GaleriItem[]): Promise<GaleriItem[]> {
  if (!items || items.length === 0) return [];
  const store = readStore();
  const existingGaleri: GaleriItem[] = store.galeri || [];
  
  // Filter yang belum ada di galeri
  const newItemsToProcess = items.filter(
    (item) => !existingGaleri.some((g: GaleriItem) => g.image === (item.images ? item.images.split(",")[0].trim() : item.image))
  );
  if (newItemsToProcess.length === 0) return [];

  let currentId = existingGaleri.length > 0 ? Math.max(...existingGaleri.map((g) => g.id || 0)) : 0;
  const processedItems: GaleriItem[] = [];
  const sbPayloads: any[] = [];

  for (const item of newItemsToProcess) {
    currentId += 1;
    const primaryImage = item.images ? item.images.split(",")[0].trim() : item.image;
    const newItem: GaleriItem = {
      ...item,
      id: currentId,
      image: primaryImage,
      images: item.images || item.image || undefined,
    };
    processedItems.push(newItem);
    sbPayloads.push({
      label: item.label,
      cat: item.cat,
      grad: item.grad || "",
      image: primaryImage || null,
      images: item.images || item.image || null,
      desc: item.desc || null,
    });
  }

  if (!isPlaceholderSupabase && sbPayloads.length > 0) {
    try {
      const { data, error } = await supabaseServer.from("galeri").insert(sbPayloads).select();
      if (!error && data) {
        data.forEach((d: any, idx: number) => {
          if (processedItems[idx]) processedItems[idx].id = d.id;
        });
      }
    } catch (e) {
      console.error("Gagal bulk insert galeri ke Supabase:", e);
    }
  }

  store.galeri = [...processedItems.reverse(), ...existingGaleri];
  writeStore(store);
  return processedItems;
}

export async function updateGaleri(id: number, item: Omit<GaleriItem, "id">): Promise<GaleriItem> {
  const primaryImage = item.images ? item.images.split(",")[0].trim() : item.image;
  const updatedItem: GaleriItem = {
    ...item,
    id,
    image: primaryImage,
    images: item.images || item.image || undefined,
  };

  if (!isPlaceholderSupabase) {
    const { data, error } = await supabaseServer
      .from("galeri")
      .update({
        label: item.label,
        cat: item.cat,
        grad: item.grad || "",
        image: primaryImage || null,
        images: item.images || item.image || null,
        desc: item.desc || null,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(`Gagal memperbarui galeri: ${error.message}`);
    updatedItem.id = data.id;
  }

  const store = readStore();
  store.galeri = (store.galeri || []).map((galleryItem: GaleriItem) =>
    galleryItem.id === id ? updatedItem : galleryItem
  );
  writeStore(store);
  await recordAdminActivity("Galeri", "update", `Memperbarui galeri: ${updatedItem.label}`, id);
  return updatedItem;
}

export async function deleteGaleriById(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    const { error } = await supabaseServer.from("galeri").delete().eq("id", id);
    if (error) throw new Error(`Gagal menghapus galeri: ${error.message}`);
  }

  const store = readStore();
  store.galeri = (store.galeri || []).filter((g: GaleriItem) => g.id !== id);
  store.deletedGaleri = [...(store.deletedGaleri || []), id];
  writeStore(store);
  await recordAdminActivity("Galeri", "delete", "Menghapus galeri", id);
  return true;
}

export async function deleteGaleri(id: number): Promise<boolean> {
  return deleteGaleriById(id);
}

// ==================== POTENSI ====================
export async function getPotensiList(): Promise<Potensi[]> {
  const store = readStore();
  const localList: Potensi[] = store.potensi || [];

  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("potensi").select("*").order("num", { ascending: true });
      if (!error && data && data.length > 0) return data as Potensi[];
    } catch (e) {}
  }
  return localList;
}

export async function updatePotensi(num: string, title: string, desc: string): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    const { data, error } = await supabaseServer
      .from("potensi")
      .update({ title, desc, updated_at: new Date().toISOString() })
      .eq("num", num)
      .select("id")
      .single();
    if (error) throw new Error(`Gagal memperbarui potensi: ${error.message}`);
    if (!data) throw new Error("Gagal memperbarui potensi: data tidak ditemukan.");
  }

  const store = readStore();
  store.potensi = (store.potensi || []).map((p: Potensi) => (p.num === num ? { ...p, title, desc } : p));
  writeStore(store);
  await recordAdminActivity("Profil", "update", `Memperbarui potensi desa: ${title}`, num);
  return true;
}

// ==================== LEMBAGA ====================
export async function getLembagaList(): Promise<Lembaga[]> {
  const store = readStore();
  const localList: Lembaga[] = store.lembaga || [];
  const deletedIds: number[] = store.deletedLembaga || [];

  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("lembaga").select("*").order("id", { ascending: true });
      if (!error && data) {
        return data as Lembaga[];
      }
    } catch (e) {}
  }
  return localList.filter((l) => !deletedIds.includes(l.id ?? 0));
}

export async function saveLembaga(item: Omit<Lembaga, "id"> & { id?: number }): Promise<Lembaga> {
  let resultItem: Lembaga = { ...item } as Lembaga;

  if (!isPlaceholderSupabase) {
    const { id: itemId, ...payload } = item;
    if (itemId != null) {
      const { data, error } = await supabaseServer.from("lembaga").update(payload).eq("id", itemId).select("id").single();
      if (error) throw new Error(`Gagal memperbarui lembaga: ${error.message}`);
      if (!data) throw new Error("Gagal memperbarui lembaga: data tidak ditemukan.");
      resultItem.id = itemId;
    } else {
      const { data, error } = await supabaseServer.from("lembaga").insert(payload).select().single();
      if (error) throw new Error(`Gagal menambahkan lembaga: ${error.message}`);
      if (data?.id) resultItem.id = data.id;
    }
  }

  const store = readStore();
  const list: Lembaga[] = store.lembaga || [];
  if (!resultItem.id) {
    resultItem.id = list.length > 0 ? Math.max(...list.map((l) => l.id || 0)) + 1 : 1;
  }

  if (item.id) {
    store.lembaga = list.map((l) => (l.id === item.id ? resultItem : l));
    store.deletedLembaga = (store.deletedLembaga || []).filter((dId: number) => dId !== item.id);
  } else {
    store.lembaga = [...list, resultItem];
  }
  writeStore(store);

  await recordAdminActivity("Profil", item.id ? "update" : "create", `${item.id ? "Memperbarui" : "Menambahkan"} lembaga: ${resultItem.name}`, resultItem.id);

  return resultItem;
}

export async function deleteLembaga(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    const { error } = await supabaseServer.from("lembaga").delete().eq("id", id);
    if (error) throw new Error(`Gagal menghapus lembaga: ${error.message}`);
  }

  const store = readStore();
  store.lembaga = (store.lembaga || []).filter((l: Lembaga) => l.id !== id);
  store.deletedLembaga = [...(store.deletedLembaga || []), id];
  writeStore(store);
  await recordAdminActivity("Profil", "delete", "Menghapus data lembaga desa", id);
  return true;
}

// ==================== PROFIL DESA ====================
export async function getProfilDesa(): Promise<ProfilDesa> {
  const store = readStore();
  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("profil").select("*").single();
      if (!error && data) return { visi: data.visi, misi: data.misi };
    } catch (e) {}
  }
  return store.profil || { visi: "", misi: [] };
}

export async function saveProfilDesa(profil: ProfilDesa): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    const { error } = await supabaseServer.from("profil").upsert({ id: 1, visi: profil.visi, misi: profil.misi });
    if (error) throw new Error(`Gagal menyimpan profil desa: ${error.message}`);
  }

  const store = readStore();
  store.profil = profil;
  writeStore(store);
  await recordAdminActivity("Profil", "update", "Memperbarui visi dan misi desa", 1);
  return true;
}

export const getProfilData = getProfilDesa;
export const updateProfilVisiMisi = saveProfilDesa;

// ==================== AGENDA ====================
export async function getAgendaList(): Promise<Agenda[]> {
  const store = readStore();
  const localList: Agenda[] = store.agenda || [];
  const deletedIds: number[] = store.deletedAgenda || [];

  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("agenda").select("*").order("id", { ascending: false });
      if (!error && data) {
        return data as Agenda[];
      }
    } catch (e) {}
  }
  return localList.filter((a) => !deletedIds.includes(a.id ?? 0));
}

export async function saveAgenda(item: Omit<Agenda, "id"> & { id?: number }): Promise<Agenda> {
  let resultItem: Agenda = { ...item } as Agenda;

  if (!isPlaceholderSupabase) {
    const { id: itemId, ...payload } = item;
    if (itemId != null) {
      const { data, error } = await supabaseServer.from("agenda").update(payload).eq("id", itemId).select("id").single();
      if (error) throw new Error(`Gagal memperbarui agenda: ${error.message}`);
      if (!data) throw new Error("Gagal memperbarui agenda: data tidak ditemukan.");
      resultItem.id = itemId;
    } else {
      const { data, error } = await supabaseServer.from("agenda").insert(payload).select().single();
      if (error) throw new Error(`Gagal menambahkan agenda: ${error.message}`);
      if (data?.id) resultItem.id = data.id;
    }
  }

  const store = readStore();
  const list: Agenda[] = store.agenda || [];
  if (!resultItem.id) {
    resultItem.id = list.length > 0 ? Math.max(...list.map((a) => a.id || 0)) + 1 : 1;
  }

  if (item.id) {
    store.agenda = list.map((a) => (a.id === item.id ? resultItem : a));
    store.deletedAgenda = (store.deletedAgenda || []).filter((dId: number) => dId !== item.id);
  } else {
    store.agenda = [resultItem, ...list];
  }
  writeStore(store);

  await recordAdminActivity("Layanan", item.id ? "update" : "create", `${item.id ? "Memperbarui" : "Menambahkan"} agenda: ${resultItem.title}`, resultItem.id);

  return resultItem;
}

export async function deleteAgenda(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    const { error } = await supabaseServer.from("agenda").delete().eq("id", id);
    if (error) throw new Error(`Gagal menghapus agenda: ${error.message}`);
  }

  const store = readStore();
  store.agenda = (store.agenda || []).filter((a: Agenda) => a.id !== id);
  store.deletedAgenda = [...(store.deletedAgenda || []), id];
  writeStore(store);
  await recordAdminActivity("Layanan", "delete", "Menghapus agenda layanan", id);
  return true;
}

// ==================== BUKU TAMU ====================
export async function getBukuTamuList(): Promise<BukuTamu[]> {
  const store = readStore();
  const localList: BukuTamu[] = store.buku_tamu || [];
  const deletedIds: number[] = store.deletedBukuTamu || [];

  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("buku_tamu").select("*").order("id", { ascending: false }).limit(200);
      if (!error && data) {
        return data as BukuTamu[];
      }
    } catch (e) {}
  }
  return localList.filter((b) => !deletedIds.includes(b.id ?? 0));
}

export async function addBukuTamu(item: Omit<BukuTamu, "id">): Promise<BukuTamu> {
  let newItem: BukuTamu = { ...item, id: 0 };

  if (!isPlaceholderSupabase) {
    const { data, error } = await supabaseServer.from("buku_tamu").insert(item).select().single();
    if (error) throw new Error(`Gagal menambahkan buku tamu: ${error.message}`);
    if (data?.id) newItem.id = data.id;
  }

  const store = readStore();
  const list: BukuTamu[] = store.buku_tamu || [];
  if (!newItem.id) {
    newItem.id = list.length > 0 ? Math.max(...list.map((b) => b.id || 0)) + 1 : 1;
  }

  // Pruning: simpan max 200 entri terbaru di local store agar heap tidak tumbuh tak terbatas
  store.buku_tamu = [newItem, ...list].slice(0, 200);
  writeStore(store);

  return newItem;
}

export async function deleteBukuTamu(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    const { error } = await supabaseServer.from("buku_tamu").delete().eq("id", id);
    if (error) throw new Error(`Gagal menghapus buku tamu: ${error.message}`);
  }

  const store = readStore();
  store.buku_tamu = (store.buku_tamu || []).filter((b: BukuTamu) => b.id !== id);
  store.deletedBukuTamu = [...(store.deletedBukuTamu || []), id];
  writeStore(store);
  return true;
}

// ==================== PENGADUAN ====================
export async function getPengaduanList(): Promise<Pengaduan[]> {
  const store = readStore();
  const localList: Pengaduan[] = store.pengaduan || [];
  const deletedIds: number[] = store.deletedPengaduan || [];

  if (!isPlaceholderSupabase) {
    try {
      // Halaman publik dirender di server. Gunakan service role agar daftar
      // laporan tetap tampil tanpa membuka akses SELECT langsung ke anon.
      const { data, error } = await supabaseServer.from("pengaduan").select("*").order("id", { ascending: false }).limit(200);
      if (!error && data) {
        return data as Pengaduan[];
      }
    } catch (e) {}
  }
  return localList.filter((p) => !deletedIds.includes(p.id ?? 0));
}

export async function addPengaduan(item: Omit<Pengaduan, "id" | "status" | "tanggapan">): Promise<Pengaduan> {
  const sbPayload = {
    nama: item.nama,
    dusun: item.dusun,
    judul: item.judul,
    isi: item.isi,
    tanggal: item.tanggal,
    foto: item.foto || item.image || null,
    image: item.foto || item.image || null,
    status: "Baru" as const,
    tanggapan: "",
  };

  let newItem: Pengaduan = {
    id: 0,
    nama: item.nama,
    dusun: item.dusun,
    judul: item.judul,
    isi: item.isi,
    tanggal: item.tanggal,
    foto: item.foto || item.image || undefined,
    image: item.foto || item.image || undefined,
    status: "Baru",
    tanggapan: "",
  };

  if (!isPlaceholderSupabase) {
    const { data, error } = await supabaseServer.from("pengaduan").insert(sbPayload).select().single();
    if (error) throw new Error(`Gagal mengirim pengaduan: ${error.message}`);
    if (data?.id) newItem.id = data.id;
  }

  const store = readStore();
  const list: Pengaduan[] = store.pengaduan || [];
  if (!newItem.id) {
    newItem.id = list.length > 0 ? Math.max(...list.map((p) => p.id || 0)) + 1 : 1;
  }

  // Pruning: simpan max 300 entri terbaru di local store agar heap tidak tumbuh tak terbatas
  store.pengaduan = [newItem, ...list].slice(0, 300);
  writeStore(store);

  return newItem;
}

export async function updateStatusPengaduan(id: number, status: Pengaduan["status"], tanggapan?: string): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    const { data, error } = await supabaseServer.from("pengaduan").update({ status, tanggapan }).eq("id", id).select("id").single();
    if (error) throw new Error(`Gagal memperbarui status pengaduan: ${error.message}`);
    if (!data) throw new Error("Gagal memperbarui status pengaduan: data tidak ditemukan.");
  }

  const store = readStore();
  store.pengaduan = (store.pengaduan || []).map((p: Pengaduan) => (p.id === id ? { ...p, status, tanggapan } : p));
  writeStore(store);
  await recordAdminActivity("Layanan", "update", `Memperbarui status pengaduan menjadi ${status}`, id);
  return true;
}

export async function deletePengaduan(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    const { error } = await supabaseServer.from("pengaduan").delete().eq("id", id);
    if (error) throw new Error(`Gagal menghapus pengaduan: ${error.message}`);
  }

  const store = readStore();
  store.pengaduan = (store.pengaduan || []).filter((p: Pengaduan) => p.id !== id);
  store.deletedPengaduan = [...(store.deletedPengaduan || []), id];
  writeStore(store);
  return true;
}

// ==================== APBDES ====================
export async function getApbdesRingkasan(): Promise<ApbdesRingkasan> {
  const store = readStore();
  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("apbdes_ringkasan").select("*").single();
      if (!error && data) return data as ApbdesRingkasan;
    } catch (e) {}
  }
  return store.apbdes_ringkasan || { pendapatan: "0", belanja: "0", pembiayaan: "0", tahun: 2026 };
}

export async function updateApbdesRingkasan(ringkasan: ApbdesRingkasan): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    const { error } = await supabaseServer.from("apbdes_ringkasan").upsert({ id: 1, ...ringkasan });
    if (error) throw new Error(`Gagal memperbarui ringkasan APBDES: ${error.message}`);
  }

  const store = readStore();
  store.apbdes_ringkasan = ringkasan;
  writeStore(store);
  await recordAdminActivity("Transparansi", "update", `Memperbarui ringkasan APBDes ${ringkasan.tahun}`, 1);
  return true;
}

export async function getApbdesBidangList(): Promise<ApbdesBidang[]> {
  const store = readStore();
  const localList: ApbdesBidang[] = store.apbdes_bidang || [];
  const deletedIds: number[] = store.deletedApbdesBidang || [];

  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("apbdes_bidang").select("*").order("id", { ascending: true });
      if (!error && data) {
        return data as ApbdesBidang[];
      }
    } catch (e) {}
  }
  return localList.filter((b) => !deletedIds.includes(b.id ?? 0));
}

export async function saveApbdesBidang(item: Omit<ApbdesBidang, "id"> & { id?: number }): Promise<ApbdesBidang> {
  let resultItem: ApbdesBidang = { ...item } as ApbdesBidang;

  if (!isPlaceholderSupabase) {
    const { id: itemId, ...payload } = item;
    if (itemId != null) {
      const { data, error } = await supabaseServer.from("apbdes_bidang").update(payload).eq("id", itemId).select("id").single();
      if (error) throw new Error(`Gagal memperbarui bidang APBDES: ${error.message}`);
      if (!data) throw new Error("Gagal memperbarui bidang APBDES: data tidak ditemukan.");
      resultItem.id = itemId;
    } else {
      const { data, error } = await supabaseServer.from("apbdes_bidang").insert(payload).select().single();
      if (error) throw new Error(`Gagal menambahkan bidang APBDES: ${error.message}`);
      if (data?.id) resultItem.id = data.id;
    }
  }

  const store = readStore();
  const list: ApbdesBidang[] = store.apbdes_bidang || [];
  if (!resultItem.id) {
    resultItem.id = list.length > 0 ? Math.max(...list.map((b) => b.id || 0)) + 1 : 1;
  }

  if (item.id) {
    store.apbdes_bidang = list.map((b) => (b.id === item.id ? resultItem : b));
    store.deletedApbdesBidang = (store.deletedApbdesBidang || []).filter((dId: number) => dId !== item.id);
  } else {
    store.apbdes_bidang = [...list, resultItem];
  }
  writeStore(store);

  await recordAdminActivity("Transparansi", item.id ? "update" : "create", `${item.id ? "Memperbarui" : "Menambahkan"} bidang APBDes: ${resultItem.name}`, resultItem.id);

  return resultItem;
}

export async function deleteApbdesBidang(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    const { error } = await supabaseServer.from("apbdes_bidang").delete().eq("id", id);
    if (error) throw new Error(`Gagal menghapus bidang APBDES: ${error.message}`);
  }

  const store = readStore();
  store.apbdes_bidang = (store.apbdes_bidang || []).filter((b: ApbdesBidang) => b.id !== id);
  store.deletedApbdesBidang = [...(store.deletedApbdesBidang || []), id];
  writeStore(store);
  await recordAdminActivity("Transparansi", "delete", "Menghapus bidang APBDes", id);
  return true;
}

// ==================== PRODUK HUKUM ====================
export async function getProdukHukumList(): Promise<ProdukHukum[]> {
  const store = readStore();
  const localList: ProdukHukum[] = store.produk_hukum || [];
  const deletedIds: number[] = store.deletedProdukHukum || [];

  if (!isPlaceholderSupabase) {
    try {
      const { data, error } = await supabase.from("produk_hukum").select("*").is("archived_at", null).order("id", { ascending: false });
      if (!error && data) {
        return data as ProdukHukum[];
      }
    } catch (e) {}
  }
  return localList.filter((p) => !deletedIds.includes(p.id ?? 0));
}

export async function saveProdukHukum(item: Omit<ProdukHukum, "id"> & { id?: number }): Promise<ProdukHukum> {
  let resultItem: ProdukHukum = { ...item } as ProdukHukum;

  if (!isPlaceholderSupabase) {
    const { id: itemId, ...payload } = item;
    if (itemId != null) {
      const { data, error } = await supabaseServer.from("produk_hukum").update(payload).eq("id", itemId).select("id").single();
      if (error) throw new Error(`Gagal memperbarui produk hukum: ${error.message}`);
      if (!data) throw new Error("Gagal memperbarui produk hukum: data tidak ditemukan.");
      resultItem.id = itemId;
    } else {
      const { data, error } = await supabaseServer.from("produk_hukum").insert(payload).select().single();
      if (error) throw new Error(`Gagal menambahkan produk hukum: ${error.message}`);
      if (data?.id) resultItem.id = data.id;
    }
  }

  const store = readStore();
  const list: ProdukHukum[] = store.produk_hukum || [];
  if (!resultItem.id) {
    resultItem.id = list.length > 0 ? Math.max(...list.map((p) => p.id || 0)) + 1 : 1;
  }

  if (item.id) {
    store.produk_hukum = list.map((p) => (p.id === item.id ? resultItem : p));
    store.deletedProdukHukum = (store.deletedProdukHukum || []).filter((dId: number) => dId !== item.id);
  } else {
    store.produk_hukum = [resultItem, ...list];
  }
  writeStore(store);

  await recordAdminActivity("Transparansi", item.id ? "update" : "create", `${item.id ? "Memperbarui" : "Menambahkan"} produk hukum: ${resultItem.judul}`, resultItem.id);

  return resultItem;
}

export async function deleteProdukHukum(id: number): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    const { error } = await supabaseServer.from("produk_hukum").delete().eq("id", id);
    if (error) throw new Error(`Gagal menghapus produk hukum: ${error.message}`);
  }

  const store = readStore();
  store.produk_hukum = (store.produk_hukum || []).filter((p: ProdukHukum) => p.id !== id);
  store.deletedProdukHukum = [...(store.deletedProdukHukum || []), id];
  writeStore(store);
  await recordAdminActivity("Transparansi", "delete", "Menghapus produk hukum", id);
  return true;
}

// ==================== STATISTIK KEPENDUDUKAN ====================
const DEFAULT_STATISTIK: StatistikPenduduk = {
  totalPenduduk: 4915,
  totalKk: 1753,
  lakiLaki: 2532,
  perempuan: 2383,
  dusunList: [
    { nama: "Dusun Blaraksari", rt: 2, rw: 1, jiwa: 168 },
    { nama: "Dusun Sukoharjo", rt: 4, rw: 1, jiwa: 351 },
    { nama: "Dusun Tulakan", rt: 2, rw: 1, jiwa: 410 },
    { nama: "Dusun Jati", rt: 2, rw: 1, jiwa: 210 },
    { nama: "Dusun Pule", rt: 2, rw: 1, jiwa: 364 },
    { nama: "Dusun Dadapan", rt: 6, rw: 1, jiwa: 901 },
    { nama: "Dusun Bonagung", rt: 2, rw: 1, jiwa: 279 },
    { nama: "Dusun Dalan Gede", rt: 2, rw: 1, jiwa: 358 },
    { nama: "Dusun Sendangsari", rt: 2, rw: 1, jiwa: 420 },
    { nama: "Dusun Ngroto", rt: 4, rw: 1, jiwa: 739 },
    { nama: "Dusun Ngandong", rt: 4, rw: 1, jiwa: 717 },
  ],
  pendidikanList: [
    { name: "Tidak / Belum Sekolah", count: 575 },
    { name: "SD / Sederajat", count: 351 },
    { name: "Tamat SD / Sederajat", count: 2248 },
    { name: "SLTP / Sederajat", count: 956 },
    { name: "SLTA / SMK / Sederajat", count: 679 },
    { name: "Diploma / Sarjana (D3/S1/S2)", count: 106 },
  ],
  pekerjaanList: [
    { name: "Pelajar / Mahasiswa", count: 248, pct: 25.5 },
    { name: "Petani / Pekebun", count: 206, pct: 21.2 },
    { name: "Wiraswasta / UMKM", count: 187, pct: 19.2 },
    { name: "Karyawan Swasta", count: 62, pct: 6.4 },
    { name: "Lainnya", count: 57, pct: 5.9 },
    { name: "PNS", count: 27, pct: 2.8 },
    { name: "Belum / Tidak Bekerja", count: 89, pct: 9.2 },
  ],
};

export async function getStatistikPenduduk(): Promise<StatistikPenduduk> {
  const store = readStore();
  const defaultStatistik = DEFAULT_STATISTIK;

  if (!isPlaceholderSupabase) {
    try {
      // 1. Coba baca dari 4 tabel terpisah Supabase (gunakan limit(1) agar tidak crash PGRST116 saat tabel kosong)
      const { data: ringkasanRows } = await supabase.from("statistik_ringkasan").select("*").limit(1);
      const ringkasan = ringkasanRows && ringkasanRows.length > 0 ? ringkasanRows[0] : null;

      const { data: dusun } = await supabase.from("statistik_dusun").select("*").order("id", { ascending: true });
      const { data: pendidikan } = await supabase.from("statistik_pendidikan").select("*").order("id", { ascending: true });
      const { data: pekerjaan } = await supabase.from("statistik_pekerjaan").select("*").order("id", { ascending: true });

      // Jika ada data di ringkasan ATAU salah satu dari 3 tabel terpisah:
      if (ringkasan || (dusun && dusun.length > 0) || (pendidikan && pendidikan.length > 0) || (pekerjaan && pekerjaan.length > 0)) {
        return {
          totalPenduduk: ringkasan?.total_penduduk ?? ringkasan?.totalPenduduk ?? defaultStatistik.totalPenduduk,
          totalKk: ringkasan?.total_kk ?? ringkasan?.totalKk ?? defaultStatistik.totalKk,
          lakiLaki: ringkasan?.laki_laki ?? ringkasan?.lakiLaki ?? defaultStatistik.lakiLaki,
          perempuan: ringkasan?.perempuan ?? ringkasan?.perempuan ?? defaultStatistik.perempuan,
          dusunList: dusun && dusun.length > 0 
            ? dusun.map((d: any) => ({ nama: d.nama, rt: d.rt, rw: d.rw, jiwa: d.jiwa, ...(d.kk !== undefined ? { kk: d.kk } : {}) })) 
            : defaultStatistik.dusunList,
          pendidikanList: pendidikan && pendidikan.length > 0 
            ? pendidikan.map((p: any) => ({ name: p.name, count: p.count })) 
            : defaultStatistik.pendidikanList,
          pekerjaanList: pekerjaan && pekerjaan.length > 0 
            ? pekerjaan.map((p: any) => ({ name: p.name, count: p.count, pct: p.pct })) 
            : defaultStatistik.pekerjaanList,
        };
      }

      // 2. Fallback ke tabel tunggal lama jika 4 tabel terpisah belum diisi sama sekali
      const { data: lamaRows } = await supabase.from("statistik_penduduk").select("*").limit(1);
      if (lamaRows && lamaRows.length > 0) {
        const data = lamaRows[0];
        return {
          ...defaultStatistik,
          ...data,
          dusunList: data.dusunList?.length ? data.dusunList : defaultStatistik.dusunList,
          pendidikanList: data.pendidikanList?.length ? data.pendidikanList : defaultStatistik.pendidikanList,
          pekerjaanList: data.pekerjaanList?.length ? data.pekerjaanList : defaultStatistik.pekerjaanList,
        } as StatistikPenduduk;
      }
    } catch (e) {
      console.error("Error reading statistik from Supabase:", e);
    }
  }

  // Jika Supabase tidak aktif atau kosong, gunakan local store jika valid, jika tidak gunakan defaultStatistik
  if (store.statistik_penduduk && store.statistik_penduduk.totalPenduduk) {
    return {
      ...defaultStatistik,
      ...store.statistik_penduduk,
      dusunList: store.statistik_penduduk.dusunList?.length ? store.statistik_penduduk.dusunList : defaultStatistik.dusunList,
      pendidikanList: store.statistik_penduduk.pendidikanList?.length ? store.statistik_penduduk.pendidikanList : defaultStatistik.pendidikanList,
      pekerjaanList: store.statistik_penduduk.pekerjaanList?.length ? store.statistik_penduduk.pekerjaanList : defaultStatistik.pekerjaanList,
    };
  }

  return defaultStatistik;
}

export async function updateStatistikPenduduk(dataInput: StatistikPenduduk): Promise<boolean> {
  if (!isPlaceholderSupabase) {
    try {
      // 1. Update ke statistik_ringkasan (tanpa id di payload untuk mencegah error PostgreSQL 428C9)
      const { data: existingRingkasan } = await supabaseServer.from("statistik_ringkasan").select("id").limit(1);
      const ringkasanPayload = {
        total_penduduk: Number(dataInput.totalPenduduk || 0),
        total_kk: Number(dataInput.totalKk || 0),
        laki_laki: Number(dataInput.lakiLaki || 0),
        perempuan: Number(dataInput.perempuan || 0),
      };

      if (existingRingkasan && existingRingkasan.length > 0) {
        const { error: errUpdate } = await supabaseServer
          .from("statistik_ringkasan")
          .update(ringkasanPayload)
          .eq("id", existingRingkasan[0].id);
        if (errUpdate) throw new Error(`Gagal memperbarui statistik ringkasan: ${errUpdate.message}`);
      } else {
        const { error: errInsert } = await supabaseServer
          .from("statistik_ringkasan")
          .insert(ringkasanPayload);
        if (errInsert) throw new Error(`Gagal menambahkan statistik ringkasan: ${errInsert.message}`);
      }

      // 2. Update statistik_dusun
      if (dataInput.dusunList && dataInput.dusunList.length > 0) {
        const { error: errDeleteDusun } = await supabaseServer.from("statistik_dusun").delete().gt("id", -1);
        if (errDeleteDusun) throw new Error(`Gagal mengosongkan statistik dusun: ${errDeleteDusun.message}`);
        const { error: errDusun } = await supabaseServer.from("statistik_dusun").insert(
          dataInput.dusunList.map((d) => ({
            nama: String(d.nama || ""),
            rt: Number(d.rt || 0),
            rw: Number(d.rw || 0),
            jiwa: Number(d.jiwa || 0),
            ...(d.kk !== undefined ? { kk: Number(d.kk) } : {}),
          }))
        );
        if (errDusun) throw new Error(`Gagal menyimpan statistik dusun: ${errDusun.message}`);
      }

      // 3. Update statistik_pendidikan
      if (dataInput.pendidikanList && dataInput.pendidikanList.length > 0) {
        const { error: errDeletePendidikan } = await supabaseServer.from("statistik_pendidikan").delete().gt("id", -1);
        if (errDeletePendidikan) throw new Error(`Gagal mengosongkan statistik pendidikan: ${errDeletePendidikan.message}`);
        const { error: errPendidikan } = await supabaseServer.from("statistik_pendidikan").insert(
          dataInput.pendidikanList.map((p) => ({
            name: String(p.name || ""),
            count: Number(p.count || 0),
          }))
        );
        if (errPendidikan) throw new Error(`Gagal menyimpan statistik pendidikan: ${errPendidikan.message}`);
      }

      // 4. Update statistik_pekerjaan
      if (dataInput.pekerjaanList && dataInput.pekerjaanList.length > 0) {
        const { error: errDeletePekerjaan } = await supabaseServer.from("statistik_pekerjaan").delete().gt("id", -1);
        if (errDeletePekerjaan) throw new Error(`Gagal mengosongkan statistik pekerjaan: ${errDeletePekerjaan.message}`);
        const { error: errPekerjaan } = await supabaseServer.from("statistik_pekerjaan").insert(
          dataInput.pekerjaanList.map((p) => ({
            name: String(p.name || ""),
            count: Number(p.count || 0),
            pct: Number(p.pct || 0),
          }))
        );
        if (errPekerjaan) throw new Error(`Gagal menyimpan statistik pekerjaan: ${errPekerjaan.message}`);
      }

      // 5. Backup ke tabel tunggal lama
      const { data: existingLama } = await supabaseServer.from("statistik_penduduk").select("id").limit(1);
      if (existingLama && existingLama.length > 0) {
        const { error } = await supabaseServer.from("statistik_penduduk").update(dataInput).eq("id", existingLama[0].id);
        if (error) throw new Error(`Gagal memperbarui statistik penduduk: ${error.message}`);
      } else {
        const { error } = await supabaseServer.from("statistik_penduduk").insert(dataInput);
        if (error) throw new Error(`Gagal menambahkan statistik penduduk: ${error.message}`);
      }
    } catch (error) {
      console.error("Error updating statistik in Supabase:", error);
      throw error;
    }
  }

  const store = readStore();
  store.statistik_penduduk = dataInput;
  writeStore(store);

  await recordAdminActivity("Transparansi", "update", "Memperbarui statistik kependudukan", "statistik-penduduk");

  return true;
}

// ─── Sistem Arsip Backup ─────────────────────────────────────────────────────

export type ArchivedItemType = "galeri" | "umkm" | "produk_hukum";

export type ArchivedItem = {
  id: number;
  type: ArchivedItemType;
  label: string;        // nama/judul item untuk ditampilkan di UI
  archivedAt: string;   // ISO string waktu diarsipkan
  purgeAt: string;      // ISO string batas akhir sebelum hapus permanen
  imageUrls: string[];  // URL file yang akan dihapus dari storage
  fileUrl?: string;     // untuk produk_hukum (PDF)
};

/** Arsipkan item terpilih — set archived_at = now() → hilang dari publik. */
export async function archiveItems(
  galeriIds: number[],
  umkmIds: number[],
  produkHukumIds: number[]
): Promise<{ archived: number }> {
  if (isPlaceholderSupabase) throw new Error("Supabase belum dikonfigurasi.");

  const now = new Date().toISOString();
  let total = 0;

  if (galeriIds.length > 0) {
    const { error } = await supabaseServer
      .from("galeri")
      .update({ archived_at: now })
      .in("id", galeriIds)
      .is("archived_at", null);
    if (error) throw new Error(`Gagal mengarsipkan galeri: ${error.message}`);
    total += galeriIds.length;
  }
  if (umkmIds.length > 0) {
    const { error } = await supabaseServer
      .from("umkm")
      .update({ archived_at: now })
      .in("id", umkmIds)
      .is("archived_at", null);
    if (error) throw new Error(`Gagal mengarsipkan UMKM: ${error.message}`);
    total += umkmIds.length;
  }
  if (produkHukumIds.length > 0) {
    const { error } = await supabaseServer
      .from("produk_hukum")
      .update({ archived_at: now })
      .in("id", produkHukumIds)
      .is("archived_at", null);
    if (error) throw new Error(`Gagal mengarsipkan produk hukum: ${error.message}`);
    total += produkHukumIds.length;
  }

  return { archived: total };
}

/** Ambil semua item yang sedang diarsipkan, dari 3 tabel. */
export async function getArchivedItems(): Promise<ArchivedItem[]> {
  if (isPlaceholderSupabase) return [];

  const results: ArchivedItem[] = [];
  const GRACE_DAYS = 30;

  try {
    const [galeriRes, umkmRes, hukumRes] = await Promise.all([
      supabaseServer.from("galeri").select("id, label, images, image, archived_at").not("archived_at", "is", null).order("archived_at", { ascending: false }),
      supabaseServer.from("umkm").select("id, name, images, image, archived_at").not("archived_at", "is", null).order("archived_at", { ascending: false }),
      supabaseServer.from("produk_hukum").select("id, judul, file_url, archived_at").not("archived_at", "is", null).order("archived_at", { ascending: false }),
    ]);

    for (const row of galeriRes.data || []) {
      const archivedAt = row.archived_at as string;
      const purgeAt = new Date(new Date(archivedAt).getTime() + GRACE_DAYS * 86400_000).toISOString();
      results.push({
        id: row.id,
        type: "galeri",
        label: row.label || `Galeri #${row.id}`,
        archivedAt,
        purgeAt,
        imageUrls: parseImagesList(row.images || row.image || ""),
      });
    }
    for (const row of umkmRes.data || []) {
      const archivedAt = row.archived_at as string;
      const purgeAt = new Date(new Date(archivedAt).getTime() + GRACE_DAYS * 86400_000).toISOString();
      results.push({
        id: row.id,
        type: "umkm",
        label: row.name || `UMKM #${row.id}`,
        archivedAt,
        purgeAt,
        imageUrls: parseImagesList(row.images || row.image || ""),
      });
    }
    for (const row of hukumRes.data || []) {
      const archivedAt = row.archived_at as string;
      const purgeAt = new Date(new Date(archivedAt).getTime() + GRACE_DAYS * 86400_000).toISOString();
      results.push({
        id: row.id,
        type: "produk_hukum",
        label: row.judul || `Produk Hukum #${row.id}`,
        archivedAt,
        purgeAt,
        imageUrls: [],
        fileUrl: row.file_url || undefined,
      });
    }
  } catch (e) {
    console.error("getArchivedItems error:", e);
  }

  return results;
}

/** Restore item yang diarsipkan — set archived_at = NULL. */
export async function restoreArchivedItem(id: number, type: ArchivedItemType): Promise<void> {
  if (isPlaceholderSupabase) throw new Error("Supabase belum dikonfigurasi.");

  const { error } = await supabaseServer
    .from(type)
    .update({ archived_at: null })
    .eq("id", id);
  if (error) throw new Error(`Gagal merestore item: ${error.message}`);
}

/**
 * Purge item yang sudah melewati grace period (30 hari).
 * Dipanggil oleh cron job harian.
 * Hapus file di Storage, lalu hapus baris dari DB.
 */
export async function purgeExpiredArchives(): Promise<{ purged: number }> {
  if (isPlaceholderSupabase) return { purged: 0 };

  const cutoff = new Date(Date.now() - 30 * 86400_000).toISOString();
  let purged = 0;

  async function purgeTable(table: ArchivedItemType, imageCol: string, fileCol?: string) {
    const { data, error } = await supabaseServer
      .from(table)
      .select(`id, ${imageCol}${fileCol ? ", " + fileCol : ""}, archived_at`)
      .not("archived_at", "is", null)
      .lt("archived_at", cutoff)
      .returns<Array<{ id: number } & Record<string, string | null>>>();
    if (error || !data || data.length === 0) return;

    // Kumpulkan semua path file yang akan dihapus dari storage
    const storageKeys: string[] = [];
    for (const row of data) {
      const imgStr: string = row[imageCol] || "";
      const urls = parseImagesList(imgStr);
      for (const url of urls) {
        try {
          const u = new URL(url);
          // Path setelah "/sukoharjo-assets/"
          const marker = "/sukoharjo-assets/";
          const idx = u.pathname.indexOf(marker);
          if (idx !== -1) storageKeys.push(u.pathname.slice(idx + marker.length));
        } catch {}
      }
      if (fileCol) {
        const fileUrl: string = row[fileCol] || "";
        if (fileUrl) {
          try {
            const u = new URL(fileUrl);
            const marker = "/sukoharjo-assets/";
            const idx = u.pathname.indexOf(marker);
            if (idx !== -1) storageKeys.push(u.pathname.slice(idx + marker.length));
          } catch {}
        }
      }
    }

    // Hapus file dari storage (best-effort, lanjut walau gagal)
    if (storageKeys.length > 0) {
      const { error: storageErr } = await supabaseServer.storage
        .from("sukoharjo-assets")
        .remove(storageKeys);
      if (storageErr) console.warn(`[purge] Storage remove error (${table}):`, storageErr.message);
    }

    // Hapus baris dari DB
    const ids = data.map((r) => r.id as number);
    const { error: delErr } = await supabaseServer.from(table).delete().in("id", ids);
    if (delErr) throw new Error(`Gagal menghapus baris ${table}: ${delErr.message}`);
    purged += ids.length;
  }

  await purgeTable("galeri", "images");
  await purgeTable("umkm", "images");
  await purgeTable("produk_hukum", "images", "file_url");

  return { purged };
}

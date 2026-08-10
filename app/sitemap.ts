import type { MetadataRoute } from "next";
import { getBeritaList, getUmkmList } from "@/lib/db";
import { siteUrl } from "@/lib/site";

const publicRoutes = ["", "/profil", "/umkm", "/berita", "/potensi", "/galeri", "/agenda", "/lembaga", "/statistik", "/apbdes", "/produk-hukum", "/pengaduan", "/buku-tamu"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [berita, umkm] = await Promise.all([getBeritaList(), getUmkmList()]);
  const now = new Date();
  return [
    ...publicRoutes.map((route) => ({ url: `${siteUrl}${route}`, lastModified: now, changeFrequency: route === "" ? "weekly" as const : "monthly" as const, priority: route === "" ? 1 : 0.7 })),
    ...berita.map((item) => ({ url: `${siteUrl}/berita/${item.id}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...umkm.map((item) => ({ url: `${siteUrl}/umkm/${item.id}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}

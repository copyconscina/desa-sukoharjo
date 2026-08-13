import {
  getProfilDesa,
  getLembagaList,
  getPotensiList,
  getAgendaList,
  getPengaduanList,
  getBukuTamuList,
  getApbdesRingkasan,
  getApbdesBidangList,
  getProdukHukumList,
  getStatistikPenduduk,
  getBeritaList,
  getUmkmList,
  getGaleriList,
} from "@/lib/db";
import { Metadata } from "next";
import ExportClientPage from "./ExportClientPage";

export const metadata: Metadata = {
  title: "Ekspor Data PDF | Admin Desa Sukoharjo",
  description: "Ekspor seluruh data website Desa Sukoharjo yang tersimpan di Supabase menjadi satu berkas PDF yang rapi.",
};

export const dynamic = "force-dynamic";

export default async function ExportDataPage() {
  const [
    profil,
    lembagaList,
    potensiList,
    agendaList,
    pengaduanList,
    bukuTamuList,
    apbdesRingkasan,
    apbdesBidangList,
    produkHukumList,
    statistikPenduduk,
    beritaList,
    umkmList,
    galeriList,
  ] = await Promise.all([
    getProfilDesa(),
    getLembagaList(),
    getPotensiList(),
    getAgendaList(),
    getPengaduanList(),
    getBukuTamuList(),
    getApbdesRingkasan(),
    getApbdesBidangList(),
    getProdukHukumList(),
    getStatistikPenduduk(),
    getBeritaList(),
    getUmkmList(),
    getGaleriList(),
  ]);

  return (
    <ExportClientPage
      data={{
        profil,
        lembagaList,
        potensiList,
        agendaList,
        pengaduanList,
        bukuTamuList,
        apbdesRingkasan,
        apbdesBidangList,
        produkHukumList,
        statistikPenduduk,
        beritaList,
        umkmList,
        galeriList,
      }}
    />
  );
}

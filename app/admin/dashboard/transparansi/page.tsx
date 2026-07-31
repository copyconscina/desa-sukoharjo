import {
  getApbdesRingkasan,
  getApbdesBidangList,
  getProdukHukumList,
  getStatistikPenduduk,
} from "@/lib/db";
import TransparansiClientPage from "./TransparansiClientPage";

export const dynamic = "force-dynamic";

export default async function TransparansiAdminPage() {
  const ringkasan = await getApbdesRingkasan();
  const bidangList = await getApbdesBidangList();
  const produkHukumList = await getProdukHukumList();
  const statistik = await getStatistikPenduduk();

  return (
    <TransparansiClientPage
      initialRingkasan={ringkasan}
      initialBidangList={bidangList}
      initialProdukHukum={produkHukumList}
      initialStatistik={statistik}
    />
  );
}

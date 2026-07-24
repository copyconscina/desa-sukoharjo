import {
  getApbdesRingkasan,
  getApbdesBidangList,
  getProdukHukumList,
  getPpidList,
  getBansosList,
} from "@/lib/db";
import TransparansiClientPage from "./TransparansiClientPage";

export const dynamic = "force-dynamic";

export default async function TransparansiAdminPage() {
  const ringkasan = await getApbdesRingkasan();
  const bidangList = await getApbdesBidangList();
  const produkHukumList = await getProdukHukumList();
  const ppidList = await getPpidList();
  const bansosList = await getBansosList();

  return (
    <TransparansiClientPage
      initialRingkasan={ringkasan}
      initialBidangList={bidangList}
      initialProdukHukum={produkHukumList}
      initialPpid={ppidList}
      initialBansos={bansosList}
    />
  );
}

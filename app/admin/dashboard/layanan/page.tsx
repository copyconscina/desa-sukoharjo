import {
  getAgendaList,
  getBukuTamuList,
  getPengaduanList,
} from "@/lib/db";
import LayananClientPage from "./LayananClientPage";

export const dynamic = "force-dynamic";

export default async function LayananAdminPage() {
  const agendaList = await getAgendaList();
  const bukuTamuList = await getBukuTamuList();
  const pengaduanList = await getPengaduanList();

  return (
    <LayananClientPage
      initialAgenda={agendaList}
      initialBukuTamu={bukuTamuList}
      initialPengaduan={pengaduanList}
    />
  );
}

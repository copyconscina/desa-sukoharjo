import {
  getAgendaList,
  getBukuTamuList,
  getPermohonanSuratList,
  getPengaduanList,
} from "@/lib/db";
import LayananClientPage from "./LayananClientPage";

export const dynamic = "force-dynamic";

export default async function LayananAdminPage() {
  const agendaList = await getAgendaList();
  const bukuTamuList = await getBukuTamuList();
  const suratList = await getPermohonanSuratList();
  const pengaduanList = await getPengaduanList();

  return (
    <LayananClientPage
      initialAgenda={agendaList}
      initialBukuTamu={bukuTamuList}
      initialSurat={suratList}
      initialPengaduan={pengaduanList}
    />
  );
}

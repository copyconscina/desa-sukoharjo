import { getProfilData, getLembagaList } from "@/lib/db";
import ProfilClientPage from "./ProfilClientPage";

export const dynamic = "force-dynamic";

export default async function ProfilAdminPage() {
  const profil = await getProfilData();
  const lembagaList = await getLembagaList();

  return <ProfilClientPage initialProfil={profil} initialLembagaList={lembagaList} />;
}

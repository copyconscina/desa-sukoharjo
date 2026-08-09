import { getProfilData, getLembagaList, getPotensiList } from "@/lib/db";
import ProfilClientPage from "./ProfilClientPage";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const profil = await getProfilData();
  const lembagaList = await getLembagaList();
  const potensiList = await getPotensiList();

  return (
    <ProfilClientPage
      initialProfil={profil}
      initialLembagaList={lembagaList}
      initialPotensiList={potensiList}
    />
  );
}
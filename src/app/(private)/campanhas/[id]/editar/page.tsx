import { EditarCampanhaPage } from "@/features/campanhas/pages/EditarCampanhaPage";

interface Props { params: Promise<{ id: string }> }

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <EditarCampanhaPage id={id} />;
}

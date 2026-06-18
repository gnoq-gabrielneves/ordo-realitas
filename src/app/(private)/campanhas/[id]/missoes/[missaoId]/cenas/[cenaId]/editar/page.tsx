import { EditarCenaPage } from "@/features/campanhas/pages/EditarCenaPage";

interface Props { params: Promise<{ id: string; missaoId: string; cenaId: string }> }

export default async function Page({ params }: Props) {
  const { id, missaoId, cenaId } = await params;
  return <EditarCenaPage campaignId={id} missaoId={missaoId} cenaId={cenaId} />;
}

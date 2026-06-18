import { EditarMissaoPage } from "@/features/campanhas/pages/EditarMissaoPage";

interface Props { params: Promise<{ id: string; missaoId: string }> }

export default async function Page({ params }: Props) {
  const { id, missaoId } = await params;
  return <EditarMissaoPage campaignId={id} missaoId={missaoId} />;
}

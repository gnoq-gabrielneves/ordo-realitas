import { MissaoDetailPage } from "@/features/campanhas/pages/MissaoDetailPage";

interface Props { params: Promise<{ id: string; missaoId: string }> }

export default async function Page({ params }: Props) {
  const { id, missaoId } = await params;
  return <MissaoDetailPage campaignId={id} missaoId={missaoId} />;
}

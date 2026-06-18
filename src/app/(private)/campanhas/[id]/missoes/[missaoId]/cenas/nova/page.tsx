import { NovaCenaPage } from "@/features/campanhas/pages/NovaCenaPage";

interface Props { params: Promise<{ id: string; missaoId: string }> }

export default async function Page({ params }: Props) {
  const { id, missaoId } = await params;
  return <NovaCenaPage campaignId={id} missaoId={missaoId} />;
}

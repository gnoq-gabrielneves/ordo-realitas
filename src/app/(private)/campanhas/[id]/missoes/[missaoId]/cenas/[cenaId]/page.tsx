import { CenaViewPage } from "@/features/campanhas/pages/CenaViewPage";

interface Props { params: Promise<{ id: string; missaoId: string; cenaId: string }> }

export default async function Page({ params }: Props) {
  const { id, missaoId, cenaId } = await params;
  return <CenaViewPage campaignId={id} missaoId={missaoId} cenaId={cenaId} />;
}

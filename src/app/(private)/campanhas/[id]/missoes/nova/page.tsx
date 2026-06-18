import { NovaMissaoPage } from "@/features/campanhas/pages/NovaMissaoPage";

interface Props { params: Promise<{ id: string }> }

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <NovaMissaoPage campaignId={id} />;
}

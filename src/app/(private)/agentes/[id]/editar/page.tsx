import { AgentDetailPage } from "@/features/agentes/pages/AgentDetailPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AgentDetailPage agenteId={id} backHref={`/agentes/${id}`} />;
}

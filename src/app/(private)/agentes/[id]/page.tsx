import { AgentViewPage } from "@/features/agentes/pages/AgentViewPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AgentViewPage agenteId={id} />;
}

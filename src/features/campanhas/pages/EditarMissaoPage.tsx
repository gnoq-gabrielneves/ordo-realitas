"use client";

import { MissaoForm } from "@/features/campanhas/components/MissaoForm";
import { useMissao, useUpdateMissao } from "@/features/campanhas/hooks/useCampanhas";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { MissaoPayload } from "@/shared/types/campaign";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface EditarMissaoPageProps { campaignId: string; missaoId: string }

export function EditarMissaoPage({ campaignId, missaoId }: EditarMissaoPageProps) {
  const router = useRouter();
  const { data: missao, isLoading } = useMissao(missaoId);
  const { mutate: atualizar, isPending } = useUpdateMissao(missaoId);

  function handleSubmit(payload: MissaoPayload) {
    atualizar(payload, { onSuccess: () => router.push(`/campanhas/${campaignId}/missoes/${missaoId}`) });
  }

  if (isLoading) return (
    <>
      <AppHeader title="Editar Missão" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-5 w-64 bg-muted animate-pulse rounded-sm" />)}</div>
      </main>
    </>
  );

  if (!missao) return null;

  return (
    <>
      <AppHeader title={`Editar — ${missao.titulo}`} />
      <main className="flex-1 overflow-y-auto p-6">
        <Link href={`/campanhas/${campaignId}/missoes/${missaoId}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit">
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para a missão
        </Link>
        <MissaoForm campaignId={campaignId} defaultValues={missao} onSubmit={handleSubmit} isPending={isPending} />
      </main>
    </>
  );
}

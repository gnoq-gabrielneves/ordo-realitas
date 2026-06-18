"use client";

import { CenaForm } from "@/features/campanhas/components/CenaForm";
import { useCena, useUpdateCena } from "@/features/campanhas/hooks/useCampanhas";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { CenaPayload } from "@/shared/types/campaign";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface EditarCenaPageProps { campaignId: string; missaoId: string; cenaId: string }

export function EditarCenaPage({ campaignId, missaoId, cenaId }: EditarCenaPageProps) {
  const router = useRouter();
  const { data: cena, isLoading } = useCena(cenaId);
  const { mutate: atualizar, isPending } = useUpdateCena(cenaId);

  function handleSubmit(payload: CenaPayload) {
    atualizar(payload, { onSuccess: () => router.push(`/campanhas/${campaignId}/missoes/${missaoId}/cenas/${cenaId}`) });
  }

  if (isLoading) return (
    <>
      <AppHeader title="Editar Cena" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-5 w-64 bg-muted animate-pulse rounded-sm" />)}</div>
      </main>
    </>
  );

  if (!cena) return null;

  return (
    <>
      <AppHeader title={`Editar — ${cena.titulo}`} />
      <main className="flex-1 overflow-y-auto p-6">
        <Link href={`/campanhas/${campaignId}/missoes/${missaoId}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit">
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para a missão
        </Link>
        <CenaForm missionId={missaoId} defaultValues={cena} onSubmit={handleSubmit} isPending={isPending} />
      </main>
    </>
  );
}

"use client";

import { CenaForm } from "@/features/campanhas/components/CenaForm";
import { useCenas, useCreateCena, useMissao } from "@/features/campanhas/hooks/useCampanhas";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { CenaPayload } from "@/shared/types/campaign";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NovaCenaPageProps { campaignId: string; missaoId: string }

export function NovaCenaPage({ campaignId, missaoId }: NovaCenaPageProps) {
  const router = useRouter();
  const { data: missao } = useMissao(missaoId);
  const { data: cenas = [] } = useCenas(missaoId);
  const { mutate: criar, isPending } = useCreateCena();
  const proximaOrdem = cenas.length > 0 ? Math.max(...cenas.map((cena) => cena.ordem)) + 1 : 1;

  function handleSubmit(payload: CenaPayload) {
    criar(payload, { onSuccess: (c) => router.push(`/campanhas/${campaignId}/missoes/${missaoId}/cenas/${c.id}`) });
  }

  return (
    <>
      <AppHeader title={missao ? `Nova Cena — ${missao.titulo}` : "Nova Cena"} />
      <main className="flex-1 overflow-y-auto p-6">
        <Link href={`/campanhas/${campaignId}/missoes/${missaoId}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit">
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para a missão
        </Link>
        <CenaForm
          missionId={missaoId}
          defaultValues={{ ordem: proximaOrdem }}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      </main>
    </>
  );
}

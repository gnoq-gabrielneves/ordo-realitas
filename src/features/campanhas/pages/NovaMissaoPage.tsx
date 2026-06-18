"use client";

import { MissaoForm } from "@/features/campanhas/components/MissaoForm";
import { useCampanha, useCreateMissao } from "@/features/campanhas/hooks/useCampanhas";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { MissaoPayload } from "@/shared/types/campaign";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NovaMissaoPageProps { campaignId: string }

export function NovaMissaoPage({ campaignId }: NovaMissaoPageProps) {
  const router = useRouter();
  const { data: campanha } = useCampanha(campaignId);
  const { mutate: criar, isPending } = useCreateMissao();

  function handleSubmit(payload: MissaoPayload) {
    criar(payload, { onSuccess: (m) => router.push(`/campanhas/${campaignId}/missoes/${m.id}`) });
  }

  return (
    <>
      <AppHeader title={campanha ? `Nova Missão — ${campanha.name}` : "Nova Missão"} />
      <main className="flex-1 overflow-y-auto p-6">
        <Link href={`/campanhas/${campaignId}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit">
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para a campanha
        </Link>
        <MissaoForm campaignId={campaignId} onSubmit={handleSubmit} isPending={isPending} />
      </main>
    </>
  );
}

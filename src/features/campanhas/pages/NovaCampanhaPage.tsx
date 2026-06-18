"use client";

import { CampanhaForm } from "@/features/campanhas/components/CampanhaForm";
import { useCreateCampanha } from "@/features/campanhas/hooks/useCampanhas";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { CampanhaPayload } from "@/shared/types/campaign";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function NovaCampanhaPage() {
  const router = useRouter();
  const { mutate: criar, isPending } = useCreateCampanha();

  function handleSubmit(payload: CampanhaPayload) {
    criar(payload, { onSuccess: (c) => router.push(`/campanhas/${c.id}`) });
  }

  return (
    <>
      <AppHeader title="Nova Campanha" />
      <main className="flex-1 overflow-y-auto p-6">
        <Link href="/campanhas" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit">
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para Campanhas
        </Link>
        <CampanhaForm onSubmit={handleSubmit} isPending={isPending} />
      </main>
    </>
  );
}

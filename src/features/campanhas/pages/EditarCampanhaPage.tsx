"use client";

import { CampanhaForm } from "@/features/campanhas/components/CampanhaForm";
import { useCampanha, useUpdateCampanha } from "@/features/campanhas/hooks/useCampanhas";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { CampanhaPayload } from "@/shared/types/campaign";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface EditarCampanhaPageProps { id: string }

export function EditarCampanhaPage({ id }: EditarCampanhaPageProps) {
  const router = useRouter();
  const { data: campanha, isLoading } = useCampanha(id);
  const { mutate: atualizar, isPending } = useUpdateCampanha(id);

  function handleSubmit(payload: CampanhaPayload) {
    atualizar(payload, { onSuccess: () => router.push(`/campanhas/${id}`) });
  }

  if (isLoading) return (
    <>
      <AppHeader title="Editar Campanha" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-5 w-64 bg-muted animate-pulse rounded-sm" />)}</div>
      </main>
    </>
  );

  if (!campanha) return null;

  return (
    <>
      <AppHeader title={`Editar — ${campanha.name}`} />
      <main className="flex-1 overflow-y-auto p-6">
        <Link href={`/campanhas/${id}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit">
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para a campanha
        </Link>
        <CampanhaForm defaultValues={campanha} onSubmit={handleSubmit} isPending={isPending} />
      </main>
    </>
  );
}

"use client";

import { SujeitoForm } from "@/features/sujeitos/components/SujeitoForm";
import { useCreateSujeito } from "@/features/sujeitos/hooks/useSujeitos";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { NpcPayload } from "@/shared/types/npc";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function NovoSujeitoPage() {
  const router = useRouter();
  const { mutate, isPending } = useCreateSujeito();

  function handleSubmit(payload: NpcPayload) {
    mutate(payload, {
      onSuccess: (npc) => router.push(`/sujeitos/${npc.id}`),
    });
  }

  return (
    <>
      <AppHeader title="Novo Sujeito" />
      <main className="flex-1 overflow-y-auto p-6">
        <Link
          href="/sujeitos"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para Sujeitos
        </Link>

        <div className="mb-6">
          <h2 className="text-sm font-medium text-foreground">Registrar Novo Sujeito</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Preencha os dados para catalogar o sujeito nos arquivos da Ordo.</p>
        </div>

        <SujeitoForm onSubmit={handleSubmit} isLoading={isPending} />
      </main>
    </>
  );
}

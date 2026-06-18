"use client";

import { SujeitoForm } from "@/features/sujeitos/components/SujeitoForm";
import { useSujeito, useUpdateSujeito } from "@/features/sujeitos/hooks/useSujeitos";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { NpcPayload } from "@/shared/types/npc";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface EditarSujeitoPageProps {
  id: string;
}

export function EditarSujeitoPage({ id }: EditarSujeitoPageProps) {
  const router = useRouter();
  const { data: sujeito, isLoading, isError } = useSujeito(id);
  const { mutate, isPending } = useUpdateSujeito(id);

  function handleSubmit(payload: NpcPayload) {
    mutate(payload, {
      onSuccess: () => router.push(`/sujeitos/${id}`),
    });
  }

  if (isLoading) return (
    <>
      <AppHeader title="Editar Sujeito" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-5 w-64 bg-muted animate-pulse rounded-sm" />
          ))}
        </div>
      </main>
    </>
  );

  if (isError || !sujeito) return (
    <>
      <AppHeader title="Editar Sujeito" />
      <main className="flex-1 overflow-y-auto p-6">
        <p className="text-sm text-destructive">Sujeito não encontrado.</p>
      </main>
    </>
  );

  return (
    <>
      <AppHeader title={`Editar — ${sujeito.name}`} />
      <main className="flex-1 overflow-y-auto p-6">
        <Link
          href={`/sujeitos/${id}`}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para o sujeito
        </Link>

        <SujeitoForm initial={sujeito} onSubmit={handleSubmit} isLoading={isPending} />
      </main>
    </>
  );
}

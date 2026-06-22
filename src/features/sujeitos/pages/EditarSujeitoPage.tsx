"use client";

import { SujeitoForm } from "@/features/sujeitos/components/SujeitoForm";
import { useSujeito, useUpdateSujeito } from "@/features/sujeitos/hooks/useSujeitos";
import { NpcPayload } from "@/shared/types/npc";
import { ArrowLeft, Skull } from "lucide-react";
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
    <main className="grid h-full place-items-center">
      <p className="text-sm text-muted-foreground">Carregando editor...</p>
    </main>
  );

  if (isError || !sujeito) return (
    <main className="grid h-full place-items-center">
      <p className="text-sm text-destructive">Sujeito não encontrado.</p>
    </main>
  );

  return (
    <main className="h-full overflow-y-auto">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-6 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/sujeitos/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Editor de sujeito</p>
            <h1 className="truncate text-xl font-semibold">{sujeito.name}</h1>
          </div>
          <span className="inline-flex items-center gap-1.5 border border-primary/30 bg-primary/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
            <Skull className="h-3.5 w-3.5" />
            Arquivo classificado
          </span>
        </div>
      </header>
      <div className="p-5">
        <SujeitoForm initial={sujeito} onSubmit={handleSubmit} isLoading={isPending} />
      </div>
    </main>
  );
}

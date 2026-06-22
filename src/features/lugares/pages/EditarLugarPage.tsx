"use client";

import { LugarForm } from "@/features/lugares/components/LugarForm";
import { useLugar, useUpdateLugar } from "@/features/lugares/hooks/useLugares";
import { Button } from "@/shared/components/ui/button";
import { PlacePayload } from "@/shared/types/place";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface EditarLugarPageProps { id: string }

export function EditarLugarPage({ id }: EditarLugarPageProps) {
  const router = useRouter();
  const { data: lugar, isLoading, isError } = useLugar(id);
  const { mutate, isPending } = useUpdateLugar(id);

  function handleSubmit(payload: PlacePayload) {
    mutate(payload, { onSuccess: () => router.push(`/lugares/${id}`) });
  }

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto p-5 lg:p-8">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-8 w-72 animate-pulse bg-muted" />)}
        </div>
      </main>
    );
  }

  if (isError || !lugar) {
    return (
      <main className="flex-1 overflow-y-auto p-5 lg:p-8">
        <p className="text-sm text-destructive">Lugar não encontrado.</p>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-5 py-4 backdrop-blur lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="shrink-0 px-0 text-muted-foreground hover:text-foreground">
            <Link href={`/lugares/${id}`}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Editor de lugar
            </p>
            <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">{lugar.name}</h1>
          </div>
        </div>
      </header>

      <div className="px-5 py-6 lg:px-8">
        <LugarForm initial={lugar} onSubmit={handleSubmit} isLoading={isPending} />
      </div>
    </main>
  );
}

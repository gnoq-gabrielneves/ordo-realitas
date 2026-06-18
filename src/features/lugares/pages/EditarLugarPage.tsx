"use client";

import { LugarForm } from "@/features/lugares/components/LugarForm";
import { useLugar, useUpdateLugar } from "@/features/lugares/hooks/useLugares";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
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

  if (isLoading) return (
    <>
      <AppHeader title="Editar Lugar" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-5 w-64 bg-muted animate-pulse rounded-sm" />)}
        </div>
      </main>
    </>
  );

  if (isError || !lugar) return (
    <>
      <AppHeader title="Editar Lugar" />
      <main className="flex-1 overflow-y-auto p-6">
        <p className="text-sm text-destructive">Lugar não encontrado.</p>
      </main>
    </>
  );

  return (
    <>
      <AppHeader title={`Editar — ${lugar.name}`} />
      <main className="flex-1 overflow-y-auto p-6">
        <Link href={`/lugares/${id}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit">
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para o lugar
        </Link>
        <LugarForm initial={lugar} onSubmit={handleSubmit} isLoading={isPending} />
      </main>
    </>
  );
}

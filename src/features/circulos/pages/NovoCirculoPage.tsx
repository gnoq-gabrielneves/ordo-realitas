"use client";

import { CirculoForm } from "@/features/circulos/components/CirculoForm";
import { useCreateCirculo } from "@/features/circulos/hooks/useCirculos";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { CirclePayload } from "@/shared/types/circle";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function NovoCirculoPage() {
  const router = useRouter();
  const { mutate, isPending } = useCreateCirculo();

  function handleSubmit(payload: CirclePayload) {
    mutate(payload, { onSuccess: (circulo) => router.push(`/circulos/${circulo.id}`) });
  }

  return (
    <>
      <AppHeader title="Novo Círculo" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-6xl">
          <Link href="/circulos" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Voltar para círculos
          </Link>
          <div className="mt-4 mb-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Registro de círculo</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Novo Círculo</h1>
          </div>
          <CirculoForm onSubmit={handleSubmit} isLoading={isPending} />
        </div>
      </main>
    </>
  );
}

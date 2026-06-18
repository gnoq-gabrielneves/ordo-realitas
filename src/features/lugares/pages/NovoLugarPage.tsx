"use client";

import { LugarForm } from "@/features/lugares/components/LugarForm";
import { useCreateLugar, useLugar } from "@/features/lugares/hooks/useLugares";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { PlacePayload } from "@/shared/types/place";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export function NovoLugarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentId = searchParams.get("parent") ?? undefined;

  const { data: parent } = useLugar(parentId ?? "");
  const { mutate, isPending } = useCreateLugar();

  function handleSubmit(payload: PlacePayload) {
    mutate(payload, {
      onSuccess: (lugar) => router.push(`/lugares/${lugar.id}`),
    });
  }

  const backHref = parentId ? `/lugares/${parentId}` : "/lugares";
  const backLabel = parent ? `Voltar para ${parent.name}` : "Voltar para Lugares";

  return (
    <>
      <AppHeader title="Novo Lugar" />
      <main className="flex-1 overflow-y-auto p-6">
        <Link href={backHref} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit">
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Link>

        <div className="mb-6">
          <h2 className="text-sm font-medium text-foreground">
            {parent ? `Novo sub-lugar em ${parent.name}` : "Registrar Novo Lugar"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Cataloge o lugar nos arquivos da Ordo.</p>
        </div>

        <LugarForm parentId={parentId} onSubmit={handleSubmit} isLoading={isPending} />
      </main>
    </>
  );
}

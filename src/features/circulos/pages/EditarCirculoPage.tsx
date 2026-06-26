"use client";

import { CirculoForm } from "@/features/circulos/components/CirculoForm";
import { useCirculo, useUpdateCirculo } from "@/features/circulos/hooks/useCirculos";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { CirclePayload } from "@/shared/types/circle";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export function EditarCirculoPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { data: circulo, isLoading, isError } = useCirculo(id);
  const { mutate, isPending } = useUpdateCirculo(id);

  function handleSubmit(payload: CirclePayload) {
    mutate(payload, { onSuccess: () => router.push(`/circulos/${id}`) });
  }

  if (isLoading) return <PageState title="Editar Círculo" text="Carregando círculo..." />;
  if (isError || !circulo) return <PageState title="Editar Círculo" text="Círculo não encontrado." />;

  return (
    <>
      <AppHeader title="Editar Círculo" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-6xl">
          <Link href={`/circulos/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Voltar para o círculo
          </Link>
          <div className="mt-4 mb-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Editor de círculo</p>
            <h1 className="mt-1 truncate text-3xl font-semibold tracking-tight">{circulo.nome}</h1>
          </div>
          <CirculoForm initial={circulo} onSubmit={handleSubmit} isLoading={isPending} />
        </div>
      </main>
    </>
  );
}

function PageState({ title, text }: { title: string; text: string }) {
  return (
    <>
      <AppHeader title={title} />
      <main className="flex-1 overflow-y-auto p-6">
        <p className="text-sm text-muted-foreground">{text}</p>
      </main>
    </>
  );
}

"use client";

import { LugarForm } from "@/features/lugares/components/LugarForm";
import { useCreateLugar, useLugar } from "@/features/lugares/hooks/useLugares";
import { Button } from "@/shared/components/ui/button";
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
  const title = parent ? `Novo sub-lugar em ${parent.name}` : "Novo Lugar";

  return (
    <main className="flex-1 overflow-y-auto">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-5 py-4 backdrop-blur lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="shrink-0 px-0 text-muted-foreground hover:text-foreground">
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Registro de lugar
            </p>
            <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          </div>
        </div>
      </header>

      <div className="px-5 py-6 lg:px-8">
        <LugarForm parentId={parentId} onSubmit={handleSubmit} isLoading={isPending} />
      </div>
    </main>
  );
}

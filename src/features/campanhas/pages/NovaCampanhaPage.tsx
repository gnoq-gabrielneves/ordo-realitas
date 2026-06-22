"use client";

import { CampanhaForm } from "@/features/campanhas/components/CampanhaForm";
import { useCreateCampanha } from "@/features/campanhas/hooks/useCampanhas";
import { Button } from "@/shared/components/ui/button";
import { CampanhaPayload } from "@/shared/types/campaign";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function NovaCampanhaPage() {
  const router = useRouter();
  const { mutate: criar, isPending } = useCreateCampanha();

  function handleSubmit(payload: CampanhaPayload) {
    criar(payload, { onSuccess: (c) => router.push(`/campanhas/${c.id}`) });
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-5 py-4 backdrop-blur lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="shrink-0 px-0 text-muted-foreground hover:text-foreground">
            <Link href="/campanhas">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Arquivo de operações
            </p>
            <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">Nova Campanha</h1>
          </div>
        </div>
      </header>

      <div className="px-5 py-6 lg:px-8">
        <CampanhaForm onSubmit={handleSubmit} isPending={isPending} />
      </div>
    </main>
  );
}

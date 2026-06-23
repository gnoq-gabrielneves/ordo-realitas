"use client";

import { RitualForm } from "@/features/rituais/components/RitualForm";
import { useCreateRitual, useRitual, useUpdateRitual } from "@/features/rituais/hooks/useRituais";
import { Button } from "@/shared/components/ui/button";
import { RitualPayload } from "@/shared/types/ritual";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RitualFormPageProps {
  ritualId?: string;
}

export function RitualFormPage({ ritualId }: RitualFormPageProps) {
  const router = useRouter();
  const isEdit = !!ritualId;

  const { data: ritual, isLoading } = useRitual(ritualId ?? "");
  const create = useCreateRitual();
  const update = useUpdateRitual();

  const handleSubmit = async (payload: RitualPayload) => {
    if (isEdit && ritual) {
      await update.mutateAsync({ id: ritual.id, payload });
    } else {
      await create.mutateAsync(payload);
    }
    router.push("/rituais");
  };

  if (isEdit && isLoading) {
    return (
      <main className="flex-1 overflow-y-auto p-5 lg:p-8">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-5 py-4 backdrop-blur lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="shrink-0 px-0 text-muted-foreground hover:text-foreground">
            <Link href="/rituais">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Grimório da Ordo
            </p>
            <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
              {isEdit ? ritual?.nome ?? "Editar Ritual" : "Novo Ritual"}
            </h1>
          </div>
        </div>
      </header>

      <div className="px-5 py-6 lg:px-8">
        <RitualForm
          initial={ritual}
          onSubmit={handleSubmit}
          loading={create.isPending || update.isPending}
        />
      </div>
    </main>
  );
}

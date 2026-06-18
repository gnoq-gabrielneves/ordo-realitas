"use client";

import { RitualForm } from "@/features/rituais/components/RitualForm";
import { useCreateRitual, useRitual, useUpdateRitual } from "@/features/rituais/hooks/useRituais";
import { RitualPayload } from "@/shared/types/ritual";
import { ChevronLeft } from "lucide-react";
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
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-6">
        <Link
          href="/rituais"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Rituais
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <h1 className="text-sm font-semibold">{isEdit ? "Editar Ritual" : "Novo Ritual"}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div>
          <RitualForm
            initial={ritual}
            onSubmit={handleSubmit}
            loading={create.isPending || update.isPending}
          />
        </div>
      </div>
    </div>
  );
}

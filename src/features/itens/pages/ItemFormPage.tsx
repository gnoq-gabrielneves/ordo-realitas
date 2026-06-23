"use client";

import { ItemForm } from "@/features/itens/components/ItemForm";
import { useCreateItem, useItem, useUpdateItem } from "@/features/itens/hooks/useItens";
import { Button } from "@/shared/components/ui/button";
import { ItemPayload } from "@/shared/types/item";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ItemFormPageProps {
  itemId?: string;
}

export function ItemFormPage({ itemId }: ItemFormPageProps) {
  const router = useRouter();
  const isEdit = !!itemId;

  const { data: item, isLoading } = useItem(itemId ?? "");
  const create = useCreateItem();
  const update = useUpdateItem();

  const handleSubmit = async (payload: ItemPayload) => {
    if (isEdit && item) {
      await update.mutateAsync({ id: item.id, payload });
    } else {
      await create.mutateAsync(payload);
    }
    router.push("/itens");
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
            <Link href="/itens">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Arsenal da Ordo
            </p>
            <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
              {isEdit ? item?.nome ?? "Editar Item" : "Novo Item"}
            </h1>
          </div>
        </div>
      </header>

      <div className="px-5 py-6 lg:px-8">
        <ItemForm
          initial={item}
          onSubmit={handleSubmit}
          loading={create.isPending || update.isPending}
        />
      </div>
    </main>
  );
}

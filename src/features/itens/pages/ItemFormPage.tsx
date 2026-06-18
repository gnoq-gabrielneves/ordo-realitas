"use client";

import { ItemForm } from "@/features/itens/components/ItemForm";
import { useCreateItem, useItem, useUpdateItem } from "@/features/itens/hooks/useItens";
import { ItemPayload } from "@/shared/types/item";
import { ChevronLeft } from "lucide-react";
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
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-6">
        <Link
          href="/itens"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Itens
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <h1 className="text-sm font-semibold">{isEdit ? "Editar Item" : "Novo Item"}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div>
          <ItemForm
            initial={item}
            onSubmit={handleSubmit}
            loading={create.isPending || update.isPending}
          />
        </div>
      </div>
    </div>
  );
}

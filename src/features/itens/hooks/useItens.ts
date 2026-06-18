import { createItem, deleteItem, getItem, getItens, updateItem } from "@/features/itens/services/itens";
import { ItemPayload } from "@/shared/types/item";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const KEY = "items";

export function useItens() {
  return useQuery({ queryKey: [KEY], queryFn: getItens });
}

export function useItem(id: string) {
  return useQuery({ queryKey: [KEY, id], queryFn: () => getItem(id), enabled: !!id });
}

export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ItemPayload) => createItem(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ItemPayload> }) =>
      updateItem(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

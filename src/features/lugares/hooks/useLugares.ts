import { createLugar, deleteLugar, getLugar, getLugares, getSubLugares, updateLugar } from "@/features/lugares/services/lugares";
import { PlacePayload } from "@/shared/types/place";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const KEY = "lugares";

export function useLugares() {
  return useQuery({ queryKey: [KEY], queryFn: getLugares });
}

export function useLugar(id: string) {
  return useQuery({ queryKey: [KEY, id], queryFn: () => getLugar(id), enabled: !!id });
}

export function useSubLugares(parentId: string) {
  return useQuery({ queryKey: [KEY, parentId, "sub"], queryFn: () => getSubLugares(parentId) });
}

export function useCreateLugar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PlacePayload) => createLugar(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateLugar(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<PlacePayload>) => updateLugar(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteLugar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLugar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

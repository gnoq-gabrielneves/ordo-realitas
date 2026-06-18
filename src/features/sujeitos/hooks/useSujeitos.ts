import { createSujeito, deleteSujeito, getSujeito, getSujeitos, updateSujeito } from "@/features/sujeitos/services/sujeitos";
import { NpcPayload } from "@/shared/types/npc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const KEY = "sujeitos";

export function useSujeitos() {
  return useQuery({ queryKey: [KEY], queryFn: getSujeitos });
}

export function useSujeito(id: string) {
  return useQuery({ queryKey: [KEY, id], queryFn: () => getSujeito(id) });
}

export function useCreateSujeito() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: NpcPayload) => createSujeito(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateSujeito(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<NpcPayload>) => updateSujeito(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteSujeito() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSujeito(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

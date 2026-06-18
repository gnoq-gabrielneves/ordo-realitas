import { createRitual, deleteRitual, getRitual, getRituais, updateRitual } from "@/features/rituais/services/rituais";
import { RitualPayload } from "@/shared/types/ritual";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const KEY = "rituals";

export function useRituais() {
  return useQuery({ queryKey: [KEY], queryFn: getRituais });
}

export function useRitual(id: string) {
  return useQuery({ queryKey: [KEY, id], queryFn: () => getRitual(id), enabled: !!id });
}

export function useCreateRitual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RitualPayload) => createRitual(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateRitual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<RitualPayload> }) =>
      updateRitual(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteRitual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRitual(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

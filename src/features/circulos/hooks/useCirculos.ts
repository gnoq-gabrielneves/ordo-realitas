import { createCirculo, deleteCirculo, getCirculo, getCirculos, updateCirculo } from "@/features/circulos/services/circulos";
import { CirclePayload } from "@/shared/types/circle";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const KEY = "circulos";

export function useCirculos() {
  return useQuery({ queryKey: [KEY], queryFn: getCirculos });
}

export function useCirculo(id: string) {
  return useQuery({ queryKey: [KEY, id], queryFn: () => getCirculo(id), enabled: !!id });
}

export function useCreateCirculo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CirclePayload) => createCirculo(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateCirculo(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CirclePayload>) => updateCirculo(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteCirculo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCirculo(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

import { createAgente, deleteAgente, getAgente, getAgentes, getMyAgente, updateAgente } from "@/features/agentes/services/agentes";
import { AgentSheetPayload } from "@/shared/types/agent";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const KEY = "agent_sheets";

export function useAgentes() {
  return useQuery({ queryKey: [KEY], queryFn: getAgentes });
}

export function useAgente(id: string) {
  return useQuery({ queryKey: [KEY, id], queryFn: () => getAgente(id), enabled: !!id });
}

export function useMyAgente() {
  return useQuery({ queryKey: [KEY, "me"], queryFn: getMyAgente });
}

export function useCreateAgente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<AgentSheetPayload>) => createAgente(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateAgente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AgentSheetPayload> }) =>
      updateAgente(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.setQueryData([KEY, data.id], data);
    },
  });
}

export function useDeleteAgente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAgente(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

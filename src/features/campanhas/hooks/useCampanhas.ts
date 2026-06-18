import {
  createCampanha, createCena, createMissao,
  deleteCampanha, deleteCena, deleteMissao,
  getCampanha, getCampanhas, getCena, getCenas,
  getHandoutsComImagem,
  getMissao, getMissoes,
  updateCampanha, updateCena, updateMissao,
} from "@/features/campanhas/services/campanhas";
import { CampanhaPayload, CenaPayload, MissaoPayload } from "@/shared/types/campaign";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const CAMPAIGNS_KEY = "campanhas";
const MISSIONS_KEY = "missoes";
const SCENES_KEY = "cenas";

// ---- Campanhas ----

export function useCampanhas() {
  return useQuery({ queryKey: [CAMPAIGNS_KEY], queryFn: getCampanhas });
}

export function useCampanha(id: string) {
  return useQuery({ queryKey: [CAMPAIGNS_KEY, id], queryFn: () => getCampanha(id) });
}

export function useCreateCampanha() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CampanhaPayload) => createCampanha(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CAMPAIGNS_KEY] }),
  });
}

export function useUpdateCampanha(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CampanhaPayload>) => updateCampanha(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CAMPAIGNS_KEY] }),
  });
}

export function useDeleteCampanha() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCampanha(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CAMPAIGNS_KEY] }),
  });
}

// ---- Missões ----

export function useMissoes(campaignId: string) {
  return useQuery({ queryKey: [MISSIONS_KEY, campaignId], queryFn: () => getMissoes(campaignId) });
}

export function useMissao(id: string) {
  return useQuery({ queryKey: [MISSIONS_KEY, "detail", id], queryFn: () => getMissao(id) });
}

export function useCreateMissao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MissaoPayload) => createMissao(payload),
    onSuccess: (data) => qc.invalidateQueries({ queryKey: [MISSIONS_KEY, data.campaign_id] }),
  });
}

export function useUpdateMissao(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<MissaoPayload>) => updateMissao(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [MISSIONS_KEY, data.campaign_id] });
      qc.invalidateQueries({ queryKey: [MISSIONS_KEY, "detail", id] });
    },
  });
}

export function useDeleteMissao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMissao(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [MISSIONS_KEY] }),
  });
}

export function useHandoutsComImagem() {
  return useQuery({ queryKey: ["handouts-com-imagem"], queryFn: getHandoutsComImagem });
}

// ---- Cenas ----

export function useCenas(missionId: string) {
  return useQuery({ queryKey: [SCENES_KEY, missionId], queryFn: () => getCenas(missionId) });
}

export function useCena(id: string) {
  return useQuery({ queryKey: [SCENES_KEY, "detail", id], queryFn: () => getCena(id) });
}

export function useCreateCena() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CenaPayload) => createCena(payload),
    onSuccess: (data) => qc.invalidateQueries({ queryKey: [SCENES_KEY, data.mission_id] }),
  });
}

export function useUpdateCena(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CenaPayload>) => updateCena(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [SCENES_KEY, data.mission_id] });
      qc.invalidateQueries({ queryKey: [SCENES_KEY, "detail", id] });
    },
  });
}

export function useDeleteCena() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCena(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SCENES_KEY] }),
  });
}

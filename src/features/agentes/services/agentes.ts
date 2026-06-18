import { createClient } from "@/shared/lib/supabase/client";
import { AgentFormaSuprema, AgentSheet, AgentSheetPayload } from "@/shared/types/agent";

const supabase = createClient();

export function emptyFormaSuprema(): AgentFormaSuprema {
  return {
    pv_max: 0, pv_atual: 0, pe_max: 0, pe_atual: 0, san_max: 0, san_atual: 0,
    usa_pd: false, pd_max: 0, pd_atual: 0,
    defesa_bonus: 0, defesa_equip: 0, deslocamento: "9m/6q",
    pericias: {}, ataques: [], habilidades: [], rituais: [],
  };
}

export async function getAgentes(): Promise<AgentSheet[]> {
  const { data, error } = await supabase
    .from("agent_sheets")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAgente(id: string): Promise<AgentSheet> {
  const { data, error } = await supabase
    .from("agent_sheets")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getMyAgente(): Promise<AgentSheet | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("agent_sheets")
    .select("*")
    .eq("profile_id", user.id)
    .single();
  return data ?? null;
}

export async function createAgente(payload: Partial<AgentSheetPayload>): Promise<AgentSheet> {
  const { data: { user } } = await supabase.auth.getUser();
  const defaults: Omit<AgentSheetPayload, "profile_id"> = {
    nome: null, image_url: null, origem: null, classe: null, trilha: null, nex: 5,
    tipo: "padrao", codinome: null, estigmas: [],
    forma_ativa: false, forma_suprema: null,
    desertor: false, desertor_acumulo: 0,
    agi: 0, forca: 0, intelecto: 0, presenca: 0, vigor: 0,
    pv_max: 0, pv_atual: 0, pe_max: 0, pe_atual: 0, san_max: 0, san_atual: 0,
    usa_pd: false, pd_max: 0, pd_atual: 0,
    pe_por_rodada: 1, deslocamento: "9m/6q",
    defesa_bonus: 0, defesa_equip: 0, protecao: null, resistencias: null,
    prof_arma_simples: false, prof_arma_tatica: false, prof_arma_pesada: false,
    prof_prot_leve: false, prof_prot_pesada: false,
    pericias: {}, ataques: [], habilidades: [], rituais: [], inventario: [],
    limite_credito: 1, carga_max: 0, pontos_prestigio: 0, patente: null,
    aparencia: null, personalidade: null, historico: null, objetivo: null,
  };
  const { data, error } = await supabase
    .from("agent_sheets")
    .insert({ ...defaults, ...payload, user_id: user!.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAgente(id: string, payload: Partial<AgentSheetPayload>): Promise<AgentSheet> {
  const { data, error } = await supabase
    .from("agent_sheets")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAgente(id: string): Promise<void> {
  const { error } = await supabase.from("agent_sheets").delete().eq("id", id);
  if (error) throw error;
}

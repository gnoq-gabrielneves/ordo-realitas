import { createClient } from "@/shared/lib/supabase/client";
import { Campanha, CampanhaPayload, Cena, CenaPayload, Missao, MissaoPayload } from "@/shared/types/campaign";

const supabase = createClient();

// ---- Campanhas ----

export async function getCampanhas(): Promise<Campanha[]> {
  const { data, error } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getCampanha(id: string): Promise<Campanha> {
  const { data, error } = await supabase.from("campaigns").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createCampanha(payload: CampanhaPayload): Promise<Campanha> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from("campaigns").insert({ ...payload, user_id: user!.id }).select().single();
  if (error) throw error;
  return data;
}

export async function updateCampanha(id: string, payload: Partial<CampanhaPayload>): Promise<Campanha> {
  const { data, error } = await supabase.from("campaigns").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCampanha(id: string): Promise<void> {
  const { error } = await supabase.from("campaigns").delete().eq("id", id);
  if (error) throw error;
}

// ---- Missões ----

export async function getMissoes(campaignId: string): Promise<Missao[]> {
  const { data, error } = await supabase
    .from("missions")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("numero");
  if (error) throw error;
  return data ?? [];
}

export async function getMissao(id: string): Promise<Missao> {
  const { data, error } = await supabase.from("missions").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createMissao(payload: MissaoPayload): Promise<Missao> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from("missions").insert({ ...payload, user_id: user!.id }).select().single();
  if (error) throw error;
  return data;
}

export async function updateMissao(id: string, payload: Partial<MissaoPayload>): Promise<Missao> {
  const { data, error } = await supabase.from("missions").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteMissao(id: string): Promise<void> {
  const { error } = await supabase.from("missions").delete().eq("id", id);
  if (error) throw error;
}

// ---- Handouts com imagem (para Apresentação) ----

export interface HandoutComImagem {
  mission_id: string;
  mission_titulo: string;
  campaign_name: string;
  titulo: string;
  image_url: string;
  conteudo: string;
}

export async function getHandoutsComImagem(): Promise<HandoutComImagem[]> {
  const { data, error } = await supabase
    .from("missions")
    .select("id, titulo, handouts, campaigns(name)");
  if (error) throw error;

  const result: HandoutComImagem[] = [];
  for (const mission of data ?? []) {
    for (const h of mission.handouts ?? []) {
      if (h.image_url) {
        result.push({
          mission_id: mission.id,
          mission_titulo: mission.titulo,
          campaign_name: (mission.campaigns as unknown as { name: string } | null)?.name ?? "",
          titulo: h.titulo,
          image_url: h.image_url,
          conteudo: h.conteudo,
        });
      }
    }
  }
  return result;
}

// ---- Cenas ----

export async function getCenas(missionId: string): Promise<Cena[]> {
  const { data, error } = await supabase
    .from("scenes")
    .select("*")
    .eq("mission_id", missionId)
    .order("ordem");
  if (error) throw error;
  return data ?? [];
}

export async function getCena(id: string): Promise<Cena> {
  const { data, error } = await supabase.from("scenes").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createCena(payload: CenaPayload): Promise<Cena> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from("scenes").insert({ ...payload, user_id: user!.id }).select().single();
  if (error) throw error;
  return data;
}

export async function updateCena(id: string, payload: Partial<CenaPayload>): Promise<Cena> {
  const { data, error } = await supabase.from("scenes").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCena(id: string): Promise<void> {
  const { error } = await supabase.from("scenes").delete().eq("id", id);
  if (error) throw error;
}

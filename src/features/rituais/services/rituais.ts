import { createClient } from "@/shared/lib/supabase/client";
import { Ritual, RitualPayload } from "@/shared/types/ritual";

const supabase = createClient();

export async function getRituais(): Promise<Ritual[]> {
  const { data, error } = await supabase
    .from("rituals")
    .select("*")
    .order("elemento")
    .order("circulo")
    .order("nome");
  if (error) throw error;
  return data ?? [];
}

export async function getRitual(id: string): Promise<Ritual> {
  const { data, error } = await supabase.from("rituals").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createRitual(payload: RitualPayload): Promise<Ritual> {
  const { data, error } = await supabase
    .from("rituals")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateRitual(id: string, payload: Partial<RitualPayload>): Promise<Ritual> {
  const { data, error } = await supabase
    .from("rituals")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteRitual(id: string): Promise<void> {
  const { error } = await supabase.from("rituals").delete().eq("id", id);
  if (error) throw error;
}

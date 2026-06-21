import { createClient } from "@/shared/lib/supabase/client";
import { requireCurrentUserId } from "@/shared/lib/supabase/auth";
import { Npc, NpcPayload } from "@/shared/types/npc";

const supabase = createClient();

export async function getSujeitos(): Promise<Npc[]> {
  const { data, error } = await supabase
    .from("npcs")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getSujeito(id: string): Promise<Npc> {
  const { data, error } = await supabase
    .from("npcs")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createSujeito(payload: NpcPayload): Promise<Npc> {
  const userId = await requireCurrentUserId(supabase);
  const { data, error } = await supabase
    .from("npcs")
    .insert({ ...payload, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSujeito(id: string, payload: Partial<NpcPayload>): Promise<Npc> {
  const { data, error } = await supabase
    .from("npcs")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSujeito(id: string): Promise<void> {
  const { error } = await supabase.from("npcs").delete().eq("id", id);
  if (error) throw error;
}

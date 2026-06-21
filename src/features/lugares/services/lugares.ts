import { createClient } from "@/shared/lib/supabase/client";
import { requireCurrentUserId } from "@/shared/lib/supabase/auth";
import { Place, PlacePayload } from "@/shared/types/place";

const supabase = createClient();

export async function getLugares(): Promise<Place[]> {
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getLugar(id: string): Promise<Place> {
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getSubLugares(parentId: string): Promise<Place[]> {
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .eq("parent_id", parentId)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createLugar(payload: PlacePayload): Promise<Place> {
  const userId = await requireCurrentUserId(supabase);
  const { data, error } = await supabase
    .from("places")
    .insert({ ...payload, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLugar(id: string, payload: Partial<PlacePayload>): Promise<Place> {
  const { data, error } = await supabase
    .from("places")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLugar(id: string): Promise<void> {
  const { error } = await supabase.from("places").delete().eq("id", id);
  if (error) throw error;
}

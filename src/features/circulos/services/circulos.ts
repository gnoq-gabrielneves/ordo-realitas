import { requireCurrentUserId } from "@/shared/lib/supabase/auth";
import { createClient } from "@/shared/lib/supabase/client";
import { Circle, CirclePayload } from "@/shared/types/circle";

const supabase = createClient();

export async function getCirculos(): Promise<Circle[]> {
  const { data, error } = await supabase
    .from("circles")
    .select("*")
    .order("nome");
  if (error) throw error;
  return data ?? [];
}

export async function getCirculo(id: string): Promise<Circle> {
  const { data, error } = await supabase
    .from("circles")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createCirculo(payload: CirclePayload): Promise<Circle> {
  const userId = await requireCurrentUserId(supabase);
  const { data, error } = await supabase
    .from("circles")
    .insert({ ...payload, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCirculo(id: string, payload: Partial<CirclePayload>): Promise<Circle> {
  const { data, error } = await supabase
    .from("circles")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCirculo(id: string): Promise<void> {
  const { error } = await supabase.from("circles").delete().eq("id", id);
  if (error) throw error;
}

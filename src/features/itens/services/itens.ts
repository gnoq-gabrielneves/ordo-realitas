import { createClient } from "@/shared/lib/supabase/client";
import { Item, ItemPayload } from "@/shared/types/item";

const supabase = createClient();

export async function getItens(): Promise<Item[]> {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("categoria")
    .order("nome");
  if (error) throw error;
  return data ?? [];
}

export async function getItem(id: string): Promise<Item> {
  const { data, error } = await supabase.from("items").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createItem(payload: ItemPayload): Promise<Item> {
  const { data, error } = await supabase
    .from("items")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateItem(id: string, payload: Partial<ItemPayload>): Promise<Item> {
  const { data, error } = await supabase
    .from("items")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw error;
}

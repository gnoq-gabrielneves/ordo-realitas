import { createClient } from "@/shared/lib/supabase/client";
import { requireCurrentUserId } from "@/shared/lib/supabase/auth";
import { PresentationPayload, PresentationState } from "@/shared/types/presentation";

const supabase = createClient();

export async function getMyPresentation(): Promise<PresentationState> {
  const uid = await requireCurrentUserId(supabase);

  const { data: existing } = await supabase
    .from("presentation_state")
    .select("*")
    .eq("user_id", uid)
    .single();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("presentation_state")
    .insert({
      user_id: uid,
      campaign_id: null,
      mode: "placeholder",
      placeholder_url: null,
      single_image_url: null,
      single_title: null,
      carousel_images: [],
      carousel_interval: 5,
      carousel_presets: [],
      active_preset_id: null,
      image_fit: "contain",
      show_title: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePresentation(
  id: string,
  payload: Partial<PresentationPayload>
): Promise<PresentationState> {
  const { data, error } = await supabase
    .from("presentation_state")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getActivePresentation(): Promise<PresentationState | null> {
  const { data } = await supabase
    .from("presentation_state")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();
  return data ?? null;
}

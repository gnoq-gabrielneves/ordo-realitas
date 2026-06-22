alter table public.agent_sheets
  add column if not exists intent_image_url text;

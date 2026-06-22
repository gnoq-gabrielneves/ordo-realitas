alter table public.presentation_state
  add column if not exists campaign_id uuid references public.campaigns(id) on delete set null;

create index if not exists presentation_state_campaign_id_idx on public.presentation_state(campaign_id);

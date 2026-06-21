create table if not exists public.combat_encounters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  mission_id uuid references public.missions(id) on delete set null,
  scene_id uuid references public.scenes(id) on delete set null,
  name text not null default 'Combate sem titulo',
  round integer not null default 1,
  active_participant_id uuid,
  status text not null default 'active' check (status in ('draft', 'active', 'finished', 'archived')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.combat_participants (
  id uuid primary key default gen_random_uuid(),
  encounter_id uuid not null references public.combat_encounters(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null check (source in ('agente', 'sujeito', 'avulso')),
  ref_id uuid,
  name text not null,
  image_url text,
  initiative integer,
  initiative_bonus integer not null default 0,
  hp_current integer not null default 0,
  hp_max integer not null default 0,
  defense integer,
  conditions text[] not null default '{}',
  notes text,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.combat_encounters
  add constraint combat_encounters_active_participant_fkey
  foreign key (active_participant_id) references public.combat_participants(id) on delete set null;

create table if not exists public.combat_events (
  id uuid primary key default gen_random_uuid(),
  encounter_id uuid not null references public.combat_encounters(id) on delete cascade,
  participant_id uuid references public.combat_participants(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  label text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists combat_encounters_user_id_idx on public.combat_encounters(user_id);
create index if not exists combat_encounters_scene_id_idx on public.combat_encounters(scene_id);
create index if not exists combat_participants_encounter_id_idx on public.combat_participants(encounter_id);
create index if not exists combat_participants_initiative_idx on public.combat_participants(encounter_id, initiative desc nulls last, sort_order);
create index if not exists combat_events_encounter_id_idx on public.combat_events(encounter_id, created_at desc);

drop trigger if exists combat_encounters_set_updated_at on public.combat_encounters;
create trigger combat_encounters_set_updated_at before update on public.combat_encounters for each row execute function public.set_updated_at();
drop trigger if exists combat_participants_set_updated_at on public.combat_participants;
create trigger combat_participants_set_updated_at before update on public.combat_participants for each row execute function public.set_updated_at();

alter table public.combat_encounters enable row level security;
alter table public.combat_participants enable row level security;
alter table public.combat_events enable row level security;

drop policy if exists "combat_encounters_owner_all" on public.combat_encounters;
create policy "combat_encounters_owner_all" on public.combat_encounters for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "combat_participants_owner_all" on public.combat_participants;
create policy "combat_participants_owner_all" on public.combat_participants for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "combat_events_owner_all" on public.combat_events;
create policy "combat_events_owner_all" on public.combat_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

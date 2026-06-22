create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  avatar_url text,
  role text not null default 'jogador' check (role in ('mestre', 'jogador', 'tv')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  image_url text,
  synopsis text,
  historico text,
  vilao text,
  nex_inicial integer not null default 0,
  nex_final integer not null default 35,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  numero integer not null default 1,
  is_prologo boolean not null default false,
  resumo text,
  historico text,
  prologo text,
  epilogo text,
  nex_inicial integer,
  nex_final integer,
  handouts jsonb not null default '[]'::jsonb,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scenes (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  parte text,
  tipo text not null default 'narrativa' check (tipo in ('narrativa', 'combate', 'investigacao', 'social', 'interludio')),
  texto_descritivo text,
  notas_mestre text,
  ordem integer not null default 0,
  roteiro jsonb not null default '[]'::jsonb,
  urgencia boolean not null default false,
  urgencia_rodadas jsonb not null default '[]'::jsonb,
  lugar_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_sheets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text,
  image_url text,
  intent_image_url text,
  origem text,
  classe text,
  trilha text,
  tipo text not null default 'padrao',
  codinome text,
  estigmas jsonb not null default '[]'::jsonb,
  forma_ativa boolean not null default false,
  forma_suprema jsonb,
  desertor boolean not null default false,
  desertor_acumulo integer not null default 0,
  nex integer not null default 5,
  agi integer not null default 1,
  forca integer not null default 1,
  intelecto integer not null default 1,
  presenca integer not null default 1,
  vigor integer not null default 1,
  pv_max integer not null default 0,
  pv_atual integer not null default 0,
  pe_max integer not null default 0,
  pe_atual integer not null default 0,
  san_max integer not null default 0,
  san_atual integer not null default 0,
  usa_pd boolean not null default false,
  pd_max integer not null default 0,
  pd_atual integer not null default 0,
  pe_por_rodada integer not null default 1,
  deslocamento text not null default '9m',
  defesa_bonus integer not null default 0,
  defesa_equip integer not null default 0,
  protecao text,
  resistencias text,
  prof_arma_simples boolean not null default false,
  prof_arma_tatica boolean not null default false,
  prof_arma_pesada boolean not null default false,
  prof_prot_leve boolean not null default false,
  prof_prot_pesada boolean not null default false,
  pericias jsonb not null default '{}'::jsonb,
  ataques jsonb not null default '[]'::jsonb,
  habilidades jsonb not null default '[]'::jsonb,
  rituais jsonb not null default '[]'::jsonb,
  inventario jsonb not null default '[]'::jsonb,
  limite_credito integer not null default 1,
  carga_max integer not null default 0,
  pontos_prestigio integer not null default 0,
  patente text,
  aparencia text,
  personalidade text,
  historico text,
  objetivo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.npcs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  image_url text,
  tipo text check (tipo in ('pessoa', 'criatura')),
  tamanho text check (tamanho in ('pequeno', 'medio', 'grande', 'enorme', 'colossal')),
  vd integer,
  origem text check (origem in ('sangue', 'morte', 'medo', 'conhecimento', 'energia')),
  descricao text,
  backstory text,
  percepcao text,
  iniciativa text,
  percepcao_as_cegas boolean not null default false,
  agi integer,
  atrib_for integer,
  atrib_int integer,
  pre integer,
  vig integer,
  defesa integer,
  fortitude text,
  reflexos text,
  vontade text,
  pv integer,
  pv_atual integer,
  deslocamento text,
  pp_dt text,
  pp_dano text,
  pp_imune_nex text,
  pericias jsonb not null default '[]'::jsonb,
  resistencias jsonb not null default '[]'::jsonb,
  vulnerabilidades jsonb not null default '[]'::jsonb,
  habilidades jsonb not null default '[]'::jsonb,
  acoes jsonb not null default '[]'::jsonb,
  rituais jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.places(id) on delete cascade,
  name text not null,
  tipo text,
  localizacao text,
  image_url text,
  descricao text,
  atmosfera text,
  backstory text,
  atividade_paranormal text,
  origem text,
  membrana text,
  pontos_de_interesse jsonb not null default '[]'::jsonb,
  notas text,
  segredos text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.scenes
  add constraint scenes_lugar_id_fkey
  foreign key (lugar_id) references public.places(id) on delete set null;

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  categoria text,
  descricao text,
  image_url text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rituals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  elemento text,
  circulo integer,
  execucao text,
  alcance text,
  alvo text,
  duracao text,
  resistencia text,
  descricao text,
  image_url text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.presentation_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  mode text not null default 'placeholder',
  placeholder_url text,
  single_image_url text,
  single_title text,
  carousel_images jsonb not null default '[]'::jsonb,
  carousel_interval integer not null default 5,
  carousel_presets jsonb not null default '[]'::jsonb,
  active_preset_id text,
  image_fit text not null default 'contain',
  show_title boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists campaigns_user_id_idx on public.campaigns(user_id);
create index if not exists missions_campaign_id_idx on public.missions(campaign_id);
create index if not exists scenes_mission_id_ordem_idx on public.scenes(mission_id, ordem);
create index if not exists agent_sheets_user_id_idx on public.agent_sheets(user_id);
create index if not exists npcs_user_id_idx on public.npcs(user_id);
create index if not exists places_user_id_idx on public.places(user_id);
create index if not exists items_user_id_idx on public.items(user_id);
create index if not exists rituals_user_id_idx on public.rituals(user_id);
create index if not exists presentation_state_user_id_idx on public.presentation_state(user_id);
create index if not exists presentation_state_campaign_id_idx on public.presentation_state(campaign_id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists campaigns_set_updated_at on public.campaigns;
create trigger campaigns_set_updated_at before update on public.campaigns for each row execute function public.set_updated_at();
drop trigger if exists missions_set_updated_at on public.missions;
create trigger missions_set_updated_at before update on public.missions for each row execute function public.set_updated_at();
drop trigger if exists scenes_set_updated_at on public.scenes;
create trigger scenes_set_updated_at before update on public.scenes for each row execute function public.set_updated_at();
drop trigger if exists agent_sheets_set_updated_at on public.agent_sheets;
create trigger agent_sheets_set_updated_at before update on public.agent_sheets for each row execute function public.set_updated_at();
drop trigger if exists npcs_set_updated_at on public.npcs;
create trigger npcs_set_updated_at before update on public.npcs for each row execute function public.set_updated_at();
drop trigger if exists places_set_updated_at on public.places;
create trigger places_set_updated_at before update on public.places for each row execute function public.set_updated_at();
drop trigger if exists items_set_updated_at on public.items;
create trigger items_set_updated_at before update on public.items for each row execute function public.set_updated_at();
drop trigger if exists rituals_set_updated_at on public.rituals;
create trigger rituals_set_updated_at before update on public.rituals for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.missions enable row level security;
alter table public.scenes enable row level security;
alter table public.agent_sheets enable row level security;
alter table public.npcs enable row level security;
alter table public.places enable row level security;
alter table public.items enable row level security;
alter table public.rituals enable row level security;
alter table public.presentation_state enable row level security;

-- Helper: o usuário atual é mestre? security definer evita recursão de RLS em profiles.
create or replace function public.is_mestre()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'mestre');
$$;

-- Perfis: cada um lê o próprio; o mestre lê e edita todos (gestão de usuários).
drop policy if exists "profiles_own_select" on public.profiles;
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select
  using (id = auth.uid() or public.is_mestre());
drop policy if exists "profiles_own_update" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles for update
  using (id = auth.uid() or public.is_mestre())
  with check (id = auth.uid() or public.is_mestre());

drop policy if exists "campaigns_owner_all" on public.campaigns;
create policy "campaigns_owner_all" on public.campaigns for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "missions_owner_all" on public.missions;
create policy "missions_owner_all" on public.missions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "scenes_owner_all" on public.scenes;
create policy "scenes_owner_all" on public.scenes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "agent_sheets_owner_all" on public.agent_sheets;
create policy "agent_sheets_owner_all" on public.agent_sheets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- Jogador lê e edita (PV/PE etc.) a ficha vinculada a ele.
drop policy if exists "agent_sheets_jogador_select" on public.agent_sheets;
create policy "agent_sheets_jogador_select" on public.agent_sheets for select using (profile_id = auth.uid());
drop policy if exists "agent_sheets_jogador_update" on public.agent_sheets;
create policy "agent_sheets_jogador_update" on public.agent_sheets for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());
drop policy if exists "npcs_owner_all" on public.npcs;
create policy "npcs_owner_all" on public.npcs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "places_owner_all" on public.places;
create policy "places_owner_all" on public.places for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "items_owner_all" on public.items;
create policy "items_owner_all" on public.items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "rituals_owner_all" on public.rituals;
create policy "rituals_owner_all" on public.rituals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "presentation_state_owner_all" on public.presentation_state;
create policy "presentation_state_owner_all" on public.presentation_state for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values
  ('agentes', 'agentes', true),
  ('campanhas', 'campanhas', true),
  ('lugares', 'lugares', true),
  ('sujeitos', 'sujeitos', true),
  ('apresentacao', 'apresentacao', true)
on conflict (id) do nothing;

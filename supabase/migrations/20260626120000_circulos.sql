create table if not exists public.circles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  tipo text not null default 'grupo' check (tipo in ('organizacao', 'familia', 'culto', 'faccao', 'grupo', 'outro')),
  image_url text,
  descricao text,
  lideranca text,
  sede text,
  objetivo text,
  reputacao text,
  segredos text,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.npcs
  add column if not exists circle_id uuid references public.circles(id) on delete set null;

create index if not exists circles_user_id_idx on public.circles(user_id);
create index if not exists npcs_circle_id_idx on public.npcs(circle_id);

drop trigger if exists circles_set_updated_at on public.circles;
create trigger circles_set_updated_at before update on public.circles for each row execute function public.set_updated_at();

alter table public.circles enable row level security;

drop policy if exists "circles_owner_all" on public.circles;
create policy "circles_owner_all" on public.circles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('circulos', 'circulos', true)
on conflict (id) do nothing;

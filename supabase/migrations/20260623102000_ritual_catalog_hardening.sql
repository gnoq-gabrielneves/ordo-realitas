-- Fortalece o catalogo de rituais para suportar rituais oficiais globais,
-- custo base, versoes Discente/Verdadeiro e campos usados pela ficha.

alter table public.rituals
  alter column user_id drop not null;

alter table public.rituals
  add column if not exists name text,
  add column if not exists nome text,
  add column if not exists dt integer,
  add column if not exists custo_pe integer,
  add column if not exists dano text,
  add column if not exists area text,
  add column if not exists tipo text,
  add column if not exists componentes text,
  add column if not exists discente text,
  add column if not exists discente_custo integer,
  add column if not exists verdadeiro text,
  add column if not exists verdadeiro_custo integer,
  add column if not exists requisitos text,
  add column if not exists data jsonb not null default '{}'::jsonb,
  add column if not exists tags text[] not null default '{}'::text[],
  add column if not exists fonte text not null default 'manual',
  add column if not exists oficial boolean not null default false;

update public.rituals
set
  nome = coalesce(nome, name),
  elemento = coalesce(elemento, data->>'elemento', 'conhecimento'),
  circulo = coalesce(circulo, nullif(data->>'circulo', '')::integer, 1),
  execucao = coalesce(execucao, data->>'execucao', 'Ação Padrão'),
  alcance = coalesce(alcance, data->>'alcance', 'Pessoal'),
  alvo = coalesce(alvo, data->>'alvo'),
  duracao = coalesce(duracao, data->>'duracao'),
  resistencia = coalesce(resistencia, data->>'resistencia'),
  dt = coalesce(dt, nullif(data->>'dt', '')::integer),
  custo_pe = coalesce(custo_pe, nullif(data->>'custo_pe', '')::integer),
  dano = coalesce(dano, data->>'dano'),
  area = coalesce(area, data->>'area'),
  tipo = coalesce(tipo, data->>'tipo'),
  componentes = coalesce(componentes, data->>'componentes'),
  discente = coalesce(discente, data->>'discente'),
  discente_custo = coalesce(discente_custo, nullif(data->>'discente_custo', '')::integer),
  verdadeiro = coalesce(verdadeiro, data->>'verdadeiro'),
  verdadeiro_custo = coalesce(verdadeiro_custo, nullif(data->>'verdadeiro_custo', '')::integer),
  requisitos = coalesce(requisitos, data->>'requisitos'),
  fonte = coalesce(nullif(fonte, ''), data->>'fonte', 'manual'),
  oficial = coalesce(oficial, (data->>'oficial')::boolean, false)
where nome is null
   or elemento is null
   or circulo is null
   or execucao is null
   or alcance is null
   or dt is null
   or custo_pe is null
   or dano is null
   or area is null
   or tipo is null
   or componentes is null
   or discente is null
   or discente_custo is null
   or verdadeiro is null
   or verdadeiro_custo is null
   or requisitos is null;

update public.rituals
set name = coalesce(name, nome)
where name is null;

update public.rituals
set custo_pe = case circulo
  when 1 then 1
  when 2 then 3
  when 3 then 6
  when 4 then 10
  else custo_pe
end
where custo_pe is null;

alter table public.rituals
  alter column nome set not null,
  alter column elemento set not null,
  alter column circulo set not null,
  alter column execucao set not null,
  alter column alcance set not null,
  alter column custo_pe set not null;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'rituals_elemento_check'
      and conrelid = 'public.rituals'::regclass
  ) then
    alter table public.rituals drop constraint rituals_elemento_check;
  end if;

  alter table public.rituals
    add constraint rituals_elemento_check
    check (elemento in ('conhecimento', 'energia', 'morte', 'sangue', 'medo'));

  if exists (
    select 1
    from pg_constraint
    where conname = 'rituals_circulo_check'
      and conrelid = 'public.rituals'::regclass
  ) then
    alter table public.rituals drop constraint rituals_circulo_check;
  end if;

  alter table public.rituals
    add constraint rituals_circulo_check
    check (circulo between 1 and 4);
end $$;

create or replace function public.sync_ritual_name_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.nome := nullif(trim(coalesce(new.nome, new.name)), '');
  new.name := new.nome;
  new.data := coalesce(new.data, '{}'::jsonb);
  new.custo_pe := coalesce(
    new.custo_pe,
    case new.circulo
      when 1 then 1
      when 2 then 3
      when 3 then 6
      when 4 then 10
      else null
    end
  );
  return new;
end;
$$;

drop trigger if exists rituals_sync_name_fields on public.rituals;
create trigger rituals_sync_name_fields
before insert or update on public.rituals
for each row execute function public.sync_ritual_name_fields();

drop index if exists public.rituals_user_id_idx;
create index if not exists rituals_user_id_idx on public.rituals(user_id);
create index if not exists rituals_elemento_circulo_idx on public.rituals(elemento, circulo);
create index if not exists rituals_oficial_idx on public.rituals(oficial);
create unique index if not exists rituals_catalog_unique_idx
on public.rituals (
  coalesce(user_id, '00000000-0000-0000-0000-000000000000'::uuid),
  lower(nome),
  elemento,
  circulo,
  fonte
);

drop policy if exists "rituals_owner_all" on public.rituals;
drop policy if exists "rituals_select_catalog" on public.rituals;
drop policy if exists "rituals_insert_owner" on public.rituals;
drop policy if exists "rituals_update_owner" on public.rituals;
drop policy if exists "rituals_delete_owner" on public.rituals;

create policy "rituals_select_catalog"
on public.rituals for select
using (user_id is null or auth.uid() = user_id);

create policy "rituals_insert_owner"
on public.rituals for insert
with check (auth.uid() = user_id);

create policy "rituals_update_owner"
on public.rituals for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "rituals_delete_owner"
on public.rituals for delete
using (auth.uid() = user_id);

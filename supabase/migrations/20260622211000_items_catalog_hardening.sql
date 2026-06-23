-- Fortalece o catalogo de itens para suportar armas, protecoes, municoes,
-- modificacoes e equipamentos gerais de Ordem Paranormal.

alter table public.items
  alter column user_id drop not null;

alter table public.items
  add column if not exists name text,
  add column if not exists nome text,
  add column if not exists categoria text,
  add column if not exists descricao text,
  add column if not exists image_url text,
  add column if not exists subcategoria text,
  add column if not exists data jsonb not null default '{}'::jsonb,
  add column if not exists credito_tier integer,
  add column if not exists categoria_valor integer not null default 0,
  add column if not exists espacos integer not null default 1,
  add column if not exists espacos_texto text,
  add column if not exists proficiencia text,
  add column if not exists tipo_arma text,
  add column if not exists empunhadura text,
  add column if not exists dano text,
  add column if not exists teste text,
  add column if not exists critico text,
  add column if not exists alcance text,
  add column if not exists tipo_dano text,
  add column if not exists especial text,
  add column if not exists protecao_valor text,
  add column if not exists defesa_bonus integer,
  add column if not exists rd text,
  add column if not exists penalidade text,
  add column if not exists bonus_pericia text,
  add column if not exists acao_uso text,
  add column if not exists custo_pe integer,
  add column if not exists dt text,
  add column if not exists duracao text,
  add column if not exists resistencia text,
  add column if not exists requisitos text,
  add column if not exists tags text[] not null default '{}'::text[],
  add column if not exists fonte text not null default 'manual',
  add column if not exists oficial boolean not null default false;

update public.items
set
  nome = coalesce(nome, name),
  categoria = coalesce(categoria, data->>'categoria', 'geral'),
  subcategoria = coalesce(subcategoria, data->>'subcategoria'),
  categoria_valor = coalesce(
    nullif(data->>'categoria_valor', '')::integer,
    credito_tier,
    nullif(data->>'credito_tier', '')::integer,
    categoria_valor,
    0
  ),
  credito_tier = coalesce(
    credito_tier,
    nullif(data->>'categoria_valor', '')::integer,
    nullif(data->>'credito_tier', '')::integer,
    0
  ),
  espacos = coalesce(espacos, nullif(data->>'espacos', '')::integer, 1),
  espacos_texto = coalesce(espacos_texto, data->>'espacos_texto'),
  proficiencia = coalesce(proficiencia, data->>'proficiencia'),
  tipo_arma = coalesce(tipo_arma, data->>'tipo_arma'),
  empunhadura = coalesce(empunhadura, data->>'empunhadura'),
  dano = coalesce(dano, data->>'dano'),
  teste = coalesce(teste, data->>'teste'),
  critico = coalesce(critico, data->>'critico'),
  alcance = coalesce(alcance, data->>'alcance'),
  tipo_dano = coalesce(tipo_dano, data->>'tipo_dano'),
  especial = coalesce(especial, data->>'especial'),
  protecao_valor = coalesce(protecao_valor, data->>'protecao_valor'),
  defesa_bonus = coalesce(defesa_bonus, nullif(data->>'defesa_bonus', '')::integer),
  rd = coalesce(rd, data->>'rd'),
  penalidade = coalesce(penalidade, data->>'penalidade'),
  bonus_pericia = coalesce(bonus_pericia, data->>'bonus_pericia'),
  acao_uso = coalesce(acao_uso, data->>'acao_uso'),
  custo_pe = coalesce(custo_pe, nullif(data->>'custo_pe', '')::integer),
  dt = coalesce(dt, data->>'dt'),
  duracao = coalesce(duracao, data->>'duracao'),
  resistencia = coalesce(resistencia, data->>'resistencia'),
  requisitos = coalesce(requisitos, data->>'requisitos'),
  fonte = coalesce(nullif(fonte, ''), data->>'fonte', 'manual'),
  oficial = coalesce(oficial, (data->>'oficial')::boolean, false)
where nome is null
   or subcategoria is null
   or proficiencia is null
   or tipo_arma is null
   or empunhadura is null
   or dano is null
   or teste is null
   or critico is null
   or alcance is null
   or tipo_dano is null
   or especial is null
   or protecao_valor is null
   or defesa_bonus is null
   or rd is null
   or penalidade is null
   or bonus_pericia is null
   or acao_uso is null
   or custo_pe is null
   or dt is null
   or duracao is null
   or resistencia is null
   or requisitos is null;

update public.items
set name = coalesce(name, nome)
where name is null;

alter table public.items
  alter column nome set not null;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'items_categoria_check'
      and conrelid = 'public.items'::regclass
  ) then
    alter table public.items
      drop constraint items_categoria_check;
  end if;

  alter table public.items
    add constraint items_categoria_check
    check (categoria in ('arma', 'protecao', 'geral', 'municao', 'modificacao'));

  if not exists (
    select 1
    from pg_constraint
    where conname = 'items_categoria_valor_check'
      and conrelid = 'public.items'::regclass
  ) then
    alter table public.items
      add constraint items_categoria_valor_check
      check (categoria_valor between 0 and 6);
  end if;

  if exists (
    select 1
    from pg_constraint
    where conname = 'items_credito_tier_check'
      and conrelid = 'public.items'::regclass
  ) then
    alter table public.items
      drop constraint items_credito_tier_check;
  end if;

  alter table public.items
    add constraint items_credito_tier_check
    check (credito_tier is null or credito_tier between 0 and 6);

  if not exists (
    select 1
    from pg_constraint
    where conname = 'items_espacos_check'
      and conrelid = 'public.items'::regclass
  ) then
    alter table public.items
      add constraint items_espacos_check
      check (espacos >= 0);
  end if;
end $$;

create or replace function public.sync_item_name_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.nome := nullif(trim(coalesce(new.nome, new.name)), '');
  new.name := new.nome;
  new.categoria := coalesce(new.categoria, 'geral');
  new.data := coalesce(new.data, '{}'::jsonb);
  return new;
end;
$$;

drop trigger if exists items_sync_name_fields on public.items;
create trigger items_sync_name_fields
before insert or update on public.items
for each row execute function public.sync_item_name_fields();

drop index if exists public.items_user_id_idx;
create index if not exists items_user_id_idx on public.items(user_id);
create index if not exists items_categoria_idx on public.items(categoria);
create index if not exists items_categoria_valor_idx on public.items(categoria_valor);
create index if not exists items_oficial_idx on public.items(oficial);
create unique index if not exists items_catalog_unique_idx
on public.items (
  coalesce(user_id, '00000000-0000-0000-0000-000000000000'::uuid),
  lower(nome),
  categoria,
  coalesce(subcategoria, ''),
  fonte
);

drop policy if exists "items_owner_all" on public.items;
drop policy if exists "items_select_catalog" on public.items;
drop policy if exists "items_insert_owner" on public.items;
drop policy if exists "items_update_owner" on public.items;
drop policy if exists "items_delete_owner" on public.items;

create policy "items_select_catalog"
on public.items for select
using (user_id is null or auth.uid() = user_id);

create policy "items_insert_owner"
on public.items for insert
with check (auth.uid() = user_id);

create policy "items_update_owner"
on public.items for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "items_delete_owner"
on public.items for delete
using (auth.uid() = user_id);

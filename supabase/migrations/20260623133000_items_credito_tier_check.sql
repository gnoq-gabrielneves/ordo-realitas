-- Alinha o constraint legado de credito_tier com categoria_valor.
-- O catalogo oficial usa valor 0 para itens de categoria 0.

alter table public.items
  drop constraint if exists items_credito_tier_check;

alter table public.items
  add constraint items_credito_tier_check
  check (credito_tier is null or credito_tier between 0 and 6);

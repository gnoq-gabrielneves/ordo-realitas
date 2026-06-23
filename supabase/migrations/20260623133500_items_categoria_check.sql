-- Alinha o constraint legado de categoria com o catalogo oficial.
-- Municoes sao itens de catalogo de primeira classe.

alter table public.items
  drop constraint if exists items_categoria_check;

alter table public.items
  add constraint items_categoria_check
  check (categoria in ('arma', 'protecao', 'geral', 'municao', 'modificacao'));

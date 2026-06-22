alter table public.agent_sheets
  alter column agi set default 1,
  alter column forca set default 1,
  alter column intelecto set default 1,
  alter column presenca set default 1,
  alter column vigor set default 1,
  alter column limite_credito set default 1;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'agent_sheets_tipo_check') then
    alter table public.agent_sheets
      add constraint agent_sheets_tipo_check
      check (tipo in ('padrao', 'hexatombe'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'agent_sheets_classe_check') then
    alter table public.agent_sheets
      add constraint agent_sheets_classe_check
      check (classe is null or classe in ('Combatente', 'Especialista', 'Ocultista', 'Sobrevivente'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'agent_sheets_nex_range_check') then
    alter table public.agent_sheets
      add constraint agent_sheets_nex_range_check
      check (nex between 1 and 99);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'agent_sheets_attributes_range_check') then
    alter table public.agent_sheets
      add constraint agent_sheets_attributes_range_check
      check (
        agi between 0 and 10
        and forca between 0 and 10
        and intelecto between 0 and 10
        and presenca between 0 and 10
        and vigor between 0 and 10
      );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'agent_sheets_resources_non_negative_check') then
    alter table public.agent_sheets
      add constraint agent_sheets_resources_non_negative_check
      check (
        pv_max >= 0 and pv_atual >= 0
        and pe_max >= 0 and pe_atual >= 0
        and san_max >= 0 and san_atual >= 0
        and pd_max >= 0 and pd_atual >= 0
        and pe_por_rodada >= 1
        and defesa_bonus >= 0
        and defesa_equip >= 0
        and limite_credito between 0 and 4
        and carga_max >= 0
        and pontos_prestigio >= 0
        and desertor_acumulo >= 0
      );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'agent_sheets_resources_current_check') then
    alter table public.agent_sheets
      add constraint agent_sheets_resources_current_check
      check (
        pv_atual <= pv_max
        and pe_atual <= pe_max
        and san_atual <= san_max
        and pd_atual <= pd_max
      );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'agent_sheets_json_shape_check') then
    alter table public.agent_sheets
      add constraint agent_sheets_json_shape_check
      check (
        jsonb_typeof(estigmas) = 'array'
        and (forma_suprema is null or jsonb_typeof(forma_suprema) = 'object')
        and jsonb_typeof(pericias) = 'object'
        and jsonb_typeof(ataques) = 'array'
        and jsonb_typeof(habilidades) = 'array'
        and jsonb_typeof(rituais) = 'array'
        and jsonb_typeof(inventario) = 'array'
      );
  end if;
end $$;

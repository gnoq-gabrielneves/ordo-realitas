# Supabase

Este documento mapeia a dependencia atual do app no Supabase. Ele ainda nao substitui migrations: o proximo passo e transformar este mapa em SQL versionado.

## Variaveis

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Auth

O app usa Supabase Auth para login por email/senha.

Usuarios tambem precisam de um registro em `profiles`.

## Papeis

Papeis atuais:

- `mestre`: acesso total.
- `jogador`: acesso a agentes/fichas.
- `tv`: acesso a apresentacao para TV/tela de exibicao.

As regras estao em `src/shared/constants/roles.ts`.

## Tabelas esperadas

### `profiles`

Usada para nome, avatar e papel.

Campos usados:

- `id`
- `name`
- `avatar_url`
- `role`

### `campaigns`

Campanhas principais.

Campos usados:

- `id`
- `user_id`
- `name`
- `image_url`
- `synopsis`
- `historico`
- `vilao`
- `nex_inicial`
- `nex_final`
- `notas`
- `created_at`
- `updated_at`

### `missions`

Missoes de uma campanha.

Campos usados:

- `id`
- `campaign_id`
- `user_id`
- `titulo`
- `numero`
- `is_prologo`
- `resumo`
- `historico`
- `prologo`
- `epilogo`
- `nex_inicial`
- `nex_final`
- `handouts`
- `notas`
- `created_at`
- `updated_at`

### `scenes`

Cenas de uma missao.

Campos usados:

- `id`
- `mission_id`
- `user_id`
- `titulo`
- `parte`
- `tipo`
- `texto_descritivo`
- `notas_mestre`
- `ordem`
- `roteiro`
- `urgencia`
- `urgencia_rodadas`
- `lugar_id`
- `created_at`
- `updated_at`

### `agent_sheets`

Fichas de agentes.

Campos usados:

- identidade: `id`, `profile_id`, `user_id`, `nome`, `image_url`, `origem`, `classe`, `trilha`, `nex`
- atributos: `agi`, `forca`, `intelecto`, `presenca`, `vigor`
- recursos: `pv_max`, `pv_atual`, `pe_max`, `pe_atual`, `san_max`, `san_atual`, `usa_pd`, `pd_max`, `pd_atual`
- combate: `defesa_bonus`, `defesa_equip`, `protecao`, `resistencias`, `deslocamento`, `ataques`
- ficha: `pericias`, `habilidades`, `rituais`, `inventario`
- proficiencias: `prof_arma_simples`, `prof_arma_tatica`, `prof_arma_pesada`, `prof_prot_leve`, `prof_prot_pesada`
- lore: `aparencia`, `personalidade`, `historico`, `objetivo`
- Hexatombe: `tipo`, `codinome`, `estigmas`, `forma_ativa`, `forma_suprema`, `desertor`, `desertor_acumulo`
- outros: `pe_por_rodada`, `limite_credito`, `carga_max`, `pontos_prestigio`, `patente`, `created_at`, `updated_at`

### `npcs`

Sujeitos, pessoas e criaturas.

Campos usados incluem:

- `id`, `user_id`, `name`, `image_url`
- `tipo`, `tamanho`, `vd`, `origem`
- `descricao`, `backstory`
- `percepcao`, `iniciativa`, `percepcao_as_cegas`
- atributos, defesa, resistencias, PV, deslocamento
- `pp_dt`, `pp_dano`, `pp_imune_nex`
- `pericias`, `resistencias`, `vulnerabilidades`, `habilidades`, `acoes`, `rituais`
- `created_at`, `updated_at`

### `places`

Lugares e sublugares.

Campos usados:

- `id`, `user_id`, `parent_id`
- `name`, `tipo`, `localizacao`, `image_url`
- `descricao`, `atmosfera`, `backstory`
- `atividade_paranormal`, `origem`, `membrana`
- `pontos_de_interesse`
- `notas`, `segredos`
- `created_at`, `updated_at`

### `items`

Catalogo de itens.

Ver tipo em `src/shared/types/item.ts`.

### `rituals`

Catalogo de rituais.

Ver tipo em `src/shared/types/ritual.ts`.

### `presentation_state`

Estado da TV/tela de exibicao da apresentacao.

Campos usados:

- `id`
- `user_id`
- `mode`
- `placeholder_url`
- `single_image_url`
- `single_title`
- `carousel_images`
- `carousel_interval`
- `carousel_presets`
- `active_preset_id`
- `image_fit`
- `show_title`
- `updated_at`

## Storage buckets

Buckets usados pelo app:

- `agentes`
- `campanhas`
- `lugares`
- `sujeitos`
- `apresentacao`

Os uploads sao salvos em caminhos por usuario:

```text
<user_id>/<uuid>.<extensao>
```

## RLS e seguranca

Minimo esperado:

- usuario autenticado so le/escreve seus dados;
- mestre pode gerenciar usuarios;
- jogador so acessa ficha vinculada;
- TV/tela de exibicao so acessa estado de apresentacao permitido;
- service role nunca aparece no cliente.

## Proximo passo

Criar:

```text
supabase/
  migrations/
  seed.sql
  README.md
```

E gerar tipos do banco para reduzir divergencia entre TypeScript e schema real.

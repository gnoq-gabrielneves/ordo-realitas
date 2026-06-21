# Supabase

Arquivos versionados do banco do Ordo Realitas.

## Ordem

1. `migrations/20260621190000_core_schema.sql`
2. `migrations/20260621191000_combat_encounters.sql`
3. `seed.sql` opcional para dados locais

## Aplicacao

Use o Supabase CLI:

```bash
supabase db reset
```

ou aplique as migrations no projeto remoto conforme seu fluxo de deploy.

As policies atuais assumem dados por usuario (`auth.uid() = user_id`). A evolucao natural para produto e adicionar membros por campanha e permissoes finas.

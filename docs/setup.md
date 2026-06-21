# Setup Local

Este guia explica como rodar o app localmente.

## Requisitos

- Node.js 22 ou compativel com Next.js 16
- npm
- Projeto Supabase configurado

Este projeto usa `package-lock.json`. Use npm para evitar inconsistencias no `node_modules`.

## Instalacao

```bash
npm install
```

## Variaveis de ambiente

Crie `.env.local` na raiz:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Variaveis

- `NEXT_PUBLIC_SUPABASE_URL`: URL publica do projeto Supabase.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: chave publica usada pelo cliente.
- `SUPABASE_SERVICE_ROLE_KEY`: chave server-side usada para criar usuarios pela rota `/api/usuarios`.

Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no cliente.

## Rodando

```bash
npm run dev
```

Abra `http://localhost:3000`.

## Build

```bash
npm run build
```

Se o Turbopack falhar por alguma restricao local ou de sandbox, teste:

```bash
npx next build --webpack
```

## Problemas comuns

### `next: command not found`

O `node_modules` provavelmente esta incompleto ou foi instalado por outro gerenciador de pacotes.

```bash
npm install
```

### Mistura com pnpm/yarn/bun

Nao use outro gerenciador enquanto o projeto usa `package-lock.json`. Se arquivos como `pnpm-lock.yaml` aparecerem, remova-os antes de commitar.

### Login funciona mas dados nao aparecem

Verifique:

- variaveis `.env.local`;
- tabelas do Supabase;
- RLS/policies;
- registro em `profiles`;
- papel do usuario (`mestre`, `jogador`, `tv`).

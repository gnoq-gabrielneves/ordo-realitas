# Arquitetura

O app usa Next.js App Router com uma separacao por dominio em `src/features` e utilitarios compartilhados em `src/shared`.

## Estrutura principal

```text
src/
  app/              Rotas, layouts e API routes
  features/         Modulos de negocio
  shared/           Componentes, hooks, tipos, constantes e libs comuns
```

## Rotas

```text
src/app/(public)    Login
src/app/(private)   App autenticado
src/app/(tv)        Tela de apresentacao
src/app/api         Rotas server-side
```

## Features

Cada feature tende a seguir este formato:

```text
feature/
  components/       Componentes especificos do dominio
  hooks/            Hooks React Query
  pages/            Telas usadas pelas rotas
  services/         Acesso ao Supabase
```

Features atuais:

- `agentes`
- `apresentacao`
- `auth`
- `campanhas`
- `combate`
- `home`
- `itens`
- `lugares`
- `rituais`
- `sujeitos`
- `usuarios`

## Shared

```text
shared/components   UI reutilizavel e layout
shared/constants    Navegacao, papeis, pericias, regras auxiliares
shared/hooks        Hooks compartilhados
shared/lib          Supabase e utilitarios
shared/providers    Providers globais
shared/types        Tipos de dominio
shared/utils        Calculos e funcoes puras
```

## Dados

O app acessa Supabase pelo cliente em `services/` e usa TanStack Query nos hooks.

Padrao atual:

1. `services/*.ts` fazem queries/mutations no Supabase.
2. `hooks/*.ts` expoem `useQuery` e `useMutation`.
3. `pages/*.tsx` consomem hooks e renderizam telas.

## Autenticacao e autorizacao

- Autenticacao: Supabase Auth.
- Controle de rota: `src/proxy.ts`.
- Papeis: `mestre`, `jogador`, `tv`.
- Regras globais: `src/shared/constants/roles.ts`.

Limitacao atual: os papeis sao globais. A evolucao desejada e permissao por campanha.

## Tipagem

O projeto usa TypeScript strict. Tipos de dominio ficam em `src/shared/types`.

Boas praticas:

- Evitar `any`.
- Evitar `user!`; use `requireCurrentUser` ou `requireCurrentUserId`.
- Validar dados vindos de `localStorage` ou fontes externas.
- Preferir tipos de payload derivados dos tipos de dominio.

## UI e tema

O tema usa Tailwind 4 e tokens em `src/app/globals.css`.

Direcao visual:

- arquivo operacional;
- papel claro e bordas discretas;
- bordo/vermelho como cor de classificacao;
- componentes densos e legiveis;
- pouco ornamento, mais hierarquia.

## Proximas melhorias estruturais

- Migrations Supabase versionadas.
- Tipos gerados do banco.
- Policies documentadas e testadas.
- Testes para calculos de ficha e permissoes.
- Estados padronizados de loading/error/empty.

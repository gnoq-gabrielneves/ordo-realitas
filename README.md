# Ordo Realitas

Ordo Realitas e um painel para mestres de RPG gerenciarem campanhas, fichas, sujeitos, lugares, itens, rituais, combate e apresentacao de handouts em uma tela separada para jogadores.

O projeto nasceu como uma ferramenta de mesa para campanhas inspiradas em investigacao paranormal: um arquivo operacional, com permissoes por papel, fichas editaveis, combate rapido e modo TV/tela de exibicao.

## Estado do projeto

Este app ainda esta em fase privada/experimental. A base ja funciona para uso em mesa propria, mas ainda estamos organizando documentacao, schema do Supabase, permissoes por campanha e experiencia de onboarding antes de abrir para comunidade.

## Stack

- Next.js 16
- React 19
- TypeScript strict
- Tailwind CSS 4
- Supabase Auth, Database e Storage
- TanStack Query
- shadcn/radix-ui
- lucide-react

## Modulos

- **Painel**: visao geral do arquivo, contadores e atalhos.
- **Campanhas**: campanhas, missoes, cenas, roteiro e handouts.
- **Combate**: iniciativa, rodada, PV e detalhes de agentes/sujeitos.
- **Apresentacao**: controle de TV/tela de exibicao, handouts, carrossel e presets.
- **Agentes**: fichas de jogadores, combate, pericias, inventario, rituais e Hexatombe.
- **Sujeitos**: NPCs, criaturas, acoes, habilidades e estatisticas.
- **Lugares**: locais, atmosfera, segredos e pontos de interesse.
- **Itens**: catalogo de equipamentos.
- **Rituais**: catalogo paranormal.
- **Usuarios**: papeis, criacao de usuarios e vinculo de fichas.

## Comecando

Use npm neste projeto. Nao use pnpm/yarn/bun aqui enquanto o projeto mantiver `package-lock.json`.

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

Para variaveis de ambiente, veja [docs/setup.md](docs/setup.md).

## Scripts

```bash
npm run dev      # servidor local
npm run build    # build de producao
npm run start    # servidor de producao
npm run lint     # lint
```

## Documentacao

- [Visao do produto](docs/product-vision.md)
- [Setup local](docs/setup.md)
- [Arquitetura](docs/architecture.md)
- [Supabase](docs/supabase.md)
- [Guia de contribuicao](docs/contributing.md)
- [Roadmap](docs/roadmap.md)

## Notas de desenvolvimento

- O app usa rotas privadas, publicas e uma rota de TV/tela de exibicao via App Router.
- A autorizacao atual e baseada em papeis globais: `mestre`, `jogador`, `tv`.
- O proximo passo estrutural e migrar para permissoes por campanha.
- O schema do Supabase ainda precisa virar migrations versionadas.

## Licenca e conteudo

Este repositorio e uma ferramenta de organizacao de mesa. Ao abrir para comunidade, separar claramente codigo, marca, conteudo autoral da mesa e referencias de sistema sera essencial.

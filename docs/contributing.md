# Guia de Contribuicao

Este projeto ainda esta em fase privada, mas a estrutura ja deve seguir um padrao que facilite abrir para comunidade depois.

## Antes de contribuir

Leia:

- [Visao do produto](product-vision.md)
- [Arquitetura](architecture.md)
- [Setup local](setup.md)
- [Supabase](supabase.md)

## Gerenciador de pacotes

Use npm.

```bash
npm install
```

Nao adicione `pnpm-lock.yaml`, `yarn.lock` ou `bun.lockb` enquanto o projeto usar `package-lock.json`.

## Padroes de codigo

- TypeScript strict.
- Evite `any`.
- Evite non-null assertions como `user!`.
- Valide dados externos antes de usar.
- Prefira funcoes pequenas e componentes alinhados ao dominio.
- Siga a organizacao existente por feature.

## Estrutura de feature

```text
src/features/nome-da-feature/
  components/
  hooks/
  pages/
  services/
```

Nem toda feature precisa de todas as pastas. Crie apenas o que for necessario.

## UI

Direcao visual:

- interface densa e legivel;
- bordas discretas;
- vermelho/bordo para estados de classificacao, risco ou destaque;
- evitar efeitos decorativos sem funcao;
- manter a sensacao de arquivo operacional.

## Commits

Ainda nao ha convencao formal, mas prefira mensagens claras:

```text
feat: adiciona controle de condicoes no combate
fix: corrige permissao de jogador em fichas
docs: documenta setup do Supabase
refactor: tipa estado salvo do combate
```

## Checklist antes de abrir PR

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Se `npm run build` falhar por Turbopack em ambiente restrito, teste:

```bash
npx next build --webpack
```

## Areas sensiveis

- Autenticacao e autorizacao.
- Dados secretos do mestre.
- Service role do Supabase.
- Upload e remocao de imagens.
- Estado em tempo real da TV/tela de exibicao.

## Prioridades tecnicas

1. Migrations Supabase.
2. Policies por campanha.
3. Tipos gerados do banco.
4. Testes para calculos de ficha e permissoes.
5. Melhor UX para estados vazios, erros e loading.

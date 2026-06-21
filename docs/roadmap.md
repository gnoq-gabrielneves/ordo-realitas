# Roadmap

Este roadmap organiza o caminho de ferramenta pessoal para produto de comunidade.

## Fase 1 - Fundacao confiavel

- [x] README real do projeto.
- [x] Documentacao inicial.
- [x] Sidebar organizada por contexto.
- [x] Remover atalhos inseguros como `user!` nos fluxos principais.
- [ ] Migrations Supabase.
- [ ] Seed local.
- [ ] Tipos gerados do banco.
- [ ] CI com lint, typecheck e build.
- [ ] Padronizar estados de erro/loading/empty.

## Fase 2 - Mesa jogavel

- [ ] Dashboard de sessao do mestre.
- [ ] Preparador de sessao com checklist.
- [ ] Combate com condicoes.
- [ ] Historico de rodadas.
- [ ] Persistencia de combate no banco.
- [ ] Tela do jogador mais enxuta.
- [ ] Melhor fluxo de handouts por cena.
- [ ] TV/tela de exibicao com local atual, sujeito em destaque e mensagens curtas.

## Fase 3 - Produto para comunidade

- [ ] Convites por campanha.
- [ ] Permissoes por campanha: dono, co-mestre, jogador, espectador.
- [ ] Export/import de campanha.
- [ ] Templates de campanha, missao, cena e criatura.
- [ ] Biblioteca comunitaria.
- [ ] Onboarding inicial.
- [ ] Pagina publica do produto.
- [ ] Guia de deploy.

## Fase 4 - Automacoes do mestre

- [ ] Gerar checklist da proxima sessao.
- [ ] Detectar handouts sem imagem.
- [ ] Detectar cenas sem notas ou sem lugar vinculado.
- [ ] Montar resumo de sessao.
- [ ] Exportar relatorio pos-sessao.
- [ ] Busca global.
- [ ] Timeline da campanha.

## Divida tecnica conhecida

- Warnings de `<img>` que podem migrar para `next/image`.
- `periciasComValor` calculado e ainda nao usado em `AgentViewPage`.
- Schema do Supabase nao versionado.
- Policies e permissoes ainda globais demais.
- Testes automatizados ausentes.

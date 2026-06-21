"use client";

import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import {
  BookOpen,
  CheckCircle2,
  Database,
  FileText,
  GitBranch,
  MonitorPlay,
  ScrollText,
  Shield,
  Sparkles,
  Terminal,
} from "lucide-react";
import Link from "next/link";

type DocSection = {
  id: string;
  label: string;
  title: string;
  eyebrow: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
};

const SECTIONS: DocSection[] = [
  {
    id: "visao",
    label: "Visão",
    title: "O que é o Ordo Realitas",
    eyebrow: "Produto",
    description: "Um painel operacional para mestres conduzirem campanhas, fichas, combate e apresentação em uma só central.",
    icon: Sparkles,
    items: [
      "Preparar sessões com menos documento solto.",
      "Separar informação do mestre, jogadores e TV/tela de exibição.",
      "Transformar campanhas em um arquivo vivo e navegável.",
    ],
  },
  {
    id: "setup",
    label: "Setup",
    title: "Rodando localmente",
    eyebrow: "Ambiente",
    description: "O projeto usa npm, Next.js, React, TypeScript, Tailwind e Supabase.",
    icon: Terminal,
    items: [
      "Use npm install para restaurar dependências.",
      "Use npm run dev para abrir o servidor local.",
      "Configure .env.local com as chaves do Supabase.",
    ],
  },
  {
    id: "arquitetura",
    label: "Arquitetura",
    title: "Como o código está organizado",
    eyebrow: "Código",
    description: "A estrutura segue domínios em features e utilitários compartilhados em shared.",
    icon: GitBranch,
    items: [
      "src/app contém rotas, layouts e API routes.",
      "src/features agrupa páginas, hooks, services e componentes por domínio.",
      "src/shared concentra UI reutilizável, tipos, constantes e libs.",
    ],
  },
  {
    id: "supabase",
    label: "Supabase",
    title: "Banco, auth e storage",
    eyebrow: "Dados",
    description: "O app depende de Auth, tabelas de campanha/ficha e buckets de imagem.",
    icon: Database,
    items: [
      "Tabelas principais: profiles, campaigns, missions, scenes, agent_sheets, npcs, places, items, rituals e presentation_state.",
      "Buckets usados: agentes, campanhas, lugares, sujeitos e apresentacao.",
      "Próximo passo: migrations versionadas e policies por campanha.",
    ],
  },
  {
    id: "permissoes",
    label: "Permissões",
    title: "Papéis do sistema",
    eyebrow: "Segurança",
    description: "Hoje existem três papéis globais. A evolução natural é permissão por campanha.",
    icon: Shield,
    items: [
      "Mestre acessa tudo.",
      "Jogador acessa fichas e documentação.",
      "TV/tela de exibição acessa apresentação e documentação.",
    ],
  },
  {
    id: "roadmap",
    label: "Roadmap",
    title: "Para virar produto de comunidade",
    eyebrow: "Futuro",
    description: "O caminho é fortalecer fundação, mesa jogável, convites e automações de mestre.",
    icon: MonitorPlay,
    items: [
      "Criar migrations e seed do Supabase.",
      "Adicionar convites e permissões por campanha.",
      "Evoluir combate, TV/tela de exibição e preparação de sessão.",
    ],
  },
];

const DOC_FILES = [
  { label: "README", href: "/README.md", description: "Porta de entrada do projeto." },
  { label: "Visão do produto", href: "/docs/product-vision.md", description: "Promessa, público e princípios." },
  { label: "Setup local", href: "/docs/setup.md", description: "Ambiente, scripts e problemas comuns." },
  { label: "Arquitetura", href: "/docs/architecture.md", description: "Estrutura de rotas, features e shared." },
  { label: "Supabase", href: "/docs/supabase.md", description: "Mapa de tabelas, auth e storage." },
  { label: "Contribuição", href: "/docs/contributing.md", description: "Padrões para evoluir o projeto." },
  { label: "Roadmap", href: "/docs/roadmap.md", description: "Fases do produto." },
];

function CodeLine({ children }: { children: React.ReactNode }) {
  return (
    <code className="block border border-border bg-muted/40 px-3 py-2 font-mono text-xs text-foreground">
      {children}
    </code>
  );
}

export function DocumentacaoPage() {
  return (
    <>
      <AppHeader title="Documentação" />
      <main className="flex-1 overflow-y-auto">
        <div className="border-b border-border bg-card px-6 py-6">
          <div className="max-w-6xl">
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="outline" className="rounded-sm text-[10px] uppercase tracking-[0.18em]">
                Manual do Sistema
              </Badge>
              <Badge variant="secondary" className="rounded-sm text-[10px] uppercase tracking-[0.18em]">
                v0.1
              </Badge>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Arquivo de documentação da Ordo</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Um guia rápido para entender o produto, rodar o projeto, navegar pela arquitetura e saber
              o que falta para transformar essa ferramenta em algo pronto para comunidade.
            </p>
          </div>
        </div>

        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-1 border border-border bg-card p-2">
              {SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <section.icon className="h-3.5 w-3.5" />
                  {section.label}
                </a>
              ))}
            </div>
          </aside>

          <div className="max-w-6xl space-y-8">
            <section className="grid gap-3 md:grid-cols-3">
              <div className="border border-border bg-card p-4">
                <FileText className="mb-3 h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">Documentação viva</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  A página resume os arquivos em docs e ajuda a navegar pelo projeto.
                </p>
              </div>
              <div className="border border-border bg-card p-4">
                <BookOpen className="mb-3 h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">Produto primeiro</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  O foco é servir a mesa: mestre, jogadores, TV/tela de exibição e comunidade.
                </p>
              </div>
              <div className="border border-border bg-card p-4">
                <CheckCircle2 className="mb-3 h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">Próximos passos claros</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Roadmap, Supabase e contribuição já têm um ponto de partida.
                </p>
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
              {SECTIONS.map((section) => (
                <article
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-6 border border-border bg-card p-5"
                >
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-muted text-primary">
                      <section.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary/70">
                        {section.eyebrow}
                      </p>
                      <h2 className="text-base font-semibold">{section.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-2 text-sm text-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-[1fr_340px]">
              <div className="border border-border bg-card p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-primary" />
                  <h2 className="text-base font-semibold">Comandos úteis</h2>
                </div>
                <div className="space-y-2">
                  <CodeLine>npm install</CodeLine>
                  <CodeLine>npm run dev</CodeLine>
                  <CodeLine>npm run lint</CodeLine>
                  <CodeLine>npx tsc --noEmit</CodeLine>
                  <CodeLine>npx next build --webpack</CodeLine>
                </div>
              </div>

              <div className="border border-primary/30 bg-primary/5 p-5">
                <ScrollText className="mb-3 h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold">Regra de ouro</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Informação secreta do mestre nunca deve vazar para jogador ou TV/tela de exibição. Toda nova feature
                  precisa passar por essa pergunta antes de ir para produção.
                </p>
              </div>
            </section>

            <section className="border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Arquivos
                  </p>
                  <h2 className="text-base font-semibold">Documentos no repositório</h2>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/documentacao">Atual</Link>
                </Button>
              </div>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {DOC_FILES.map((doc) => (
                  <div key={doc.href} className={cn("border border-border bg-background p-3")}>
                    <p className="text-sm font-medium">{doc.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{doc.description}</p>
                    <p className="mt-3 font-mono text-[10px] text-muted-foreground">{doc.href}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

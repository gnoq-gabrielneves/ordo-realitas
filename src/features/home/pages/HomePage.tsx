"use client";

import { useAgentes } from "@/features/agentes/hooks/useAgentes";
import { useCampanhas } from "@/features/campanhas/hooks/useCampanhas";
import { useItens } from "@/features/itens/hooks/useItens";
import { useLugares } from "@/features/lugares/hooks/useLugares";
import { useRituais } from "@/features/rituais/hooks/useRituais";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { cn } from "@/shared/lib/utils";
import { AgentSheet } from "@/shared/types/agent";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileText,
  HeartPulse,
  MapPin,
  MonitorPlay,
  Package,
  Plus,
  ScrollText,
  Shield,
  Sparkles,
  Swords,
  Users,
} from "lucide-react";
import Link from "next/link";

function pct(atual: number, max: number) {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (atual / max) * 100));
}

function formatDate() {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date());
}

function PanelCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("border border-border bg-card", className)}>{children}</div>;
}

function SectionHeader({ title, icon, href, action }: {
  title: string;
  icon: React.ReactNode;
  href?: string;
  action?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {icon}
        {title}
      </p>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-[11px] text-primary hover:underline">
          {action ?? "Abrir"} <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function StatTile({ href, label, value, detail, icon }: {
  href: string;
  label: string;
  value: number;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href} className="group border border-border bg-card p-4 hover:border-primary/40">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center border border-border bg-muted text-muted-foreground group-hover:text-primary">
          {icon}
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
    </Link>
  );
}

function ResourceBar({ label, atual, max, color }: {
  label: string;
  atual: number;
  max: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px]">
        <span className="uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{atual}/{max}</span>
      </div>
      <div className="h-1.5 overflow-hidden bg-muted">
        <div className={cn("h-full", color)} style={{ width: `${pct(atual, max)}%` }} />
      </div>
    </div>
  );
}

function AgentReadiness({ agente }: { agente: AgentSheet }) {
  const lowPv = agente.pv_max > 0 && pct(agente.pv_atual, agente.pv_max) <= 35;
  const resourceLabel = agente.usa_pd ? "PD" : "PE";
  const resourceAtual = agente.usa_pd ? agente.pd_atual : agente.pe_atual;
  const resourceMax = agente.usa_pd ? agente.pd_max : agente.pe_max;

  return (
    <Link href={`/agentes/${agente.id}`} className="block border border-border bg-background p-3 hover:border-primary/40">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{agente.nome || "Agente sem nome"}</p>
          <p className="mt-0.5 truncate text-[10px] uppercase tracking-wider text-muted-foreground">
            {[agente.classe, agente.nex ? `NEX ${agente.nex}%` : null].filter(Boolean).join(" / ") || "Ficha incompleta"}
          </p>
        </div>
        <span className={cn(
          "shrink-0 border px-1.5 py-0.5 text-[10px] uppercase tracking-wider",
          lowPv ? "border-destructive/40 text-destructive" : "border-primary/30 text-primary"
        )}>
          {lowPv ? "Risco" : "Pronto"}
        </span>
      </div>
      <div className="space-y-2">
        <ResourceBar label="PV" atual={agente.pv_atual} max={agente.pv_max} color={lowPv ? "bg-destructive" : "bg-primary"} />
        <ResourceBar label={resourceLabel} atual={resourceAtual} max={resourceMax} color="bg-amber-500" />
      </div>
    </Link>
  );
}

function TaskRow({ done, label, href }: { done: boolean; label: string; href: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 border-b border-border/70 px-4 py-3 last:border-b-0 hover:bg-muted/40">
      {done ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
      ) : (
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
      )}
      <span className={cn("text-sm", done ? "text-muted-foreground line-through decoration-muted-foreground/40" : "text-foreground")}>
        {label}
      </span>
      <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
    </Link>
  );
}

export function HomePage() {
  const { data: agentes = [] } = useAgentes();
  const { data: campanhas = [] } = useCampanhas();
  const { data: lugares = [] } = useLugares();
  const { data: itens = [] } = useItens();
  const { data: rituais = [] } = useRituais();

  const campanhasRecentes = campanhas.slice(0, 3);
  const agentesVisiveis = agentes.slice(0, 4);
  const agentesEmRisco = agentes.filter((a) => a.pv_max > 0 && pct(a.pv_atual, a.pv_max) <= 35);
  const fichasIncompletas = agentes.filter((a) => !a.nome || !a.classe || a.pv_max <= 0);
  const bibliotecaTotal = lugares.length + itens.length + rituais.length;
  const hasSetup = campanhas.length > 0 && agentes.length > 0;

  return (
    <>
      <AppHeader title="Painel" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
            <PanelCard className="relative overflow-hidden p-6">
              <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-primary/10 to-transparent" />
              <div className="relative">
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary/75">
                  {formatDate()} / sistema interno
                </p>
                <h1 className="mt-2 text-2xl font-semibold">Central do mestre</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Prepare a proxima sessao, revise o estado do grupo e abra rapidamente as ferramentas que importam durante a mesa.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href="/campanhas" className="ordo-pressable inline-flex items-center gap-2 border border-primary bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                    <BookOpen className="h-4 w-4" />
                    Abrir campanhas
                  </Link>
                  <Link href="/combate" className="ordo-pressable inline-flex items-center gap-2 border border-border bg-card px-3 py-2 text-sm font-medium hover:border-primary/40">
                    <Swords className="h-4 w-4" />
                    Preparar combate
                  </Link>
                  <Link href="/apresentacao" className="ordo-pressable inline-flex items-center gap-2 border border-border bg-card px-3 py-2 text-sm font-medium hover:border-primary/40">
                    <MonitorPlay className="h-4 w-4" />
                    Tela de exibicao
                  </Link>
                </div>
              </div>
            </PanelCard>

            <PanelCard className="p-5">
              <SectionHeader title="Prontidao" icon={<ClipboardList className="h-3.5 w-3.5" />} />
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Arquivo inicial</span>
                    <span className="font-medium">{hasSetup ? "Operacional" : "Incompleto"}</span>
                  </div>
                  <div className="h-2 overflow-hidden bg-muted">
                    <div className="h-full bg-primary" style={{ width: hasSetup ? "100%" : "42%" }} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {hasSetup
                    ? "Voce ja tem campanha e grupo cadastrados. O proximo ganho e preparar cenas, handouts e combate."
                    : "Crie ao menos uma campanha e uma ficha para transformar o painel em uma mesa de comando real."}
                </p>
              </div>
            </PanelCard>
          </section>

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile href="/campanhas" label="Campanhas" value={campanhas.length} detail="Operacoes e arcos narrativos." icon={<BookOpen className="h-4 w-4" />} />
            <StatTile href="/agentes" label="Agentes" value={agentes.length} detail={`${agentesEmRisco.length} em risco / ${fichasIncompletas.length} incompletas.`} icon={<Shield className="h-4 w-4" />} />
            <StatTile href="/lugares" label="Biblioteca" value={bibliotecaTotal} detail="Lugares, itens e rituais catalogados." icon={<ScrollText className="h-4 w-4" />} />
            <StatTile href="/apresentacao" label="Exibicao" value={1} detail="Controle da tela dos jogadores." icon={<MonitorPlay className="h-4 w-4" />} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <section>
                <SectionHeader title="Operacoes em andamento" icon={<BookOpen className="h-3.5 w-3.5" />} href="/campanhas" action="Ver campanhas" />
                {campanhasRecentes.length > 0 ? (
                  <div className="grid gap-3 lg:grid-cols-3">
                    {campanhasRecentes.map((campanha) => (
                      <Link key={campanha.id} href={`/campanhas/${campanha.id}`} className="group border border-border bg-card p-4 hover:border-primary/40">
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            NEX {campanha.nex_inicial}% / {campanha.nex_final}%
                          </span>
                        </div>
                        <h2 className="truncate text-base font-semibold group-hover:text-primary">{campanha.name}</h2>
                        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                          {campanha.synopsis || campanha.notas || "Sem sinopse cadastrada. Adicione um resumo para orientar a preparacao da sessao."}
                        </p>
                        {campanha.vilao && (
                          <p className="mt-4 text-[10px] uppercase tracking-wider text-muted-foreground">
                            Antagonista: <span className="text-foreground">{campanha.vilao}</span>
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <PanelCard className="border-dashed p-8 text-center">
                    <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium">Nenhuma campanha criada.</p>
                    <Link href="/campanhas/nova" className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                      <Plus className="h-4 w-4" /> Criar primeira campanha
                    </Link>
                  </PanelCard>
                )}
              </section>

              <section>
                <SectionHeader title="Estado do grupo" icon={<HeartPulse className="h-3.5 w-3.5" />} href="/agentes" action="Ver fichas" />
                {agentesVisiveis.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {agentesVisiveis.map((agente) => <AgentReadiness key={agente.id} agente={agente} />)}
                  </div>
                ) : (
                  <PanelCard className="border-dashed p-8 text-center">
                    <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium">Nenhuma ficha no arquivo.</p>
                    <Link href="/agentes" className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                      <Plus className="h-4 w-4" /> Criar ficha
                    </Link>
                  </PanelCard>
                )}
              </section>
            </div>

            <aside className="space-y-6">
              <section>
                <SectionHeader title="Pendencias de preparo" icon={<AlertTriangle className="h-3.5 w-3.5" />} />
                <PanelCard>
                  <TaskRow done={campanhas.length > 0} label="Criar campanha ativa" href={campanhas.length > 0 ? "/campanhas" : "/campanhas/nova"} />
                  <TaskRow done={agentes.length > 0} label="Cadastrar fichas dos jogadores" href="/agentes" />
                  <TaskRow done={lugares.length > 0} label="Catalogar lugares importantes" href="/lugares" />
                  <TaskRow done={rituais.length > 0} label="Revisar biblioteca de rituais" href="/rituais" />
                  <TaskRow done={itens.length > 0} label="Separar equipamentos e pistas" href="/itens" />
                </PanelCard>
              </section>

              <section>
                <SectionHeader title="Atalhos de mesa" icon={<Sparkles className="h-3.5 w-3.5" />} />
                <div className="grid gap-2">
                  <Link href="/apresentacao" className="flex items-center gap-3 border border-primary/30 bg-primary/5 p-4 hover:border-primary/60">
                    <MonitorPlay className="h-5 w-5 text-primary" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">Controlar tela de exibicao</p>
                      <p className="text-xs text-muted-foreground">Handouts, imagens e carrossel para jogadores.</p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 text-primary" />
                  </Link>
                  <Link href="/documentacao" className="flex items-center gap-3 border border-border bg-card p-4 hover:border-primary/40">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">Manual do sistema</p>
                      <p className="text-xs text-muted-foreground">Setup, arquitetura e roadmap.</p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                  </Link>
                </div>
              </section>

              <section>
                <SectionHeader title="Biblioteca" icon={<Package className="h-3.5 w-3.5" />} />
                <PanelCard className="divide-y divide-border">
                  <Link href="/lugares" className="flex items-center justify-between px-4 py-3 hover:bg-muted/40">
                    <span className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /> Lugares</span>
                    <span className="font-mono text-xs text-muted-foreground">{lugares.length}</span>
                  </Link>
                  <Link href="/rituais" className="flex items-center justify-between px-4 py-3 hover:bg-muted/40">
                    <span className="flex items-center gap-2 text-sm"><Sparkles className="h-4 w-4 text-muted-foreground" /> Rituais</span>
                    <span className="font-mono text-xs text-muted-foreground">{rituais.length}</span>
                  </Link>
                  <Link href="/itens" className="flex items-center justify-between px-4 py-3 hover:bg-muted/40">
                    <span className="flex items-center gap-2 text-sm"><Package className="h-4 w-4 text-muted-foreground" /> Itens</span>
                    <span className="font-mono text-xs text-muted-foreground">{itens.length}</span>
                  </Link>
                </PanelCard>
              </section>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
}

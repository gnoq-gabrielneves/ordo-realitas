"use client";

import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { useAgentes } from "@/features/agentes/hooks/useAgentes";
import { useCampanhas } from "@/features/campanhas/hooks/useCampanhas";
import { useLugares } from "@/features/lugares/hooks/useLugares";
import { useItens } from "@/features/itens/hooks/useItens";
import { useRituais } from "@/features/rituais/hooks/useRituais";
import { CampanhaCard } from "@/features/campanhas/components/CampanhaCard";
import { AgentSheet } from "@/shared/types/agent";
import { cn } from "@/shared/lib/utils";
import {
  BookOpen, MapPin, Package, Skull, Sparkles, UserRound, Users, MonitorPlay, ChevronRight,
} from "lucide-react";
import Link from "next/link";

function Counter({ href, icon, label, value }: {
  href: string; icon: React.ReactNode; label: string; value: number;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 border border-border bg-card px-4 py-3 hover:border-primary/40 transition-colors"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-muted text-muted-foreground group-hover:text-primary transition-colors">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-lg font-semibold leading-none tabular-nums">{value}</p>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{label}</p>
      </div>
    </Link>
  );
}

function MiniBar({ label, atual, max, color }: { label: string; atual: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (atual / max) * 100) : 0;
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[10px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{atual}/{max}</span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function AgenteCard({ a }: { a: AgentSheet }) {
  const isHexa = a.tipo === "hexatombe";
  return (
    <Link
      href={`/agentes/${a.id}`}
      className={cn(
        "group flex flex-col gap-2.5 border p-3 transition-colors",
        isHexa
          ? "border-red-500/30 bg-red-500/[0.03] hover:border-red-500/50"
          : "border-border bg-card hover:border-primary/40"
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className={cn(
          "h-9 w-9 shrink-0 overflow-hidden border flex items-center justify-center bg-muted",
          isHexa ? "border-red-500/40" : "border-border"
        )}>
          {a.image_url
            ? <img src={a.image_url} alt={a.nome ?? ""} className="h-full w-full object-cover" />
            : isHexa ? <Skull className="h-4 w-4 text-red-400/50" /> : <UserRound className="h-4 w-4 text-muted-foreground/40" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
            {a.nome || <span className="italic text-muted-foreground">Sem nome</span>}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">
            {[a.classe, a.nex ? `NEX ${a.nex}%` : null].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
        {isHexa && <Skull className="h-3.5 w-3.5 text-red-400 shrink-0" />}
      </div>
      <div className="space-y-1.5">
        <MiniBar label="PV" atual={a.pv_atual} max={a.pv_max} color="bg-red-500" />
        {a.usa_pd
          ? <MiniBar label="PD" atual={a.pd_atual} max={a.pd_max} color="bg-amber-500" />
          : <MiniBar label="PE" atual={a.pe_atual} max={a.pe_max} color="bg-blue-500" />}
      </div>
    </Link>
  );
}

function SectionTitle({ icon, children, href, hrefLabel }: {
  icon: React.ReactNode; children: React.ReactNode; href?: string; hrefLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        {icon}{children}
      </p>
      {href && (
        <Link href={href} className="flex items-center gap-0.5 text-[11px] text-primary/80 hover:text-primary transition-colors">
          {hrefLabel ?? "Ver tudo"} <ChevronRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

export function HomePage() {
  const { data: agentes = [] } = useAgentes();
  const { data: campanhas = [] } = useCampanhas();
  const { data: lugares = [] } = useLugares();
  const { data: itens = [] } = useItens();
  const { data: rituais = [] } = useRituais();

  const dateStr = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  }).format(new Date());

  return (
    <>
      <AppHeader title="Painel" />
      <main className="flex-1 overflow-y-auto p-6 space-y-8">

        {/* Cabeçalho — terminal */}
        <div className="border border-border bg-card p-5">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary/70">Ordo Realitas · Sistema Interno</p>
          <h1 className="text-xl font-semibold mt-1">Arquivo Central</h1>
          <p className="text-xs text-muted-foreground mt-1 capitalize">{dateStr}</p>
          <div className="flex items-center gap-1.5 mt-3 text-[10px] uppercase tracking-widest text-green-500">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Acesso autorizado
          </div>
        </div>

        {/* Contadores */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Counter href="/agentes" icon={<Users className="h-4 w-4" />} label="Agentes" value={agentes.length} />
          <Counter href="/campanhas" icon={<BookOpen className="h-4 w-4" />} label="Campanhas" value={campanhas.length} />
          <Counter href="/lugares" icon={<MapPin className="h-4 w-4" />} label="Lugares" value={lugares.length} />
          <Counter href="/rituais" icon={<Sparkles className="h-4 w-4" />} label="Rituais" value={rituais.length} />
          <Counter href="/itens" icon={<Package className="h-4 w-4" />} label="Itens" value={itens.length} />
        </div>

        {/* Visão do grupo */}
        {agentes.length > 0 && (
          <section>
            <SectionTitle icon={<Users className="h-3.5 w-3.5" />} href="/agentes">Visão do Grupo</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {agentes.map((a) => <AgenteCard key={a.id} a={a} />)}
            </div>
          </section>
        )}

        {/* Operações / Campanhas */}
        {campanhas.length > 0 && (
          <section>
            <SectionTitle icon={<BookOpen className="h-3.5 w-3.5" />} href="/campanhas">Operações em Andamento</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {campanhas.map((c) => <CampanhaCard key={c.id} campanha={c} />)}
            </div>
          </section>
        )}

        {/* Apresentação */}
        <section>
          <Link
            href="/apresentacao"
            className="group flex items-center gap-3 border border-border bg-card p-4 hover:border-primary/40 transition-colors"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-muted text-muted-foreground group-hover:text-primary transition-colors">
              <MonitorPlay className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium group-hover:text-primary transition-colors">Modo Apresentação</p>
              <p className="text-xs text-muted-foreground">Abra a tela dos jogadores (TV / projeção).</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        </section>

        {/* Vazio */}
        {agentes.length === 0 && campanhas.length === 0 && (
          <div className="border border-dashed border-border p-10 text-center">
            <Skull className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum registro ainda. Comece criando uma ficha ou uma campanha.</p>
          </div>
        )}
      </main>
    </>
  );
}

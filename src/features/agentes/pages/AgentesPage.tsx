"use client";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { NovaFichaDialog } from "@/features/agentes/components/NovaFichaDialog";
import { useAgentes, useCreateAgente, useDeleteAgente } from "@/features/agentes/hooks/useAgentes";
import { getEstigmas } from "@/shared/constants/hexatombe";
import { AgentSheet, AgentSheetPayload } from "@/shared/types/agent";
import { cn, formatCount } from "@/shared/lib/utils";
import {
  BookOpenCheck,
  Heart,
  Loader2,
  Pencil,
  Plus,
  Search,
  Shield,
  Skull,
  Sparkles,
  Trash2,
  UserRound,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useMemo, useState } from "react";

type AgentFilter = "todos" | "ordem" | "hexatombe" | "vinculados" | "sem-jogador";

const FILTERS: { key: AgentFilter; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "ordem", label: "Ordem" },
  { key: "hexatombe", label: "Hexatombe" },
  { key: "vinculados", label: "Vinculados" },
  { key: "sem-jogador", label: "Sem jogador" },
];

function AgentCard({ agent }: { agent: AgentSheet }) {
  const del = useDeleteAgente();
  const isHexa = agent.tipo === "hexatombe";
  const estigmas = getEstigmas(agent.estigmas);
  const portraitUrl = isHexa && agent.forma_ativa && agent.intent_image_url ? agent.intent_image_url : agent.image_url;
  const resourceLabel = agent.usa_pd ? "PD" : "PE";
  const resourceAtual = agent.usa_pd ? agent.pd_atual : agent.pe_atual;
  const resourceMax = agent.usa_pd ? agent.pd_max : agent.pe_max;
  const defesa = 10 + agent.agi + agent.defesa_bonus + agent.defesa_equip;

  return (
    <article className={cn(
      "group border bg-card transition-colors",
      isHexa ? "border-red-500/30 bg-red-500/[0.03] hover:bg-red-500/[0.06]" : "border-border hover:bg-muted/30",
    )}>
      <Link href={`/agentes/${agent.id}`} className="block p-4">
        <div className="flex items-start gap-4">
          <div className={cn(
            "relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border bg-muted",
            isHexa ? "border-red-500/40" : "border-border",
          )}>
            {portraitUrl ? (
              <Image src={portraitUrl} alt={agent.nome ?? ""} fill className="object-cover" unoptimized />
            ) : isHexa ? (
              <Skull className="h-6 w-6 text-red-400/50" />
            ) : (
              <UserRound className="h-6 w-6 text-muted-foreground/40" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold leading-tight">
                  {agent.nome || <span className="italic text-muted-foreground">Sem nome</span>}
                </p>
                {isHexa && agent.codinome && (
                  <p className="mt-1 truncate text-sm text-red-500">{agent.codinome}</p>
                )}
              </div>
              <div className="shrink-0 text-right text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {agent.classe === "Sobrevivente" ? "Est." : "NEX"}{" "}
                <span className="text-foreground">{agent.nex}{agent.classe === "Sobrevivente" ? "" : "%"}</span>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <AgentTag tone={isHexa ? "danger" : "default"}>{isHexa ? "Hexatombe" : "Ordem"}</AgentTag>
              {agent.usa_pd && <AgentTag tone="warning">PD</AgentTag>}
              {agent.classe && <AgentTag>{agent.classe}</AgentTag>}
              {agent.origem && <AgentTag>{agent.origem}</AgentTag>}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <MiniAgentMetric icon={<Heart className="h-3 w-3" />} label="PV" value={`${agent.pv_atual}/${agent.pv_max}`} />
              <MiniAgentMetric icon={agent.usa_pd ? <Sparkles className="h-3 w-3" /> : <Zap className="h-3 w-3" />} label={resourceLabel} value={`${resourceAtual}/${resourceMax}`} />
              <MiniAgentMetric icon={<Shield className="h-3 w-3" />} label="DEF" value={defesa} />
            </div>
          </div>
        </div>

        {(agent.trilha || estigmas.length > 0 || agent.habilidades.length > 0) && (
          <div className="mt-4 border-t border-border/60 pt-3 text-xs leading-relaxed text-muted-foreground">
            {agent.trilha && <span>Trilha: {agent.trilha}. </span>}
            {estigmas.length > 0 && (
              <span>
                Estigmas:{" "}
                {estigmas.map((estigma, index) => (
                  <span key={estigma.id} className={estigma.cor}>
                    {estigma.nome}{index < estigmas.length - 1 ? ", " : ""}
                  </span>
                ))}
                .{" "}
              </span>
            )}
            {agent.habilidades.length > 0 && <span>{formatCount(agent.habilidades.length, "habilidade cadastrada", "habilidades cadastradas")}.</span>}
          </div>
        )}
      </Link>

      <div className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
        {agent.profile_id ? (
          <div className="flex items-center gap-1.5 text-[10px] text-green-500">
            <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Vinculado a jogador
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
            Sem jogador
          </div>
        )}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
            <Link href={`/agentes/${agent.id}/editar`}>
              <Pencil className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <ConfirmDialog
            title="Excluir ficha"
            description={`Tem certeza que deseja excluir a ficha de "${agent.nome || "este agente"}"? Esta ação não pode ser desfeita.`}
            onConfirm={() => del.mutate(agent.id)}
            disabled={del.isPending}
          >
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </ConfirmDialog>
        </div>
      </div>
    </article>
  );
}

function MiniAgentMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return (
    <div className="border border-border bg-background/60 px-2 py-1.5">
      <p className="flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{icon}{label}</p>
      <p className="mt-0.5 text-xs font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function AgentTag({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "danger" | "warning" }) {
  return (
    <span className={cn(
      "border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em]",
      tone === "danger" && "border-red-500/30 bg-red-500/10 text-red-500",
      tone === "warning" && "border-amber-500/40 bg-amber-500/10 text-amber-500",
      tone === "default" && "border-border text-muted-foreground",
    )}>
      {children}
    </span>
  );
}

export function AgentesPage() {
  const { data: agentes = [], isLoading } = useAgentes();
  const create = useCreateAgente();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<AgentFilter>("todos");

  const stats = useMemo(() => {
    const ordem = agentes.filter((agent) => agent.tipo !== "hexatombe").length;
    const hexatombe = agentes.filter((agent) => agent.tipo === "hexatombe").length;
    const vinculados = agentes.filter((agent) => !!agent.profile_id).length;
    return { total: agentes.length, ordem, hexatombe, vinculados };
  }, [agentes]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return agentes.filter((agent) => {
      if (filter === "ordem" && agent.tipo === "hexatombe") return false;
      if (filter === "hexatombe" && agent.tipo !== "hexatombe") return false;
      if (filter === "vinculados" && !agent.profile_id) return false;
      if (filter === "sem-jogador" && agent.profile_id) return false;
      if (!q) return true;
      return [
        agent.nome,
        agent.codinome,
        agent.origem,
        agent.classe,
        agent.trilha,
        ...getEstigmas(agent.estigmas).map((estigma) => estigma.nome),
      ].some((value) => value?.toLowerCase().includes(q));
    });
  }, [agentes, filter, search]);

  const handleCreate = async (payload: Partial<AgentSheetPayload>) => {
    try {
      const sheet = await create.mutateAsync(payload);
      setDialogOpen(false);
      router.push(`/agentes/${sheet.id}`);
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? JSON.stringify(err);
      alert(`Erro ao criar ficha: ${msg}`);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="shrink-0 border-b border-border bg-background px-6 py-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="border border-border bg-muted/30 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Arquivo classificado
              </span>
              <span className="border border-primary/30 bg-primary/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                Criação assistida
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Fichas de Agentes</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Crie fichas comuns com regras automatizadas, separe personagens especiais de Hexatombe e encontre rapidamente o que importa durante a sessão.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setDialogOpen(true)} disabled={create.isPending}>
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Nova ficha da Ordem
            </Button>
            <Button variant="outline" asChild>
              <Link href="/agentes/hexatombe/nova">
                <Skull className="h-4 w-4 text-red-500" />
                Ficha Hexatombe
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <StatCard icon={<Users className="h-4 w-4" />} label="Total" value={stats.total} />
          <StatCard icon={<Shield className="h-4 w-4" />} label="Ordem" value={stats.ordem} />
          <StatCard icon={<Skull className="h-4 w-4" />} label="Hexatombe" value={stats.hexatombe} danger />
          <StatCard icon={<BookOpenCheck className="h-4 w-4" />} label="Vinculados" value={stats.vinculados} />
        </div>
      </header>

      <section className="shrink-0 border-b border-border bg-muted/15 px-6 py-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative max-w-xl flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, codinome, origem, classe ou estigma..."
              className="h-10 pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={cn(
                  "border px-3 py-2 text-xs font-medium transition-colors",
                  filter === item.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-56 animate-pulse border border-border bg-muted/30" />
            ))}
          </div>
        ) : agentes.length === 0 ? (
          <EmptyState onCreate={() => setDialogOpen(true)} />
        ) : filtered.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center border border-dashed border-border text-center">
            <Search className="mb-3 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm font-medium">Nenhuma ficha encontrada</p>
            <p className="mt-1 text-sm text-muted-foreground">Tente outro filtro ou termo de busca.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {formatCount(filtered.length, "ficha encontrada", "fichas encontradas")}
            </p>
            <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
              {filtered.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
            </div>
          </div>
        )}
      </div>

      <NovaFichaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreate={handleCreate}
        isPending={create.isPending}
      />
    </div>
  );
}

function StatCard({ icon, label, value, danger }: { icon: ReactNode; label: string; value: number; danger?: boolean }) {
  return (
    <div className="border border-border bg-card p-4">
      <p className={cn("flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground", danger && "text-red-500")}>
        {icon}
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="grid min-h-[26rem] place-items-center border border-dashed border-border">
      <div className="max-w-lg px-6 text-center">
        <Shield className="mx-auto mb-4 h-10 w-10 text-muted-foreground/30" />
        <h2 className="text-xl font-semibold">Nenhuma ficha criada ainda</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Comece por uma ficha da Ordem para jogadores novos, ou use o fluxo Hexatombe quando a campanha pedir regras de máscara, estigmas e sacrifício.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4" />
            Criar ficha da Ordem
          </Button>
          <Button variant="outline" asChild>
            <Link href="/agentes/hexatombe/nova">
              <Skull className="h-4 w-4 text-red-500" />
              Ficha Hexatombe
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

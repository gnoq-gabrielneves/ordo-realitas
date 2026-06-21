"use client";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useAgente, useDeleteAgente, useUpdateAgente } from "@/features/agentes/hooks/useAgentes";
import { PERICIAS } from "@/shared/constants/pericias";
import { DESERTOR_REGRAS, FORMA_SUPREMA, getEstigmas } from "@/shared/constants/hexatombe";
import { AgentSheet } from "@/shared/types/agent";
import { cn } from "@/shared/lib/utils";
import { useRituais } from "@/features/rituais/hooks/useRituais";
import { useItens } from "@/features/itens/hooks/useItens";
import { Item } from "@/shared/types/item";
import { RitualElemento } from "@/shared/types/ritual";
import { ArrowDown, ArrowUp, ChevronLeft, Gauge, Heart, Package, Pencil, Shield, Skull, Sparkles, Swords, Trash2, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const ELEMENTO_COLORS: Record<RitualElemento, string> = {
  conhecimento: "border-blue-500/40 text-blue-400",
  energia:      "border-yellow-500/40 text-yellow-400",
  morte:        "border-purple-500/40 text-purple-400",
  sangue:       "border-red-500/40 text-red-400",
  medo:         "border-orange-500/40 text-orange-400",
};

const ELEMENTO_LABELS: Record<RitualElemento, string> = {
  conhecimento: "Conhecimento", energia: "Energia", morte: "Morte", sangue: "Sangue", medo: "Medo",
};

const CATEGORIA_LABELS: Record<string, string> = { arma: "Arma", protecao: "Proteção", geral: "Geral" };
const SUBCATEGORIA_LABELS: Record<string, string> = {
  simples: "Simples", tatica: "Tática", pesada: "Pesada", leve: "Leve",
  municao: "Munição", explosivo: "Explosivo", operacional: "Operacional", paranormal: "Paranormal",
};

function ItemStats({ item }: { item: Item }) {
  if (item.categoria === "arma") {
    return (
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground mt-0.5">
        {item.dano     && <span><span className="text-foreground/70 font-medium">{item.dano}</span> dano</span>}
        {item.critico  && <span>Crit <span className="text-foreground/70 font-medium">{item.critico}</span></span>}
        {item.alcance  && item.alcance !== "—" && <span>Alc. <span className="text-foreground/70 font-medium">{item.alcance}</span></span>}
        {item.teste    && <span className="text-muted-foreground/60">{item.teste}</span>}
        {item.especial && item.especial !== "—" && <span className="text-muted-foreground/60 italic">{item.especial}</span>}
      </div>
    );
  }
  if (item.categoria === "protecao") {
    return (
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground mt-0.5">
        {item.protecao_valor && <span>Defesa <span className="text-foreground/70 font-medium">{item.protecao_valor}</span></span>}
        {item.penalidade     && <span className="text-muted-foreground/60 italic">{item.penalidade}</span>}
      </div>
    );
  }
  if (item.descricao) {
    return <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{item.descricao}</p>;
  }
  return null;
}

function Block({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
        {icon}{title}
      </p>
      <div className="border border-border bg-card rounded-md p-4">{children}</div>
    </div>
  );
}

const ACCENTS = {
  blue: "border-blue-500/30 text-blue-400",
  red: "border-red-500/30 text-red-400",
  amber: "border-amber-500/30 text-amber-400",
  cyan: "border-cyan-500/30 text-cyan-400",
  purple: "border-purple-500/30 text-purple-400",
};

const QUICK_STEPS = [-5, -1, 1, 5];

function KeyStat({ icon, label, value, hint, accent, bar, desc, onAdjust }: {
  icon: React.ReactNode; label: string; value: string | number; hint?: string;
  accent: keyof typeof ACCENTS; bar?: { atual: number; max: number; color: string };
  desc?: string; onAdjust?: (delta: number) => void;
}) {
  const pct = bar && bar.max > 0 ? Math.min(100, (bar.atual / bar.max) * 100) : 0;
  return (
    <div className={cn("rounded-md border bg-card p-4", ACCENTS[accent])}>
      <div className="flex items-center gap-3">
        <div className="shrink-0">{icon}</div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold leading-none text-foreground tabular-nums">{value}</p>
            {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
          </div>
        </div>
      </div>
      {bar && (
        <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all", bar.color)} style={{ width: `${pct}%` }} />
        </div>
      )}
      {onAdjust && (
        <div className="mt-2.5 grid grid-cols-4 gap-1">
          {QUICK_STEPS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onAdjust(d)}
              className={cn(
                "h-7 rounded text-xs font-medium tabular-nums border transition-colors",
                d < 0
                  ? "border-border text-muted-foreground hover:border-destructive/50 hover:text-destructive hover:bg-destructive/5"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-primary/5"
              )}
            >
              {d > 0 ? `+${d}` : d}
            </button>
          ))}
        </div>
      )}
      {desc && <p className="mt-2.5 text-[10px] text-muted-foreground leading-snug">{desc}</p>}
    </div>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-muted/20 px-3 py-2">
      <p className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-muted-foreground">{icon}{label}</p>
      <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
    </div>
  );
}

function AttrBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center justify-center border border-border rounded-md bg-muted/20 py-2.5 w-16">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold leading-none mt-1">{value >= 0 ? `+${value}` : value}</p>
    </div>
  );
}

interface AgentViewPageProps {
  agenteId: string;
}

export function AgentViewPage({ agenteId }: AgentViewPageProps) {
  const router = useRouter();
  const { data: agente, isLoading } = useAgente(agenteId);
  const { data: allRituais = [] } = useRituais();
  const { data: allItens = [] } = useItens();
  const del = useDeleteAgente();
  const update = useUpdateAgente();
  const [expandedRitualId, setExpandedRitualId] = useState<string | null>(null);
  const [desperto, setDesperto] = useState(false);
  // Ajustes otimistas de recursos (PV/PE/SAN/PD) para resposta instantânea.
  const optScope = `${agenteId}:${desperto ? "suprema" : "base"}`;
  const [optState, setOptState] = useState<{ scope: string; values: Record<string, number> }>({
    scope: optScope,
    values: {},
  });
  const opt = optState.scope === optScope ? optState.values : {};

  if (isLoading) return (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm text-muted-foreground">Carregando ficha...</p>
    </div>
  );

  if (!agente) return (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm text-destructive">Ficha não encontrada.</p>
    </div>
  );

  const isHexa = agente.tipo === "hexatombe";
  const fs = agente.forma_suprema;
  const ativo = isHexa && desperto && !!fs;
  // Forma desperta sobrepõe os campos de combate; identidade vem sempre da base.
  const view: AgentSheet = ativo ? { ...agente, ...fs } : agente;
  const estigmas = getEstigmas(agente.estigmas);
  const acumulo = agente.desertor ? (agente.desertor_acumulo ?? 0) : 0;

  const defesa = 10 + view.agi + view.defesa_bonus + view.defesa_equip;

  // Valor exibido (com override otimista) e ajuste rápido de recursos.
  const shownAtual = (key: "pv" | "pe" | "san" | "pd") =>
    opt[`${key}_atual`] ?? (view[`${key}_atual` as keyof AgentSheet] as number);

  const RES_LABEL: Record<"pv" | "pe" | "san" | "pd", string> = { pv: "PV", pe: "PE", san: "SAN", pd: "PD" };

  // Aplica a variação no recurso (otimista + persiste). Retorna {cur, next} ou null se não mudou.
  const applyDelta = (key: "pv" | "pe" | "san" | "pd", delta: number) => {
    const af = `${key}_atual`;
    const max = view[`${key}_max` as keyof AgentSheet] as number;
    const cur = opt[af] ?? (view[af as keyof AgentSheet] as number);
    const upper = max > 0 ? max : cur + delta;
    const next = Math.max(0, Math.min(upper, cur + delta));
    if (next === cur) return null;
    setOptState((current) => ({
      scope: optScope,
      values: { ...(current.scope === optScope ? current.values : {}), [af]: next },
    }));
    update.mutate({
      id: agente.id,
      payload: ativo && fs ? { forma_suprema: { ...fs, [af]: next } } : { [af]: next },
    });
    return { cur, next };
  };

  const adjust = (key: "pv" | "pe" | "san" | "pd", delta: number) => {
    const r = applyDelta(key, delta);
    if (!r) return;
    const ganho = delta > 0;
    toast(`${RES_LABEL[key]}  ${r.cur} → ${r.next}`, {
      description: ganho ? `Recuperou +${delta} ${RES_LABEL[key]}` : `Perdeu ${Math.abs(delta)} ${RES_LABEL[key]}`,
      icon: ganho
        ? <ArrowUp className="size-4 text-emerald-500" />
        : <ArrowDown className="size-4 text-red-500" />,
    });
  };

  // Usar habilidade/ritual: desconta o custo do recurso (PD se a ficha usa PD, senão PE).
  const recursoLabel = view.usa_pd ? "PD" : "PE";
  const usar = (custo?: number | null, nome?: string) => {
    if (!custo) return;
    const key = view.usa_pd ? "pd" : "pe";
    const r = applyDelta(key, -custo);
    if (!r) {
      toast.error(`Sem ${recursoLabel} suficiente`, {
        description: `${nome ?? "Habilidade"} custa ${custo} ${recursoLabel}`,
      });
      return;
    }
    toast.success(nome ?? "Usado", {
      description: `−${custo} ${recursoLabel}  ·  ${recursoLabel} ${r.cur} → ${r.next}`,
      icon: <Zap className="size-4 text-primary" />,
    });
  };

  const habilidades = view.habilidades ?? [];
  const rituais = view.rituais ?? [];
  const inventario = agente.inventario ?? [];
  const ataques = view.ataques ?? [];
  const atributos: Record<string, number> = {
    AGI: view.agi, FOR: view.forca, INT: view.intelecto, PRE: view.presenca, VIG: view.vigor,
  };

  const GRAU_BONUS = [0, 5, 10, 15];
  const getGrau = (entry: typeof agente.pericias[string]) => {
    if (!entry) return 0;
    if (entry.grau !== undefined) return entry.grau;
    return entry.treinado ? 1 : 0;
  };

  const periciasComValor = PERICIAS.map((p) => {
    const entry = agente.pericias[p.key];
    const grau = getGrau(entry);
    const base = atributos[p.atributo] ?? 0;
    const bonus = GRAU_BONUS[grau] ?? 0;
    const outros = entry?.outros ?? 0;
    const total = base + bonus + outros;
    return { ...p, grau, total };
  }).filter((p) => p.grau > 0 || p.total !== atributos[p.atributo]);

  const profArmas = [
    agente.prof_arma_simples && "Simples",
    agente.prof_arma_tatica && "Táticas",
    agente.prof_arma_pesada && "Pesadas",
  ].filter(Boolean).join(", ");

  const profProtecoes = [
    agente.prof_prot_leve && "Leves",
    agente.prof_prot_pesada && "Pesadas",
  ].filter(Boolean).join(", ");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className={cn(
        "flex h-14 shrink-0 items-center gap-3 border-b px-6",
        ativo ? "border-red-500/40 bg-red-500/[0.05]" : "border-border"
      )}>
        <Link href="/agentes" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Agentes
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <h1 className="text-sm font-semibold flex-1 truncate flex items-center gap-2">
          {isHexa && <Skull className="h-3.5 w-3.5 text-red-400 shrink-0" />}
          {ativo && agente.codinome ? agente.codinome : agente.nome || "Sem nome"}
        </h1>
        {isHexa && fs && (
          <button
            type="button"
            onClick={() => setDesperto((d) => !d)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
              ativo
                ? "border-red-500 bg-red-500 text-white hover:bg-red-600"
                : "border-red-500/40 text-red-400 hover:bg-red-500/10"
            )}
          >
            <Skull className="h-3.5 w-3.5" />
            {ativo ? "Adormecer" : "Despertar Intenção"}
          </button>
        )}
        <Button variant="outline" size="sm" asChild>
          <Link href={`/agentes/${agenteId}/editar`}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Editar
          </Link>
        </Button>
        <ConfirmDialog
          title="Excluir ficha"
          description={`Tem certeza que deseja excluir a ficha de "${agente.nome || "este agente"}"?`}
          onConfirm={() => del.mutate(agenteId, { onSuccess: () => router.push("/agentes") })}
          disabled={del.isPending}
        >
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:border-destructive/40">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </ConfirmDialog>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 space-y-6">

          {/* Cabeçalho da ficha */}
          <div className="flex items-start gap-5">
            {agente.image_url && (
              <div className="relative h-24 w-24 shrink-0 border border-border overflow-hidden">
                <Image src={agente.image_url} alt={agente.nome ?? ""} fill className="object-cover" />
              </div>
            )}
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-semibold">
                  {ativo && agente.codinome ? agente.codinome : agente.nome || <span className="text-muted-foreground italic">Sem nome</span>}
                </h2>
                {estigmas.map((e) => (
                  <span key={e.id} className={cn("text-[11px] font-medium px-2 py-0.5 rounded border", e.cor, e.corBorda, e.corBg)}>
                    {e.nome}
                  </span>
                ))}
              </div>
              {isHexa && agente.codinome && (
                <p className="text-sm text-muted-foreground">{ativo ? agente.nome : `Máscara: ${agente.codinome}`}</p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                {agente.classe && <Badge variant="secondary">{agente.classe}</Badge>}
                {agente.origem && <span className="text-sm text-muted-foreground">{agente.origem}</span>}
                {agente.trilha && <span className="text-sm text-muted-foreground">· {agente.trilha}</span>}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <span>NEX <strong className="text-foreground">{agente.nex}%</strong></span>
                <span>Desl. <strong className="text-foreground">{view.deslocamento}</strong></span>
                <span>PE/Rodada <strong className="text-foreground">{agente.pe_por_rodada}</strong></span>
                {agente.patente && <span>Patente <strong className="text-foreground">{agente.patente}</strong></span>}
                {agente.pontos_prestigio > 0 && <span>Prestígio <strong className="text-foreground">{agente.pontos_prestigio}</strong></span>}
              </div>
            </div>
          </div>

          {/* Banner — Intenção Assassina ativa */}
          {ativo && (
            <div className="rounded-md border border-red-500/40 bg-red-500/[0.06] p-4 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Skull className="h-4 w-4 text-red-400" />
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">Intenção Assassina Desperta</p>
                {estigmas.map((e) => (
                  <span key={e.id} className={cn("text-[10px] px-1.5 py-0.5 rounded border", e.cor, e.corBorda)}>{e.nome}</span>
                ))}
              </div>
              {estigmas.length > 0 && (
                <div className="space-y-0.5">
                  {estigmas.map((e) => (
                    <p key={e.id} className={cn("text-[11px] italic", e.cor)}>“{e.clamor}”</p>
                  ))}
                </div>
              )}
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
                {FORMA_SUPREMA.passivos.map((p, i) => (
                  <li key={i} className="text-[11px] text-muted-foreground flex gap-1.5">
                    <span className="text-red-400 shrink-0">›</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Aviso — Desertor */}
          {agente.desertor && (
            <div className="rounded-md border border-destructive/40 bg-destructive/[0.06] p-3 space-y-1">
              <p className="text-xs font-semibold text-destructive uppercase tracking-wider">Desertor do Hexatombe</p>
              <p className="text-[11px] text-muted-foreground">
                PV máximos reduzidos pela metade · {DESERTOR_REGRAS.fortitude}
                {acumulo > 0 && <> · acúmulo atual: <strong className="text-destructive">−{acumulo}d10 PV máx e −{acumulo} em testes</strong></>}
              </p>
            </div>
          )}

          <Tabs defaultValue="ficha">
            <TabsList className="h-10 bg-transparent p-0 gap-0 border-b border-border w-full justify-start rounded-none">
              {[
                { id: "ficha",       label: "Ficha" },
                { id: "pericias",    label: "Perícias" },
                { id: "combate",     label: "Combate" },
                { id: "habilidades", label: "Habilidades" },
                { id: "rituais",     label: "Rituais" },
                { id: "inventario",  label: "Inventário" },
                { id: "descricao",   label: "Descrição" },
              ].map((t) => (
                <TabsTrigger key={t.id} value={t.id}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-10 px-4 text-sm">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* FICHA */}
            <TabsContent value="ficha" className="mt-6 space-y-6">
              {/* Destaque: Defesa + recursos (com ajuste rápido) */}
              <div className={cn("grid gap-4", view.usa_pd ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 lg:grid-cols-4")}>
                <KeyStat
                  icon={<Shield className="h-5 w-5" />} label="Defesa" value={defesa} accent="blue"
                  desc="Dificuldade para ser acertado · 10 + AGI + bônus + equipamento"
                />
                <KeyStat
                  icon={<Heart className="h-5 w-5" />}
                  label="PV — Pontos de Vida"
                  value={`${shownAtual("pv")} / ${view.pv_max}`}
                  accent="red"
                  bar={{ atual: shownAtual("pv"), max: view.pv_max, color: "bg-red-500" }}
                  onAdjust={(d) => adjust("pv", d)}
                />
                {view.usa_pd ? (
                  <KeyStat
                    icon={<Sparkles className="h-5 w-5" />}
                    label="PD — Determinação"
                    value={`${shownAtual("pd")} / ${view.pd_max}`}
                    accent="amber"
                    bar={{ atual: shownAtual("pd"), max: view.pd_max, color: "bg-amber-500" }}
                    onAdjust={(d) => adjust("pd", d)}
                  />
                ) : (
                  <>
                    <KeyStat
                      icon={<Zap className="h-5 w-5" />}
                      label="PE — Esforço"
                      value={`${shownAtual("pe")} / ${view.pe_max}`}
                      accent="cyan"
                      bar={{ atual: shownAtual("pe"), max: view.pe_max, color: "bg-cyan-500" }}
                      onAdjust={(d) => adjust("pe", d)}
                    />
                    <KeyStat
                      icon={<Sparkles className="h-5 w-5" />}
                      label="SAN — Sanidade"
                      value={`${shownAtual("san")} / ${view.san_max}`}
                      accent="purple"
                      bar={{ atual: shownAtual("san"), max: view.san_max, color: "bg-purple-500" }}
                      onAdjust={(d) => adjust("san", d)}
                    />
                  </>
                )}
              </div>

              {/* Mini-stats */}
              <Block title="Combate & Movimento" icon={<Swords className="h-3.5 w-3.5" />}>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  <MiniStat label="Deslocamento" value={view.deslocamento} icon={<Gauge className="h-3 w-3" />} />
                  <MiniStat label="PE / Rodada" value={agente.pe_por_rodada} />
                  {agente.protecao && <MiniStat label="Proteção" value={agente.protecao} />}
                  {agente.resistencias && <MiniStat label="Resistências" value={agente.resistencias} />}
                </div>
              </Block>

              <Block title="Atributos" icon={<Zap className="h-3.5 w-3.5" />}>
                <div className="grid grid-cols-5 gap-2 sm:flex sm:gap-3">
                  <AttrBox label="AGI" value={agente.agi} />
                  <AttrBox label="FOR" value={agente.forca} />
                  <AttrBox label="INT" value={agente.intelecto} />
                  <AttrBox label="PRE" value={agente.presenca} />
                  <AttrBox label="VIG" value={agente.vigor} />
                </div>
              </Block>
            </TabsContent>

            {/* PERÍCIAS */}
            <TabsContent value="pericias" className="mt-6">
              <Block title="Perícias com modificadores" icon={<Sparkles className="h-3.5 w-3.5" />}>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
                  {PERICIAS.map((p) => {
                    const entry = agente.pericias[p.key];
                    const grau = getGrau(entry);
                    const base = atributos[p.atributo] ?? 0;
                    const total = base + (GRAU_BONUS[grau] ?? 0) + (entry?.outros ?? 0);
                    const GRAU_LABELS = ["", "T", "V", "E"];
                    const GRAU_STYLE = [
                      "",
                      "text-primary border-primary/50 bg-primary/10",
                      "text-yellow-400 border-yellow-500/50 bg-yellow-500/10",
                      "text-purple-400 border-purple-500/50 bg-purple-500/10",
                    ];
                    return (
                      <div key={p.key} className="flex items-center justify-between py-1 border-b border-border/30">
                        <div className="flex items-center gap-1.5">
                          {grau > 0 && (
                            <span className={`text-[9px] font-bold border rounded px-1 shrink-0 ${GRAU_STYLE[grau]}`}>
                              {GRAU_LABELS[grau]}
                            </span>
                          )}
                          <span className={`text-sm ${grau > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                            {p.nome}
                          </span>
                          <span className="text-[10px] text-muted-foreground/60">{p.atributo}</span>
                        </div>
                        <span className={`text-sm font-mono font-semibold ${total > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                          {total >= 0 ? `+${total}` : total}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Block>
            </TabsContent>

            {/* COMBATE */}
            <TabsContent value="combate" className="mt-6 space-y-5">
              {(profArmas || profProtecoes) && (
                <Block title="Proficiências" icon={<Shield className="h-3.5 w-3.5" />}>
                  <div className="flex gap-6 text-sm flex-wrap">
                    {profArmas && <span><span className="text-muted-foreground text-xs mr-1.5">Armas</span>{profArmas}</span>}
                    {profProtecoes && <span><span className="text-muted-foreground text-xs mr-1.5">Proteções</span>{profProtecoes}</span>}
                  </div>
                </Block>
              )}

              {ataques.length > 0 && (
                <Block title="Ataques" icon={<Swords className="h-3.5 w-3.5" />}>
                  <div className="space-y-3">
                    {ataques.map((a, i) => (
                      <div key={i} className="border-l-2 border-primary/30 pl-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold">{a.nome}</span>
                          <span className="text-[10px] text-muted-foreground">Teste {a.teste}</span>
                        </div>
                        <div className="flex gap-4 mt-0.5 text-xs text-muted-foreground flex-wrap">
                          {a.dano && <span>Dano <strong className="text-foreground">{a.dano}</strong></span>}
                          {a.critico && <span>Crítico <strong className="text-foreground">{a.critico}</strong></span>}
                          {a.alcance && <span>Alcance <strong className="text-foreground">{a.alcance}</strong></span>}
                          {a.especial && <span>{a.especial}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Block>
              )}
            </TabsContent>

            {/* HABILIDADES */}
            <TabsContent value="habilidades" className="mt-6">
              {habilidades.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma habilidade cadastrada.</p>
              ) : (
                <Block title="Habilidades" icon={<Zap className="h-3.5 w-3.5" />}>
                  <div className="space-y-4">
                    {habilidades.map((h, i) => (
                      <div key={i}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-semibold uppercase tracking-wider text-foreground">{h.nome}</p>
                          {h.acao && (
                            <span className="text-[10px] border border-border rounded px-1.5 py-0.5 text-muted-foreground">{h.acao}</span>
                          )}
                          {!!h.custo_pe && (
                            <span className="text-[10px] border border-primary/30 rounded px-1.5 py-0.5 text-primary/80">
                              {h.custo_pe} {recursoLabel}
                            </span>
                          )}
                          {!!h.custo_pe && (
                            <button
                              type="button"
                              onClick={() => usar(h.custo_pe, h.nome)}
                              className="ml-auto text-[10px] font-medium rounded px-2 py-0.5 border border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              Usar −{h.custo_pe} {recursoLabel}
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{h.descricao}</p>
                      </div>
                    ))}
                  </div>
                </Block>
              )}
            </TabsContent>

            {/* RITUAIS */}
            <TabsContent value="rituais" className="mt-6">
              {rituais.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum ritual aprendido.</p>
              ) : (
                <Block title="Rituais" icon={<Sparkles className="h-3.5 w-3.5" />}>
                  <div className="space-y-1">
                    {rituais.map((r, i) => {
                      const full = allRituais.find((x) => x.id === r.ritual_id);
                      const expanded = expandedRitualId === r.ritual_id;
                      return (
                        <div key={i} className={`rounded-sm border transition-colors ${expanded ? "border-border bg-muted/10" : "border-border/50"}`}>
                          <div className="flex items-center gap-2 px-3 py-2.5">
                            <button
                              type="button"
                              className="flex items-center gap-2 flex-1 min-w-0 text-left"
                              onClick={() => setExpandedRitualId(expanded ? null : r.ritual_id)}
                            >
                              <span className={`text-sm font-semibold flex-1 truncate transition-colors ${expanded ? "text-foreground" : "text-foreground/80"}`}>{r.nome}</span>
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${ELEMENTO_COLORS[r.elemento as RitualElemento]}`}>
                                {ELEMENTO_LABELS[r.elemento as RitualElemento]}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground shrink-0">{r.circulo}° Círculo · {r.custo_pe} {recursoLabel}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => usar(r.custo_pe, r.nome)}
                              className="shrink-0 text-[10px] font-medium rounded px-2 py-0.5 border border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              Usar −{r.custo_pe} {recursoLabel}
                            </button>
                          </div>
                          {expanded && full && (
                            <div className="border-t border-border/60 mx-3 pt-3 pb-3 space-y-2.5">
                              <div className="flex gap-x-5 gap-y-1 flex-wrap text-xs">
                                {full.execucao   && <span><span className="text-muted-foreground mr-1">Execução</span><strong className="font-medium">{full.execucao}</strong></span>}
                                {full.alcance    && <span><span className="text-muted-foreground mr-1">Alcance</span><strong className="font-medium">{full.alcance}</strong></span>}
                                {full.alvo       && <span><span className="text-muted-foreground mr-1">Alvo</span><strong className="font-medium">{full.alvo}</strong></span>}
                                {full.duracao    && <span><span className="text-muted-foreground mr-1">Duração</span><strong className="font-medium">{full.duracao}</strong></span>}
                                {full.resistencia && full.resistencia !== "—" && (
                                  <span><span className="text-muted-foreground mr-1">Resistência</span><strong className="font-medium">{full.resistencia}</strong></span>
                                )}
                                {full.dt         && <span><span className="text-muted-foreground mr-1">DT</span><strong className="font-medium">{full.dt}</strong></span>}
                              </div>
                              {full.descricao && (() => {
                                const parts = full.descricao.split(/(?=↑\s)/);
                                const base = parts[0].trim();
                                const upgrades = parts.slice(1).map((p) => {
                                  const m = p.match(/^↑\s*(.+?):\s*([\s\S]+)$/);
                                  return m ? { titulo: m[1].trim(), texto: m[2].trim() } : { titulo: "", texto: p.replace(/^↑\s*/, "").trim() };
                                });
                                const upgradeColor = (t: string) =>
                                  t.toLowerCase().startsWith("verdadeiro") ? "border-primary/40 text-primary/90" : "border-border/60 text-muted-foreground";
                                return (
                                  <div className="space-y-2">
                                    {base && <p className="text-sm text-foreground/80 leading-relaxed">{base}</p>}
                                    {upgrades.map((u, i) => (
                                      <div key={i} className={`border-l-2 pl-3 py-0.5 ${upgradeColor(u.titulo)}`}>
                                        <span className="text-[11px] font-semibold uppercase tracking-wide mr-2">↑ {u.titulo}</span>
                                        <span className="text-sm leading-relaxed">{u.texto}</span>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Block>
              )}
            </TabsContent>

            {/* INVENTÁRIO */}
            <TabsContent value="inventario" className="mt-6">
              {inventario.length === 0 ? (
                <p className="text-sm text-muted-foreground">Inventário vazio.</p>
              ) : (
                <Block title={`Inventário — Crédito ${agente.limite_credito}`} icon={<Package className="h-3.5 w-3.5" />}>
                  <div className="space-y-2">
                    {inventario.map((item, i) => {
                      const [cat, sub] = item.categoria.split("·");
                      const full = allItens.find((x) => x.id === item.item_id);
                      return (
                        <div key={i} className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium">{item.nome}</span>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {CATEGORIA_LABELS[cat] ?? cat}{sub ? ` · ${SUBCATEGORIA_LABELS[sub] ?? sub}` : ""}
                              </Badge>
                            </div>
                            {full && <ItemStats item={full} />}
                          </div>
                          <span className="text-[10px] text-muted-foreground w-14 text-right shrink-0 mt-0.5">{item.espacos} esp.</span>
                        </div>
                      );
                    })}
                  </div>
                </Block>
              )}
            </TabsContent>

            {/* DESCRIÇÃO */}
            <TabsContent value="descricao" className="mt-6 space-y-5">
              {[
                { key: "aparencia",     label: "Aparência" },
                { key: "personalidade", label: "Personalidade" },
                { key: "historico",     label: "Histórico" },
                { key: "objetivo",      label: "Objetivo" },
              ].map(({ key, label }) => agente[key as keyof AgentSheet] ? (
                <Block key={key} title={label}>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {agente[key as keyof AgentSheet] as string}
                  </p>
                </Block>
              ) : null)}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

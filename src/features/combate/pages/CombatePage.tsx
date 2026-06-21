"use client";

import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { Label } from "@/shared/components/ui/label";
import { useAgentes } from "@/features/agentes/hooks/useAgentes";
import { useSujeitos } from "@/features/sujeitos/hooks/useSujeitos";
import { cn } from "@/shared/lib/utils";
import {
  Activity, AlertTriangle, ChevronDown, ChevronRight, Dices, Heart, Plus, RotateCcw, Search, Shield, Skull, Swords, Trash2, UserPlus, UserRound, Zap,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

type Fonte = "agente" | "sujeito" | "avulso";

interface Combatente {
  id: string;
  fonte: Fonte;
  refId?: string;
  nome: string;
  iniciativa: number | null;
  pvAtual: number;
  pvMax: number;
  imageUrl?: string | null;
  condicoes?: string[];
  nota?: string;
}

interface Estado {
  combatentes: Combatente[];
  round: number;
  turnoId: string | null;
}

const STORAGE_KEY = "ordo:combate";
const QUICK = [-5, -1, 1, 5];
const CONDICOES_RAPIDAS = ["Agarrado", "Caido", "Desprevenido", "Sangrando", "Vulneravel", "Atordoado", "Morrendo"];
const ESTADO_INICIAL: Estado = { combatentes: [], round: 1, turnoId: null };

function isFonte(value: unknown): value is Fonte {
  return value === "agente" || value === "sujeito" || value === "avulso";
}

function isCombatente(value: unknown): value is Combatente {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<Combatente>;
  return (
    typeof c.id === "string" &&
    isFonte(c.fonte) &&
    typeof c.nome === "string" &&
    (typeof c.iniciativa === "number" || c.iniciativa === null) &&
    typeof c.pvAtual === "number" &&
    typeof c.pvMax === "number" &&
    (c.condicoes === undefined || (Array.isArray(c.condicoes) && c.condicoes.every((item) => typeof item === "string"))) &&
    (c.nota === undefined || typeof c.nota === "string") &&
    (c.refId === undefined || typeof c.refId === "string") &&
    (c.imageUrl === undefined || c.imageUrl === null || typeof c.imageUrl === "string")
  );
}

function isEstado(value: unknown): value is Estado {
  if (!value || typeof value !== "object") return false;
  const estado = value as Partial<Estado>;
  return (
    Array.isArray(estado.combatentes) &&
    estado.combatentes.every(isCombatente) &&
    typeof estado.round === "number" &&
    (estado.turnoId === null || typeof estado.turnoId === "string")
  );
}

function carregar(): Estado {
  if (typeof window === "undefined") return ESTADO_INICIAL;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return ESTADO_INICIAL;
    const parsed: unknown = JSON.parse(raw);
    return isEstado(parsed) ? parsed : ESTADO_INICIAL;
  } catch { /* ignore */ }
  return ESTADO_INICIAL;
}

// Extrai o bônus de iniciativa de uma string como "2O+10" ou "+5".
function bonusIniciativa(s: string | null | undefined): number {
  if (!s) return 0;
  const m = s.match(/([+-]?\d+)\s*$/);
  return m ? parseInt(m[1], 10) : 0;
}

const d20 = () => Math.floor(Math.random() * 20) + 1;

export function CombatePage() {
  const { data: agentes = [] } = useAgentes();
  const { data: sujeitos = [] } = useSujeitos();
  const [estado, setEstado] = useState<Estado>(() => carregar());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [addTab, setAddTab] = useState<"pessoa" | "criatura" | "agente">("pessoa");
  const [addBusca, setAddBusca] = useState("");
  const [avulsoOpen, setAvulsoOpen] = useState(false);
  const [avulsoNome, setAvulsoNome] = useState("");
  const [avulsoPv, setAvulsoPv] = useState("");

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(estado)); }, [estado]);

  const ordenados = [...estado.combatentes].sort((a, b) => (b.iniciativa ?? -999) - (a.iniciativa ?? -999));
  const turnoAtual = ordenados.find((c) => c.id === estado.turnoId) ?? null;
  const proximo = turnoAtual ? ordenados[(ordenados.findIndex((c) => c.id === turnoAtual.id) + 1) % ordenados.length] : ordenados[0] ?? null;
  const ativos = estado.combatentes.filter((c) => c.pvAtual > 0).length;
  const feridos = estado.combatentes.filter((c) => c.pvMax > 0 && c.pvAtual > 0 && c.pvAtual <= c.pvMax / 2).length;
  const caidos = estado.combatentes.filter((c) => c.pvAtual <= 0 || (c.condicoes ?? []).includes("Morrendo")).length;

  const patch = (id: string, p: Partial<Combatente>) =>
    setEstado((e) => ({ ...e, combatentes: e.combatentes.map((c) => (c.id === id ? { ...c, ...p } : c)) }));

  // Adiciona contando duplicados (mesma fonte): "Cultista", "Cultista 2"...
  function adicionar(novo: Omit<Combatente, "id" | "nome"> & { nomeBase: string }) {
    setEstado((e) => {
      const n = e.combatentes.filter((c) => c.refId === novo.refId && novo.refId != null).length;
      const nome = n > 0 ? `${novo.nomeBase} ${n + 1}` : novo.nomeBase;
      const { nomeBase, ...rest } = novo;
      void nomeBase;
      return { ...e, combatentes: [...e.combatentes, { ...rest, id: crypto.randomUUID(), nome }] };
    });
  }
  function addAgente(a: (typeof agentes)[number]) {
    adicionar({ fonte: "agente", refId: a.id, nomeBase: a.nome || "Agente", iniciativa: null, pvAtual: a.pv_atual, pvMax: a.pv_max, imageUrl: a.image_url });
  }
  function addSujeito(s: (typeof sujeitos)[number]) {
    const pv = s.pv ?? 0;
    adicionar({ fonte: "sujeito", refId: s.id, nomeBase: s.name, iniciativa: null, pvAtual: s.pv_atual ?? pv, pvMax: pv, imageUrl: s.image_url });
  }
  function confirmarAvulso() {
    const nome = avulsoNome.trim();
    if (!nome) return;
    const pv = parseInt(avulsoPv, 10) || 0;
    setEstado((e) => ({
      ...e,
      combatentes: [...e.combatentes, {
        id: crypto.randomUUID(), fonte: "avulso", nome, iniciativa: null, pvAtual: pv, pvMax: pv,
      }],
    }));
    setAvulsoNome(""); setAvulsoPv(""); setAvulsoOpen(false);
  }

  function remover(id: string) {
    setEstado((e) => ({
      ...e,
      combatentes: e.combatentes.filter((c) => c.id !== id),
      turnoId: e.turnoId === id ? null : e.turnoId,
    }));
  }

  function defesaDe(c: Combatente): number | null {
    if (c.fonte === "agente") {
      const a = agentes.find((x) => x.id === c.refId);
      return a ? 10 + a.agi + a.defesa_bonus + a.defesa_equip : null;
    }
    if (c.fonte === "sujeito") {
      return sujeitos.find((x) => x.id === c.refId)?.defesa ?? null;
    }
    return null;
  }

  function ajustarPv(c: Combatente, delta: number) {
    const next = Math.max(0, Math.min(c.pvMax, c.pvAtual + delta));
    patch(c.id, { pvAtual: next });
  }

  function toggleCondicao(c: Combatente, condicao: string) {
    const atuais = c.condicoes ?? [];
    patch(c.id, {
      condicoes: atuais.includes(condicao)
        ? atuais.filter((item) => item !== condicao)
        : [...atuais, condicao],
    });
  }

  function rolarUm(c: Combatente) {
    let bonus = 0;
    if (c.fonte === "agente") bonus = agentes.find((a) => a.id === c.refId)?.agi ?? 0;
    else if (c.fonte === "sujeito") bonus = bonusIniciativa(sujeitos.find((s) => s.id === c.refId)?.iniciativa);
    patch(c.id, { iniciativa: d20() + bonus });
  }
  function rolarTodos() {
    setEstado((e) => ({
      ...e,
      combatentes: e.combatentes.map((c) => {
        let bonus = 0;
        if (c.fonte === "agente") bonus = agentes.find((a) => a.id === c.refId)?.agi ?? 0;
        else if (c.fonte === "sujeito") bonus = bonusIniciativa(sujeitos.find((s) => s.id === c.refId)?.iniciativa);
        return { ...c, iniciativa: d20() + bonus };
      }),
    }));
  }

  function proximoTurno() {
    if (ordenados.length === 0) return;
    const idx = ordenados.findIndex((c) => c.id === estado.turnoId);
    if (idx === -1) { setEstado((e) => ({ ...e, turnoId: ordenados[0].id })); return; }
    const next = idx + 1;
    if (next >= ordenados.length) setEstado((e) => ({ ...e, turnoId: ordenados[0].id, round: e.round + 1 }));
    else setEstado((e) => ({ ...e, turnoId: ordenados[next].id }));
  }

  function reset() {
    setEstado(ESTADO_INICIAL);
    setExpanded(new Set());
  }

  function toggleExpand(id: string) {
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  return (
    <>
      <AppHeader title="Combate" />
      <main className="flex-1 overflow-y-auto p-6 space-y-5">

        <section className="grid gap-3 xl:grid-cols-[1fr_auto]">
          <div className="grid gap-3 md:grid-cols-4">
            <CombatStat label="Rodada" value={estado.round} icon={<Swords className="h-4 w-4" />} />
            <CombatStat label="Ativos" value={ativos} icon={<Activity className="h-4 w-4" />} />
            <CombatStat label="Machucados" value={feridos} icon={<Heart className="h-4 w-4" />} />
            <CombatStat label="Caídos" value={caidos} icon={<Skull className="h-4 w-4" />} danger={caidos > 0} />
          </div>

          <div className="flex flex-col justify-between gap-3 border border-border bg-card p-4 xl:w-80">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Turno atual</p>
              <p className="mt-1 truncate text-lg font-semibold">{turnoAtual?.nome ?? "Nenhum combatente"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Proximo: {proximo?.id === turnoAtual?.id ? "fim da rodada" : proximo?.nome ?? "aguardando iniciativa"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={proximoTurno} disabled={ordenados.length === 0}>
                <Swords className="mr-1.5 h-3.5 w-3.5" /> Próximo
              </Button>
              <Button size="sm" variant="outline" onClick={rolarTodos} disabled={ordenados.length === 0}>
                <Dices className="mr-1.5 h-3.5 w-3.5" /> Iniciativa
              </Button>
              <ConfirmDialog
                title="Limpar combate"
                description="Remove todos os combatentes e zera a rodada. Esta ação não pode ser desfeita."
                confirmLabel="Limpar combate"
                icon={<RotateCcw className="h-4 w-4 text-destructive" />}
                onConfirm={reset}
              >
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </ConfirmDialog>
            </div>
          </div>
        </section>

        {/* Adicionar combatentes */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Adicionar combatente
          </Button>
          <Button size="sm" variant="outline" onClick={() => setAvulsoOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Avulso
          </Button>
        </div>

        {/* Lista de iniciativa */}
        {ordenados.length === 0 ? (
          <div className="border border-dashed border-border rounded-md py-16 text-center">
            <Swords className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Adicione combatentes para começar o combate.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {ordenados.map((c, i) => {
              const ativo = c.id === estado.turnoId;
              const isExp = expanded.has(c.id);
              const pct = c.pvMax > 0 ? Math.min(100, (c.pvAtual / c.pvMax) * 100) : 0;
              const morto = c.pvAtual <= 0;
              const condicoes = c.condicoes ?? [];
              return (
                <div key={c.id} className={cn(
                  "rounded-md border bg-card transition-colors",
                  ativo ? "border-primary ring-1 ring-primary/30" : "border-border",
                  morto && "opacity-60"
                )}>
                  <div className="flex items-center gap-3 p-3">
                    {/* ordem */}
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums",
                      ativo ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {i + 1}
                    </div>

                    {/* avatar + nome */}
                    <div className={cn(
                      "h-9 w-9 shrink-0 rounded-full overflow-hidden border flex items-center justify-center bg-muted",
                      c.fonte === "sujeito" ? "border-red-500/40" : "border-border"
                    )}>
                      {c.imageUrl
                        ? <Image src={c.imageUrl} alt="" width={36} height={36} className="h-full w-full object-cover" unoptimized />
                        : c.fonte === "sujeito" ? <Skull className="h-4 w-4 text-red-400/50" />
                        : c.fonte === "agente" ? <Shield className="h-4 w-4 text-muted-foreground/50" />
                        : <UserRound className="h-4 w-4 text-muted-foreground/50" />}
                    </div>
                    <div className="min-w-0 w-40 shrink-0">
                      <p className={cn("text-sm font-medium truncate", morto && "line-through")}>{c.nome}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {c.fonte === "agente" ? "Agente" : c.fonte === "sujeito" ? "Sujeito" : "Avulso"}
                      </p>
                      {condicoes.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {condicoes.slice(0, 2).map((condicao) => (
                            <span key={condicao} className="border border-amber-500/30 bg-amber-500/10 px-1 py-0.5 text-[9px] uppercase tracking-wider text-amber-700">
                              {condicao}
                            </span>
                          ))}
                          {condicoes.length > 2 && (
                            <span className="text-[9px] text-muted-foreground">+{condicoes.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* defesa */}
                    {defesaDe(c) != null && (
                      <div className="flex flex-col items-center justify-center shrink-0 rounded-md border border-blue-500/30 bg-blue-500/5 px-2 py-1 w-12" title="Defesa">
                        <span className="flex items-center gap-0.5 text-[8px] uppercase tracking-wider text-blue-400/80"><Shield className="h-2.5 w-2.5" />Def</span>
                        <span className="text-sm font-bold tabular-nums leading-none">{defesaDe(c)}</span>
                      </div>
                    )}

                    {/* iniciativa */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Input
                        type="number"
                        value={c.iniciativa ?? ""}
                        onChange={(e) => patch(c.id, { iniciativa: e.target.value ? parseInt(e.target.value, 10) : null })}
                        placeholder="Ini"
                        className="h-8 w-16 text-center text-sm"
                      />
                      <button type="button" onClick={() => rolarUm(c)} title="Rolar iniciativa" className="p-1.5 text-muted-foreground hover:text-foreground">
                        <Dices className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* PV */}
                    <div className="flex-1 min-w-32">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="flex items-center gap-1 text-muted-foreground"><Heart className="h-3 w-3" /> PV</span>
                        <span className="font-medium tabular-nums">{c.pvAtual} / {c.pvMax}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", pct > 50 ? "bg-red-500" : pct > 20 ? "bg-amber-500" : "bg-red-700")} style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    {/* quick PV */}
                    <div className="flex items-center gap-1 shrink-0">
                      {QUICK.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => ajustarPv(c, d)}
                          className={cn(
                            "h-7 w-9 rounded text-xs font-medium tabular-nums border transition-colors",
                            d < 0 ? "border-border text-muted-foreground hover:border-destructive/50 hover:text-destructive"
                                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                          )}
                        >
                          {d > 0 ? `+${d}` : d}
                        </button>
                      ))}
                    </div>

                    {/* expand + remover */}
                    {(c.fonte === "sujeito" || c.fonte === "agente") ? (
                      <button type="button" onClick={() => toggleExpand(c.id)} className="p-1.5 text-muted-foreground hover:text-foreground shrink-0">
                        {isExp ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    ) : <div className="w-7" />}
                    <button type="button" onClick={() => remover(c.id)} className="p-1.5 text-muted-foreground hover:text-destructive shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {isExp && (
                    <div className="border-t border-border px-4 py-3">
                      <div className="mb-4">
                        <p className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          <AlertTriangle className="h-3 w-3" />
                          Condições rápidas
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {CONDICOES_RAPIDAS.map((condicao) => {
                            const marcada = condicoes.includes(condicao);
                            return (
                              <button
                                key={condicao}
                                type="button"
                                onClick={() => toggleCondicao(c, condicao)}
                                className={cn(
                                  "border px-2 py-1 text-[10px] uppercase tracking-wider transition-colors",
                                  marcada
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                                )}
                              >
                                {condicao}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <DetalhesCombatente c={c} agentes={agentes} sujeitos={sujeitos} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal de adicionar combatente */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar combatente</DialogTitle>
          </DialogHeader>

          {/* Abas */}
          <div className="flex gap-1.5">
            {([["pessoa", "Pessoas"], ["criatura", "Criaturas"], ["agente", "Agentes"]] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setAddTab(id)}
                className={cn(
                  "flex-1 text-sm py-1.5 rounded-md border transition-colors",
                  addTab === id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input value={addBusca} onChange={(e) => setAddBusca(e.target.value)} placeholder="Buscar..." className="pl-8 h-9" autoFocus />
          </div>

          {/* Lista */}
          <div className="h-72 overflow-y-auto -mx-1 px-1 space-y-1">
            {(addTab === "agente"
              ? agentes.filter((a) => (a.nome ?? "").toLowerCase().includes(addBusca.toLowerCase()))
              : sujeitos
                  .filter((s) => (addTab === "criatura" ? s.tipo === "criatura" : s.tipo !== "criatura"))
                  .filter((s) => s.name.toLowerCase().includes(addBusca.toLowerCase()))
            ).map((item) => {
              const isSuj = addTab !== "agente";
              const id = item.id;
              const nome = isSuj ? (item as (typeof sujeitos)[number]).name : ((item as (typeof agentes)[number]).nome || "Sem nome");
              const jaTem = estado.combatentes.filter((c) => c.refId === id).length;
              const img = (item as { image_url: string | null }).image_url;
              const sub = isSuj
                ? [(item as (typeof sujeitos)[number]).tipo, (item as (typeof sujeitos)[number]).vd != null ? `VD ${(item as (typeof sujeitos)[number]).vd}` : null].filter(Boolean).join(" · ")
                : [(item as (typeof agentes)[number]).classe, `PV ${(item as (typeof agentes)[number]).pv_max}`].filter(Boolean).join(" · ");
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => isSuj ? addSujeito(item as (typeof sujeitos)[number]) : addAgente(item as (typeof agentes)[number])}
                  className="w-full flex items-center gap-3 px-2.5 py-2 rounded-md hover:bg-muted transition-colors text-left"
                >
                  <div className={cn("h-8 w-8 shrink-0 rounded-full overflow-hidden border flex items-center justify-center bg-muted", isSuj ? "border-red-500/40" : "border-border")}>
                    {img ? <Image src={img} alt="" width={32} height={32} className="h-full w-full object-cover" unoptimized /> : isSuj ? <Skull className="h-3.5 w-3.5 text-red-400/50" /> : <Shield className="h-3.5 w-3.5 text-muted-foreground/50" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{nome}</p>
                    {sub && <p className="text-[11px] text-muted-foreground truncate capitalize">{sub}</p>}
                  </div>
                  {jaTem > 0 && <span className="text-[10px] text-muted-foreground tabular-nums">no combate: {jaTem}</span>}
                  <Plus className="h-4 w-4 text-primary shrink-0" />
                </button>
              );
            })}
            {(addTab === "agente" ? agentes
              : sujeitos.filter((s) => addTab === "criatura" ? s.tipo === "criatura" : s.tipo !== "criatura")
            ).length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">Nada cadastrado nesta aba.</p>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground text-center">Clique para adicionar — pode adicionar o mesmo várias vezes.</p>
        </DialogContent>
      </Dialog>

      {/* Modal de combatente avulso */}
      <Dialog open={avulsoOpen} onOpenChange={setAvulsoOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Combatente avulso</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); confirmarAvulso(); }} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nome</Label>
              <Input value={avulsoNome} onChange={(e) => setAvulsoNome(e.target.value)} placeholder="Ex: Capanga" autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">PV máximo</Label>
              <Input type="number" min={0} value={avulsoPv} onChange={(e) => setAvulsoPv(e.target.value)} placeholder="Ex: 30" />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setAvulsoOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={!avulsoNome.trim()}>Adicionar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DetalhesCombatente({ c, agentes, sujeitos }: {
  c: Combatente;
  agentes: ReturnType<typeof useAgentes>["data"];
  sujeitos: ReturnType<typeof useSujeitos>["data"];
}) {
  if (c.fonte === "sujeito") {
    const s = sujeitos?.find((x) => x.id === c.refId);
    if (!s) return null;
    return (
      <div className="space-y-3 text-sm">
        {s.acoes.length > 0 && (
          <BlocoDet titulo="Ações" icon={<Swords className="h-3 w-3" />}>
            {s.acoes.map((a, i) => (
              <div key={i}>
                <p className="text-xs"><strong>{a.nome}</strong> <span className="text-muted-foreground">{a.teste && `· ${a.teste}`} {a.dano && `· ${a.dano}`} {a.critico && `· ${a.critico}`}{a.quantidade && a.quantidade > 1 ? ` · ×${a.quantidade}` : ""}</span></p>
                {a.descricao && <p className="text-[11px] text-muted-foreground">{a.descricao}</p>}
              </div>
            ))}
          </BlocoDet>
        )}
        {s.habilidades.length > 0 && (
          <BlocoDet titulo="Habilidades" icon={<Zap className="h-3 w-3" />}>
            {s.habilidades.map((h, i) => (
              <div key={i}>
                <p className="text-xs"><strong>{h.nome}</strong>{h.acao ? <span className="text-muted-foreground"> · {h.acao}</span> : null}{h.resistencia ? <span className="text-muted-foreground"> · evita {h.resistencia}{h.resistencia_dt ? ` DT ${h.resistencia_dt}` : ""}</span> : null}</p>
                {h.descricao && <p className="text-[11px] text-muted-foreground">{h.descricao}</p>}
              </div>
            ))}
          </BlocoDet>
        )}
        {s.acoes.length === 0 && s.habilidades.length === 0 && <p className="text-xs text-muted-foreground">Sem ações ou habilidades cadastradas.</p>}
      </div>
    );
  }
  if (c.fonte === "agente") {
    const a = agentes?.find((x) => x.id === c.refId);
    if (!a) return null;
    const ataques = a.ataques ?? [];
    const habilidades = a.habilidades ?? [];
    return (
      <div className="space-y-3 text-sm">
        {ataques.length > 0 && (
          <BlocoDet titulo="Ataques" icon={<Swords className="h-3 w-3" />}>
            {ataques.map((at, i) => (
              <p key={i} className="text-xs"><strong>{at.nome}</strong> <span className="text-muted-foreground">{at.teste && `· ${at.teste}`} {at.dano && `· ${at.dano}`} {at.critico && `· ${at.critico}`} {at.alcance && `· ${at.alcance}`}</span></p>
            ))}
          </BlocoDet>
        )}
        {habilidades.length > 0 && (
          <BlocoDet titulo="Habilidades" icon={<Zap className="h-3 w-3" />}>
            {habilidades.map((h, i) => (
              <div key={i}>
                <p className="text-xs"><strong>{h.nome}</strong>{h.acao ? <span className="text-muted-foreground"> · {h.acao}</span> : null}{h.custo_pe ? <span className="text-muted-foreground"> · {h.custo_pe} PE</span> : null}</p>
                {h.descricao && <p className="text-[11px] text-muted-foreground">{h.descricao}</p>}
              </div>
            ))}
          </BlocoDet>
        )}
        {ataques.length === 0 && habilidades.length === 0 && <p className="text-xs text-muted-foreground">Sem ataques ou habilidades cadastrados.</p>}
      </div>
    );
  }
  return null;
}

function CombatStat({
  label,
  value,
  icon,
  danger,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className={cn(
      "border bg-card p-4",
      danger ? "border-destructive/40" : "border-border",
    )}>
      <div className={cn("mb-2", danger ? "text-destructive" : "text-primary")}>{icon}</div>
      <p className="text-xl font-semibold tabular-nums leading-none">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
    </div>
  );
}

function BlocoDet({ titulo, icon, children }: { titulo: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">{icon}{titulo}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

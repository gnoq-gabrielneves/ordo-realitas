"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  AGENT_POWER_CATALOG,
  AgentPowerCatalogEntry,
  AgentPowerKind,
  powerToHabilidade,
} from "@/shared/constants/agentPowers";
import { ELEMENTO_BADGE, ELEMENTO_LABELS } from "@/shared/constants/elements";
import { cn } from "@/shared/lib/utils";
import { AgentHabilidade, AgentSheet } from "@/shared/types/agent";
import { BookOpenCheck, GripVertical, Plus, Search, Sparkles, Trash2, Zap } from "lucide-react";
import { useMemo, useState } from "react";

interface HabilidadesTabProps {
  data: AgentSheet;
  onChange: (patch: Partial<AgentSheet>) => void;
}

const ACOES = ["Passiva", "Livre", "Reação", "Movimento", "Padrão", "Completa"];
const POWER_KIND_LABELS: Record<AgentPowerKind, string> = {
  origem: "Origem",
  classe: "Classe",
  paranormal: "Paranormal",
  hexatombe: "Hexatombe",
};

type PowerFilter = "todos" | AgentPowerKind;

export function HabilidadesTab({ data, onChange }: HabilidadesTabProps) {
  const habilidades: AgentHabilidade[] = data.habilidades ?? [];
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<PowerFilter>("todos");

  const set = (i: number, patch: Partial<AgentHabilidade>) =>
    onChange({ habilidades: habilidades.map((h, idx) => (idx === i ? { ...h, ...patch } : h)) });

  const add = () =>
    onChange({ habilidades: [...habilidades, { nome: "", descricao: "", acao: "", custo_pe: 0 }] });

  const remove = (i: number) =>
    onChange({ habilidades: habilidades.filter((_, idx) => idx !== i) });

  const catalogo = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return AGENT_POWER_CATALOG
      .filter((power) => data.tipo === "hexatombe" || power.tipo !== "hexatombe")
      .filter((power) => filtro === "todos" || power.tipo === filtro)
      .filter((power) => {
        if (!q) return true;
        return [
          power.nome,
          power.origem,
          power.classe,
          power.requisito,
          power.resumo,
          power.fonte,
          power.elemento ? ELEMENTO_LABELS[power.elemento] : "",
        ].some((value) => value?.toLowerCase().includes(q));
      })
      .sort((a, b) => {
        const aMatch = a.origem && data.origem && a.origem === data.origem ? -1 : 0;
        const bMatch = b.origem && data.origem && b.origem === data.origem ? -1 : 0;
        return aMatch - bMatch || a.nome.localeCompare(b.nome, "pt-BR");
      });
  }, [busca, data.origem, data.tipo, filtro]);

  const addFromCatalog = (power: AgentPowerCatalogEntry) => {
    if (habilidades.some((habilidade) => habilidade.nome.trim().toLowerCase() === power.nome.toLowerCase())) return;
    onChange({ habilidades: [...habilidades, powerToHabilidade(power)] });
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3 border border-border bg-muted/20 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BookOpenCheck className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Biblioteca de poderes</p>
            </div>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Adicione poderes já catalogados e ajuste a descrição depois, se a mesa usar alguma adaptação.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={add}>
            <Plus className="h-4 w-4" />
            Em branco
          </Button>
        </div>

        <div className="grid gap-2 lg:grid-cols-[1fr_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar poder, origem, elemento ou efeito..."
              className="h-10 pl-9"
            />
          </div>
          <Select value={filtro} onValueChange={(value) => setFiltro(value as PowerFilter)}>
            <SelectTrigger className="w-full h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="origem">Origem</SelectItem>
              <SelectItem value="paranormal">Paranormal</SelectItem>
              {data.tipo === "hexatombe" && <SelectItem value="hexatombe">Hexatombe</SelectItem>}
            </SelectContent>
          </Select>
        </div>

        <div className="grid max-h-[25rem] gap-3 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
          {catalogo.map((power) => {
            const added = habilidades.some((habilidade) => habilidade.nome.trim().toLowerCase() === power.nome.toLowerCase());
            const isCurrentOrigin = power.origem && data.origem && power.origem === data.origem;
            return (
              <button
                key={power.id}
                type="button"
                onClick={() => addFromCatalog(power)}
                disabled={added}
                className={cn(
                  "group border bg-background p-3 text-left transition-colors",
                  added ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-primary/[0.03]",
                  isCurrentOrigin && "border-amber-500/45 bg-amber-500/[0.04]",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold leading-tight">{power.nome}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {POWER_KIND_LABELS[power.tipo]}{power.origem ? ` · ${power.origem}` : ""}{power.requisito ? ` · ${power.requisito}` : ""}
                    </p>
                  </div>
                  <span className={cn("shrink-0 text-primary transition-transform", added ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                    {added ? <BookOpenCheck className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {power.elemento && (
                    <Badge variant="outline" className={cn("rounded-none px-1.5 py-0 text-[10px]", ELEMENTO_BADGE[power.elemento])}>
                      {ELEMENTO_LABELS[power.elemento]}
                    </Badge>
                  )}
                  {typeof power.custo_pe === "number" && power.custo_pe > 0 && (
                    <Badge variant="outline" className="rounded-none px-1.5 py-0 text-[10px]">
                      {power.custo_pe} {data.usa_pd ? "PD" : "PE"}
                    </Badge>
                  )}
                  {power.acao && (
                    <Badge variant="outline" className="rounded-none px-1.5 py-0 text-[10px]">
                      {power.acao}
                    </Badge>
                  )}
                </div>

                <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{power.resumo}</p>
                <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">{power.fonte}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Habilidades da ficha</p>
        </div>

      {habilidades.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-border py-12 text-center">
          <Zap className="h-8 w-8 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">Nenhuma habilidade cadastrada. Use a biblioteca acima para começar.</p>
        </div>
      ) : (
        habilidades.map((h, i) => (
          <div key={i} className="group rounded-md border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground/30 shrink-0" />
              <Input
                value={h.nome}
                onChange={(e) => set(i, { nome: e.target.value })}
                placeholder="Nome da habilidade"
                className="h-8 text-sm font-medium flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => remove(i)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="flex gap-2">
              <div className="w-36 shrink-0">
                <Select
                  value={h.acao ?? ""}
                  onValueChange={(v) => set(i, { acao: v === "__none__" ? "" : v })}
                >
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Ação" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="__none__" className="text-muted-foreground">— sem ação —</SelectItem>
                    {ACOES.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1.5 w-28 shrink-0">
                <Input
                  type="number"
                  min={0}
                  value={h.custo_pe ?? 0}
                  onChange={(e) => set(i, { custo_pe: Number(e.target.value) })}
                  className="h-8 text-xs text-center w-14"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {data.usa_pd ? "PD" : "PE"}
                </span>
              </div>
            </div>

            <Textarea
              value={h.descricao}
              onChange={(e) => set(i, { descricao: e.target.value })}
              placeholder="Descreva o efeito da habilidade..."
              rows={3}
              className="resize-none text-sm"
            />
          </div>
        ))
      )}
      </section>
    </div>
  );
}

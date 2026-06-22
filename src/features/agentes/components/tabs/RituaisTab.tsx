"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { useRituais } from "@/features/rituais/hooks/useRituais";
import { ELEMENTO_BADGE, ELEMENTO_BG, ELEMENTO_LABELS, ELEMENTOS } from "@/shared/constants/elements";
import { AgentRitualRef, AgentSheet } from "@/shared/types/agent";
import { CUSTO_PE, RitualElemento } from "@/shared/types/ritual";
import { cn } from "@/shared/lib/utils";
import { BookOpenCheck, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { useState } from "react";

interface RituaisTabProps {
  data: AgentSheet;
  onChange: (patch: Partial<AgentSheet>) => void;
}

function parseDescricao(descricao: string) {
  const parts = descricao.split(/(?=↑\s)/);
  const base = parts[0].trim();
  const upgrades = parts.slice(1).map((p) => {
    const match = p.match(/^↑\s*(.+?):\s*([\s\S]+)$/);
    if (match) return { titulo: match[1].trim(), texto: match[2].trim() };
    return { titulo: "", texto: p.replace(/^↑\s*/, "").trim() };
  });
  return { base, upgrades };
}

const UPGRADE_COLORS: Record<string, string> = {
  discente:   "border-border/60 text-muted-foreground",
  verdadeiro: "border-primary/40 text-primary/90",
};

function getUpgradeColor(titulo: string) {
  const key = titulo.toLowerCase().split(" ")[0];
  return UPGRADE_COLORS[key] ?? "border-border/60 text-muted-foreground";
}

function DetalhesRitual({ execucao, alcance, alvo, duracao, resistencia, dt, descricao }: {
  execucao?: string; alcance?: string; alvo?: string; duracao?: string;
  resistencia?: string; dt?: string; descricao?: string;
}) {
  const parsed = descricao ? parseDescricao(descricao) : null;
  return (
    <div className="border-t border-border/60 mx-3 pt-3 pb-3 space-y-3">
      <div className="flex gap-x-5 gap-y-1 flex-wrap text-xs">
        {execucao    && <span><span className="text-muted-foreground mr-1">Execução</span><strong className="font-medium">{execucao}</strong></span>}
        {alcance     && <span><span className="text-muted-foreground mr-1">Alcance</span><strong className="font-medium">{alcance}</strong></span>}
        {alvo        && <span><span className="text-muted-foreground mr-1">Alvo</span><strong className="font-medium">{alvo}</strong></span>}
        {duracao     && <span><span className="text-muted-foreground mr-1">Duração</span><strong className="font-medium">{duracao}</strong></span>}
        {resistencia && resistencia !== "—" && <span><span className="text-muted-foreground mr-1">Resistência</span><strong className="font-medium">{resistencia}</strong></span>}
        {dt          && <span><span className="text-muted-foreground mr-1">DT</span><strong className="font-medium">{dt}</strong></span>}
      </div>
      {parsed && (
        <div className="space-y-2">
          {parsed.base && <p className="text-sm text-foreground/80 leading-relaxed">{parsed.base}</p>}
          {parsed.upgrades.map((u, i) => (
            <div key={i} className={`border-l-2 pl-3 py-0.5 ${getUpgradeColor(u.titulo)}`}>
              <span className="text-[11px] font-semibold uppercase tracking-wide mr-2">↑ {u.titulo}</span>
              <span className="text-sm leading-relaxed">{u.texto}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function RituaisTab({ data, onChange }: RituaisTabProps) {
  const { data: allRituais = [] } = useRituais();
  const rituais = data.rituais ?? [];
  const addedIds = new Set(rituais.map((r) => r.ritual_id));

  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [expandedLibId, setExpandedLibId] = useState<string | null>(null);
  const [busca, setBusca]               = useState("");
  const [filtroEl, setFiltroEl]         = useState<RitualElemento | "todos">("todos");
  const [filtroCirc, setFiltroCirc]     = useState<number | "todos">("todos");

  const addRitual = (ritualId: string) => {
    const r = allRituais.find((x) => x.id === ritualId);
    if (!r) return;
    const ref: AgentRitualRef = {
      ritual_id: r.id, nome: r.nome, elemento: r.elemento,
      circulo: r.circulo, custo_pe: CUSTO_PE[r.circulo as 1 | 2 | 3 | 4],
    };
    onChange({ rituais: [...rituais, ref] });
    setExpandedId(r.id);
    setExpandedLibId(null);
  };

  const removeRitual = (ritualId: string) => {
    onChange({ rituais: rituais.filter((r) => r.ritual_id !== ritualId) });
    if (expandedId === ritualId) setExpandedId(null);
  };

  const available = allRituais
    .filter((r) => !addedIds.has(r.id))
    .filter((r) => filtroEl  === "todos" || r.elemento === filtroEl)
    .filter((r) => filtroCirc === "todos" || r.circulo === filtroCirc)
    .filter((r) => {
      if (!busca.trim()) return true;
      const q = busca.toLowerCase();
      return r.nome.toLowerCase().includes(q) || (r.descricao ?? "").toLowerCase().includes(q);
    });

  // Círculos presentes na biblioteca (para não mostrar botões vazios)
  const circulos = [1, 2, 3, 4].filter((c) =>
    allRituais.some((r) => !addedIds.has(r.id) && (filtroEl === "todos" || r.elemento === filtroEl) && r.circulo === c)
  );

  return (
    <div className="space-y-6">
      <section className="space-y-3 border border-border bg-muted/20 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BookOpenCheck className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Biblioteca de rituais</p>
            </div>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Filtre por elemento ou círculo e adicione o ritual pronto na ficha. Depois você pode abrir o card para consultar detalhes.
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar ritual, efeito, alvo ou descrição..."
            className="h-10 pl-9"
          />
          {busca && (
            <button type="button" onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setFiltroEl("todos")}
            className={cn(
              "border px-2.5 py-1 text-[11px] font-medium transition-colors",
              filtroEl === "todos" ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
          >
            Todos
          </button>
          {ELEMENTOS.map((el) => (
            <button
              key={el}
              type="button"
              onClick={() => setFiltroEl(filtroEl === el ? "todos" : el)}
              className={cn(
                "border px-2.5 py-1 text-[11px] font-medium transition-colors",
                filtroEl === el ? `${ELEMENTO_BG[el]} ${ELEMENTO_BADGE[el]} border-current` : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              {ELEMENTO_LABELS[el]}
            </button>
          ))}
        </div>

        {circulos.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setFiltroCirc("todos")}
              className={cn(
                "border px-2.5 py-1 text-[11px] font-medium transition-colors",
                filtroCirc === "todos" ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              Todos os círculos
            </button>
            {circulos.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFiltroCirc(filtroCirc === c ? "todos" : c)}
                className={cn(
                  "border px-2.5 py-1 text-[11px] font-medium transition-colors",
                  filtroCirc === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {c}° Círculo
              </button>
            ))}
          </div>
        )}

        {available.length === 0 ? (
          <div className="border border-dashed border-border py-10 text-center">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhum ritual encontrado.</p>
          </div>
        ) : (
          <div className="grid max-h-[28rem] gap-3 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
            {available.map((r) => {
              const libExpanded = expandedLibId === r.id;
              return (
                <div
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedLibId(libExpanded ? null : r.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setExpandedLibId(libExpanded ? null : r.id);
                    }
                  }}
                  className={cn(
                    "group border bg-background p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/[0.03] focus:outline-none focus:ring-2 focus:ring-ring",
                    libExpanded && "border-primary/40 bg-primary/[0.04]",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold leading-tight">{r.nome}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        {r.circulo}° Círculo · {CUSTO_PE[r.circulo as 1 | 2 | 3 | 4]} {data.usa_pd ? "PD" : "PE"}
                      </p>
                    </div>
                    <span
                      role="button"
                      tabIndex={0}
                      className="shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(event) => {
                        event.stopPropagation();
                        addRitual(r.id);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          addRitual(r.id);
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge variant="outline" className={cn("rounded-none px-1.5 py-0 text-[10px]", ELEMENTO_BADGE[r.elemento as RitualElemento])}>
                      {ELEMENTO_LABELS[r.elemento as RitualElemento]}
                    </Badge>
                    {r.execucao && <Badge variant="outline" className="rounded-none px-1.5 py-0 text-[10px]">{r.execucao}</Badge>}
                    {r.alvo && <Badge variant="outline" className="rounded-none px-1.5 py-0 text-[10px]">{r.alvo}</Badge>}
                    {r.dt && <Badge variant="outline" className="rounded-none px-1.5 py-0 text-[10px]">DT {r.dt}</Badge>}
                  </div>

                  {r.descricao && <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{parseDescricao(r.descricao).base}</p>}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Rituais da ficha</p>
        </div>

        {rituais.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-border py-12 text-center">
            <Sparkles className="mb-3 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhum ritual adicionado. Use a biblioteca acima para começar.</p>
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {rituais.map((r) => {
              const full = allRituais.find((x) => x.id === r.ritual_id);
              const expanded = expandedId === r.ritual_id;
              return (
                <div key={r.ritual_id} className={cn("group border border-border bg-card transition-colors hover:border-primary/40", expanded && "border-primary/40 bg-primary/[0.03]")}>
                  <div
                    role="button"
                    tabIndex={0}
                    className="w-full p-4 text-left focus:outline-none focus:ring-2 focus:ring-ring"
                    onClick={() => setExpandedId(expanded ? null : r.ritual_id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setExpandedId(expanded ? null : r.ritual_id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold leading-tight">{r.nome}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                          {r.circulo}° Círculo · {r.custo_pe} {data.usa_pd ? "PD" : "PE"}
                        </p>
                      </div>
                      <span
                        role="button"
                        tabIndex={0}
                        className="shrink-0 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeRitual(r.ritual_id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            event.stopPropagation();
                            removeRitual(r.ritual_id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Badge variant="outline" className={cn("rounded-none px-1.5 py-0 text-[10px]", ELEMENTO_BADGE[r.elemento as RitualElemento])}>
                        {ELEMENTO_LABELS[r.elemento as RitualElemento]}
                      </Badge>
                      {full?.execucao && <Badge variant="outline" className="rounded-none px-1.5 py-0 text-[10px]">{full.execucao}</Badge>}
                      {full?.alcance && <Badge variant="outline" className="rounded-none px-1.5 py-0 text-[10px]">{full.alcance}</Badge>}
                    </div>
                    {full?.descricao && <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{parseDescricao(full.descricao).base}</p>}
                  </div>
                  {expanded && full && (
                    <DetalhesRitual
                      execucao={full.execucao ?? undefined} alcance={full.alcance ?? undefined} alvo={full.alvo ?? undefined}
                      duracao={full.duracao ?? undefined} resistencia={full.resistencia ?? undefined}
                      dt={full.dt != null ? String(full.dt) : undefined} descricao={full.descricao ?? undefined}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

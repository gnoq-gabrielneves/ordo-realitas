"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useRituais } from "@/features/rituais/hooks/useRituais";
import { AgentRitualRef, AgentSheet } from "@/shared/types/agent";
import { CUSTO_PE, RitualElemento } from "@/shared/types/ritual";
import { cn } from "@/shared/lib/utils";
import { Plus, Search, Trash2, X } from "lucide-react";
import { useState } from "react";

interface RituaisTabProps {
  data: AgentSheet;
  onChange: (patch: Partial<AgentSheet>) => void;
}

const ELEMENTO_COLORS: Record<RitualElemento, string> = {
  conhecimento: "border-blue-500/40 text-blue-400",
  energia:      "border-yellow-500/40 text-yellow-400",
  morte:        "border-purple-500/40 text-purple-400",
  sangue:       "border-red-500/40 text-red-400",
  medo:         "border-orange-500/40 text-orange-400",
};

const ELEMENTO_BG: Record<RitualElemento, string> = {
  conhecimento: "bg-blue-500/10",
  energia:      "bg-yellow-500/10",
  morte:        "bg-purple-500/10",
  sangue:       "bg-red-500/10",
  medo:         "bg-orange-500/10",
};

const ELEMENTO_LABELS: Record<RitualElemento, string> = {
  conhecimento: "Conhecimento", energia: "Energia", morte: "Morte", sangue: "Sangue", medo: "Medo",
};

const ELEMENTOS = Object.keys(ELEMENTO_LABELS) as RitualElemento[];

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
    <div className="space-y-4">
      {/* Rituais do agente */}
      {rituais.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhum ritual adicionado.</p>
      ) : (
        <div className="space-y-1">
          {rituais.map((r) => {
            const full = allRituais.find((x) => x.id === r.ritual_id);
            const expanded = expandedId === r.ritual_id;
            return (
              <div key={r.ritual_id} className={`rounded-sm border transition-colors ${expanded ? "border-border bg-muted/10" : "border-border"}`}>
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <button
                    type="button"
                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                    onClick={() => setExpandedId(expanded ? null : r.ritual_id)}
                  >
                    <span className={`text-sm font-medium truncate ${expanded ? "text-foreground" : "text-foreground/80"}`}>{r.nome}</span>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${ELEMENTO_COLORS[r.elemento as RitualElemento]}`}>
                      {ELEMENTO_LABELS[r.elemento as RitualElemento]}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground shrink-0">{r.circulo}° Círculo · {r.custo_pe} PE</span>
                  </button>
                  <Button type="button" variant="ghost" size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                    onClick={() => removeRitual(r.ritual_id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
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

      {/* Biblioteca */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Adicionar da Biblioteca</p>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar ritual…"
            className="pl-8 h-8 text-sm"
          />
          {busca && (
            <button type="button" onClick={() => setBusca("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filtro elemento */}
        <div className="flex gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFiltroEl("todos")}
            className={cn(
              "text-[11px] px-2.5 py-1 rounded-full border transition-colors font-medium",
              filtroEl === "todos"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
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
                "text-[11px] px-2.5 py-1 rounded-full border transition-colors font-medium",
                filtroEl === el
                  ? `${ELEMENTO_BG[el]} ${ELEMENTO_COLORS[el]} border-current`
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              {ELEMENTO_LABELS[el]}
            </button>
          ))}
        </div>

        {/* Filtro círculo */}
        {circulos.length > 1 && (
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setFiltroCirc("todos")}
              className={cn(
                "text-[11px] px-2.5 py-1 rounded-full border transition-colors font-medium",
                filtroCirc === "todos"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
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
                  "text-[11px] px-2.5 py-1 rounded-full border transition-colors font-medium",
                  filtroCirc === c
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                )}
              >
                {c}° Círculo
              </button>
            ))}
          </div>
        )}

        {/* Lista */}
        {available.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhum ritual encontrado.</p>
        ) : (
          <div className="space-y-1 max-h-[32rem] overflow-y-auto rounded-md border border-border">
            {available.map((r) => {
              const libExpanded = expandedLibId === r.id;
              return (
                <div key={r.id} className={`border-b border-border/50 last:border-0 transition-colors ${libExpanded ? "bg-muted/10" : ""}`}>
                  <div className="flex items-center gap-2 px-3 py-2.5 group/item">
                    <button
                      type="button"
                      className="flex items-center gap-2 flex-1 min-w-0 text-left"
                      onClick={() => setExpandedLibId(libExpanded ? null : r.id)}
                    >
                      <span className={`text-sm font-medium truncate ${libExpanded ? "text-foreground" : "text-foreground/80"}`}>{r.nome}</span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${ELEMENTO_COLORS[r.elemento as RitualElemento]}`}>
                        {ELEMENTO_LABELS[r.elemento as RitualElemento]}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {r.circulo}° Círculo · {CUSTO_PE[r.circulo as 1|2|3|4]} PE
                        {r.dt ? ` · DT ${r.dt}` : ""}
                      </span>
                    </button>
                    <Button type="button" variant="ghost" size="icon"
                      className="h-7 w-7 text-primary hover:text-primary shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity"
                      onClick={() => addRitual(r.id)}
                      title="Adicionar ritual">
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {libExpanded && (
                    <DetalhesRitual
                      execucao={r.execucao ?? undefined} alcance={r.alcance ?? undefined} alvo={r.alvo ?? undefined}
                      duracao={r.duracao ?? undefined} resistencia={r.resistencia ?? undefined}
                      dt={r.dt != null ? String(r.dt) : undefined} descricao={r.descricao ?? undefined}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

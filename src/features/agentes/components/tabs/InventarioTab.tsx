"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useItens } from "@/features/itens/hooks/useItens";
import { AgentInventarioItem, AgentSheet } from "@/shared/types/agent";
import { Item } from "@/shared/types/item";
import { cn } from "@/shared/lib/utils";
import { Package, Plus, Search, Trash2, X } from "lucide-react";
import { useState } from "react";

interface InventarioTabProps {
  data: AgentSheet;
  onChange: (patch: Partial<AgentSheet>) => void;
}

type FiltroCategoria = "todos" | "arma" | "protecao" | "geral";

const CATEGORIA_LABELS: Record<string, string> = {
  arma: "Arma", protecao: "Proteção", geral: "Geral",
};

const SUBCATEGORIA_LABELS: Record<string, string> = {
  simples: "Simples", tatica: "Tática", pesada: "Pesada",
  leve: "Leve", municao: "Munição", explosivo: "Explosivo",
  operacional: "Operacional", paranormal: "Paranormal",
};

const CREDITO_LABELS: Record<number, string> = {
  1: "Crédito 0", 2: "Crédito I", 3: "Crédito II", 4: "Crédito III",
};

const CATEGORIA_COLORS: Record<string, string> = {
  arma:     "border-red-500/40 text-red-400",
  protecao: "border-blue-500/40 text-blue-400",
  geral:    "border-muted-foreground/40 text-muted-foreground",
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
    return (
      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{item.descricao}</p>
    );
  }
  return null;
}

export function InventarioTab({ data, onChange }: InventarioTabProps) {
  const { data: allItens = [] } = useItens();
  const inventario = data.inventario ?? [];
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<FiltroCategoria>("todos");

  const totalEspacos = inventario.reduce((sum, i) => sum + (i.espacos ?? 0), 0);
  const cargaMax = data.carga_max || 0;
  const cargaPct = cargaMax > 0 ? Math.min((totalEspacos / cargaMax) * 100, 100) : 0;
  const overloaded = cargaMax > 0 && totalEspacos > cargaMax;

  // Recalcula defesa_equip somando todas as proteções no inventário
  const calcDefesaEquip = (inv: AgentInventarioItem[]) => {
    return inv.reduce((sum, entry) => {
      const [cat] = entry.categoria.split("·");
      if (cat !== "protecao") return sum;
      const full = allItens.find((x) => x.id === entry.item_id);
      const val = parseInt(full?.protecao_valor ?? "0", 10);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  };

  const addItem = (item: Item) => {
    const entry: AgentInventarioItem = {
      item_id: item.id,
      nome: item.nome,
      categoria: item.categoria + (item.subcategoria ? `·${item.subcategoria}` : ""),
      espacos: item.espacos,
    };
    const newInv = [...inventario, entry];
    onChange({ inventario: newInv, defesa_equip: calcDefesaEquip(newInv) });
  };

  const removeItem = (idx: number) => {
    const newInv = inventario.filter((_, i) => i !== idx);
    onChange({ inventario: newInv, defesa_equip: calcDefesaEquip(newInv) });
  };

  const itensDisponiveis = allItens.filter((item) => {
    if (filtro !== "todos" && item.categoria !== filtro) return false;
    if (busca.trim()) {
      const q = busca.toLowerCase();
      return (
        item.nome.toLowerCase().includes(q) ||
        (item.descricao ?? "").toLowerCase().includes(q) ||
        (item.subcategoria ?? "").toLowerCase().includes(q) ||
        (item.especial ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Group library items by subcategoria
  const grouped = itensDisponiveis.reduce<Record<string, Item[]>>((acc, item) => {
    const key = item.subcategoria ?? "outros";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Carga */}
      <div className="rounded-md bg-muted/30 px-4 py-3 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground flex-1">Carga</span>
          <span className={cn("font-semibold tabular-nums", overloaded && "text-destructive")}>
            {totalEspacos}{cargaMax > 0 ? ` / ${cargaMax}` : ""} espaços
          </span>
          {overloaded && <span className="text-[10px] text-destructive font-medium">SOBRECARREGADO</span>}
        </div>
        {cargaMax > 0 && (
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", overloaded ? "bg-destructive" : "bg-primary")}
              style={{ width: `${cargaPct}%` }}
            />
          </div>
        )}
      </div>

      {/* Inventário atual */}
      {inventario.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">Inventário vazio.</p>
      ) : (
        <div className="space-y-1">
          {inventario.map((inv, idx) => {
            const [cat, sub] = inv.categoria.split("·");
            const full = allItens.find((x) => x.id === inv.item_id);
            return (
              <div key={idx} className="group flex items-start gap-2 rounded-sm border border-border px-3 py-2.5 hover:bg-muted/20 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{inv.nome}</span>
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 shrink-0", CATEGORIA_COLORS[cat])}>
                      {CATEGORIA_LABELS[cat] ?? cat}
                      {sub && ` · ${SUBCATEGORIA_LABELS[sub] ?? sub}`}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {inv.espacos} espaço{inv.espacos !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {full && <ItemStats item={full} />}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
                  onClick={() => removeItem(idx)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Biblioteca */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Adicionar da Biblioteca</p>

        {/* Busca + filtro categoria */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar item…"
              className="pl-8 h-8 text-sm"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-1.5 flex-wrap">
          {(["todos", "arma", "protecao", "geral"] as FiltroCategoria[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltro(f)}
              className={cn(
                "text-[11px] px-2.5 py-1 rounded-full border transition-colors font-medium",
                filtro === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              {f === "todos" ? "Todos" : CATEGORIA_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Lista agrupada */}
        {itensDisponiveis.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhum item encontrado.</p>
        ) : (
          <div className="rounded-md border border-border overflow-hidden max-h-[28rem] overflow-y-auto">
            {(busca || filtro !== "todos"
              ? [{ sub: null, items: itensDisponiveis }]
              : Object.entries(grouped).map(([sub, items]) => ({ sub, items }))
            ).map(({ sub, items }) => (
              <div key={sub ?? "all"}>
                {sub && (
                  <div className="px-3 py-1.5 bg-muted/40 border-b border-border/50 sticky top-0">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {SUBCATEGORIA_LABELS[sub] ?? sub}
                    </span>
                  </div>
                )}
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2 px-3 py-2.5 border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors group/item"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{item.nome}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {item.espacos} espaço{item.espacos !== 1 ? "s" : ""}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60">
                          {CREDITO_LABELS[item.credito_tier]}
                        </span>
                      </div>
                      <ItemStats item={item} />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-primary hover:text-primary shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity mt-0.5"
                      onClick={() => addItem(item)}
                      title="Adicionar ao inventário"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

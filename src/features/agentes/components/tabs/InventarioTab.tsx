"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useItens } from "@/features/itens/hooks/useItens";
import { AgentInventarioItem, AgentSheet } from "@/shared/types/agent";
import { Item } from "@/shared/types/item";
import { cn } from "@/shared/lib/utils";
import { BookOpenCheck, Package, Plus, Search, Trash2, X } from "lucide-react";
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
      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{item.descricao}</p>
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

  return (
    <div className="space-y-6">
      <div className="space-y-2 border border-border bg-muted/20 p-4">
        <div className="flex items-center gap-2 text-sm">
          <Package className="h-4 w-4 text-primary" />
          <span className="flex-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Carga</span>
          <span className={cn("font-semibold tabular-nums", overloaded && "text-destructive")}>
            {totalEspacos}{cargaMax > 0 ? ` / ${cargaMax}` : ""} espaços
          </span>
          {overloaded && <span className="text-[10px] font-medium text-destructive">SOBRECARREGADO</span>}
        </div>
        {cargaMax > 0 && (
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", overloaded ? "bg-destructive" : "bg-primary")}
              style={{ width: `${cargaPct}%` }}
            />
          </div>
        )}
        <p className="text-xs leading-relaxed text-muted-foreground">
          A carga máxima vem da Força. Proteções adicionadas aqui atualizam automaticamente o bônus de defesa da ficha.
        </p>
      </div>

      <section className="space-y-3 border border-border bg-muted/20 p-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpenCheck className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Biblioteca de itens</p>
          </div>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Adicione armas, proteções e equipamentos já catalogados. O card mostra custo de carga, crédito e regras principais.
          </p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar item, categoria, efeito ou descrição..."
            className="h-10 pl-9"
          />
          {busca && (
            <button
              type="button"
              onClick={() => setBusca("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {(["todos", "arma", "protecao", "geral"] as FiltroCategoria[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltro(f)}
              className={cn(
                "border px-2.5 py-1 text-[11px] font-medium transition-colors",
                filtro === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              {f === "todos" ? "Todos" : CATEGORIA_LABELS[f]}
            </button>
          ))}
        </div>

        {itensDisponiveis.length === 0 ? (
          <div className="border border-dashed border-border py-10 text-center">
            <Package className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhum item encontrado.</p>
          </div>
        ) : (
          <div className="grid max-h-[28rem] gap-3 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
            {itensDisponiveis.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => addItem(item)}
                className="group border border-border bg-background p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/[0.03]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold leading-tight">{item.nome}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {item.espacos} espaço{item.espacos !== 1 ? "s" : ""} · {CREDITO_LABELS[item.credito_tier]}
                    </p>
                  </div>
                  <span className="shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    <Plus className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge variant="outline" className={cn("rounded-none px-1.5 py-0 text-[10px]", CATEGORIA_COLORS[item.categoria])}>
                    {CATEGORIA_LABELS[item.categoria] ?? item.categoria}
                  </Badge>
                  {item.subcategoria && (
                    <Badge variant="outline" className="rounded-none px-1.5 py-0 text-[10px]">
                      {SUBCATEGORIA_LABELS[item.subcategoria] ?? item.subcategoria}
                    </Badge>
                  )}
                </div>
                <ItemStats item={item} />
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Itens na ficha</p>
        </div>

        {inventario.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-border py-12 text-center">
            <Package className="mb-3 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Inventário vazio. Use a biblioteca acima para começar.</p>
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {inventario.map((inv, idx) => {
              const [cat, sub] = inv.categoria.split("·");
              const full = allItens.find((x) => x.id === inv.item_id);
              return (
                <div key={idx} className="group border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/20">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold leading-tight">{inv.nome}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        {inv.espacos} espaço{inv.espacos !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-destructive opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      onClick={() => removeItem(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge variant="outline" className={cn("rounded-none px-1.5 py-0 text-[10px]", CATEGORIA_COLORS[cat])}>
                      {CATEGORIA_LABELS[cat] ?? cat}
                    </Badge>
                    {sub && (
                      <Badge variant="outline" className="rounded-none px-1.5 py-0 text-[10px]">
                        {SUBCATEGORIA_LABELS[sub] ?? sub}
                      </Badge>
                    )}
                  </div>
                  {full && <ItemStats item={full} />}
                  {!full && (
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      Item manual. Cadastre na biblioteca para exibir descrição, dano, proteção e outros detalhes.
                    </p>
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

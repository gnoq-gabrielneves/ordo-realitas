"use client";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useDeleteItem, useItens } from "@/features/itens/hooks/useItens";
import { Item } from "@/shared/types/item";
import { Package, Pencil, Plus, Search, Shield, Sword } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const CATEGORIA_LABELS: Record<string, string> = {
  arma: "Arma",
  protecao: "Proteção",
  geral: "Geral",
};

const SUBCATEGORIA_LABELS: Record<string, string> = {
  simples: "Simples",
  tatica: "Tática",
  pesada: "Pesada",
  leve: "Leve",
};

const TIER_LABELS: Record<number, string> = { 1: "I", 2: "II", 3: "III", 4: "IV" };

function CategoryIcon({ cat }: { cat: string }) {
  if (cat === "arma") return <Sword className="h-3.5 w-3.5" />;
  if (cat === "protecao") return <Shield className="h-3.5 w-3.5" />;
  return <Package className="h-3.5 w-3.5" />;
}

function ItemRow({ item }: { item: Item }) {
  const del = useDeleteItem();

  return (
    <div className="flex items-start gap-4 rounded-sm border border-border bg-card px-4 py-3 hover:bg-muted/30 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{item.nome}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1">
            <CategoryIcon cat={item.categoria} />
            {CATEGORIA_LABELS[item.categoria]}
            {item.subcategoria && ` · ${SUBCATEGORIA_LABELS[item.subcategoria] ?? item.subcategoria}`}
          </Badge>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            Crédito {TIER_LABELS[item.credito_tier]}
          </Badge>
          <span className="text-[10px] text-muted-foreground">{item.espacos} espaço{item.espacos !== 1 ? "s" : ""}</span>
        </div>

        {/* Stats de arma */}
        {item.categoria === "arma" && (item.dano || item.teste || item.critico || item.alcance) && (
          <div className="mt-1.5 flex gap-3 flex-wrap text-xs text-muted-foreground">
            {item.teste && <span>Teste: <span className="text-foreground font-medium">{item.teste}</span></span>}
            {item.dano && <span>Dano: <span className="text-foreground font-medium">{item.dano}</span></span>}
            {item.critico && <span>Crítico: <span className="text-foreground font-medium">{item.critico}</span></span>}
            {item.alcance && <span>Alcance: <span className="text-foreground font-medium">{item.alcance}</span></span>}
          </div>
        )}

        {/* Stats de proteção */}
        {item.categoria === "protecao" && (item.protecao_valor || item.penalidade) && (
          <div className="mt-1.5 flex gap-3 flex-wrap text-xs text-muted-foreground">
            {item.protecao_valor && <span>Proteção: <span className="text-foreground font-medium">{item.protecao_valor}</span></span>}
            {item.penalidade && <span>Penalidade: <span className="text-foreground font-medium">{item.penalidade}</span></span>}
          </div>
        )}

        {item.especial && (
          <p className="mt-1 text-xs text-muted-foreground">{item.especial}</p>
        )}
        {item.descricao && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{item.descricao}</p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
          <Link href={`/itens/${item.id}/editar`}>
            <Pencil className="h-3.5 w-3.5" />
          </Link>
        </Button>
        <ConfirmDialog
          title="Excluir item"
          description={`Tem certeza que deseja excluir "${item.nome}"? Itens em fichas de agentes não serão afetados.`}
          onConfirm={() => del.mutate(item.id)}
          disabled={del.isPending}
        >
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </Button>
        </ConfirmDialog>
      </div>
    </div>
  );
}

const FILTROS = ["todos", "arma", "protecao", "geral"] as const;
type Filtro = typeof FILTROS[number];

export function ItensPage() {
  const { data: itens = [], isLoading } = useItens();
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busca, setBusca] = useState("");

  const filtered = itens.filter((i) => {
    if (filtro !== "todos" && i.categoria !== filtro) return false;
    if (busca && !i.nome.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
        <h1 className="text-sm font-semibold tracking-wide">Banco de Itens</h1>
        <Button size="sm" asChild>
          <Link href="/itens/novo">
            <Plus className="h-4 w-4 mr-1.5" />
            Novo Item
          </Link>
        </Button>
      </div>

      {/* Filtros + busca */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-6 py-3">
        <div className="flex gap-1">
          {FILTROS.map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1 rounded-sm text-xs font-medium transition-colors ${
                filtro === f
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {f === "todos" ? "Todos" : CATEGORIA_LABELS[f]}
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar item..."
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Package className="h-8 w-8 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              {itens.length === 0 ? "Nenhum item cadastrado ainda." : "Nenhum item encontrado."}
            </p>
            {itens.length === 0 && (
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link href="/itens/novo">Criar primeiro item</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-3">{filtered.length} {filtered.length === 1 ? "item" : "itens"}</p>
            {filtered.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

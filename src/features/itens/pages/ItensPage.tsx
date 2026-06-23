"use client";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useDeleteItem, useItens } from "@/features/itens/hooks/useItens";
import { Item } from "@/shared/types/item";
import { cn } from "@/shared/lib/utils";
import { BookOpenCheck, Package, Pencil, Plus, Search, Shield, Sparkles, Sword } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

const CATEGORIA_LABELS: Record<string, string> = {
  arma: "Arma",
  protecao: "Proteção",
  geral: "Geral",
  municao: "Munição",
  modificacao: "Modificação",
};

const SUBCATEGORIA_LABELS: Record<string, string> = {
  simples: "Simples",
  tatica: "Tática",
  pesada: "Pesada",
  leve: "Leve",
  escudo: "Escudo",
  acessorio: "Acessório",
  explosivo: "Explosivo",
  operacional: "Operacional",
  paranormal: "Paranormal",
  municao: "Munição",
};

const TIER_LABELS: Record<number, string> = { 0: "0", 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI" };

function CategoryIcon({ cat }: { cat: string }) {
  if (cat === "arma") return <Sword className="h-3.5 w-3.5" />;
  if (cat === "protecao") return <Shield className="h-3.5 w-3.5" />;
  if (cat === "modificacao") return <Sparkles className="h-3.5 w-3.5" />;
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
            Cat. {TIER_LABELS[item.categoria_valor ?? item.credito_tier ?? 0]}
          </Badge>
          {item.oficial && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              <BookOpenCheck className="h-3 w-3" />
              Oficial
            </Badge>
          )}
          <span className="text-[10px] text-muted-foreground">
            {item.espacos_texto ?? item.espacos} espaço{item.espacos !== 1 || item.espacos_texto ? "s" : ""}
          </span>
        </div>

        {/* Stats de arma */}
        {item.categoria === "arma" && (item.dano || item.teste || item.critico || item.alcance) && (
          <div className="mt-1.5 flex gap-3 flex-wrap text-xs text-muted-foreground">
            {item.teste && <span>Teste: <span className="text-foreground font-medium">{item.teste}</span></span>}
            {item.dano && <span>Dano: <span className="text-foreground font-medium">{item.dano}</span></span>}
            {item.critico && <span>Crítico: <span className="text-foreground font-medium">{item.critico}</span></span>}
            {item.alcance && <span>Alcance: <span className="text-foreground font-medium">{item.alcance}</span></span>}
            {item.tipo_dano && <span>Tipo: <span className="text-foreground font-medium">{item.tipo_dano}</span></span>}
          </div>
        )}

        {/* Stats de proteção */}
        {item.categoria === "protecao" && (item.protecao_valor || item.penalidade) && (
          <div className="mt-1.5 flex gap-3 flex-wrap text-xs text-muted-foreground">
            {item.protecao_valor && <span>Proteção: <span className="text-foreground font-medium">{item.protecao_valor}</span></span>}
            {item.rd && <span>RD: <span className="text-foreground font-medium">{item.rd}</span></span>}
            {item.penalidade && <span>Penalidade: <span className="text-foreground font-medium">{item.penalidade}</span></span>}
          </div>
        )}

        {(item.categoria === "geral" || item.categoria === "municao" || item.categoria === "modificacao") && (
          <div className="mt-1.5 flex gap-3 flex-wrap text-xs text-muted-foreground">
            {item.bonus_pericia && <span>Bônus: <span className="text-foreground font-medium">{item.bonus_pericia}</span></span>}
            {item.acao_uso && <span>Ação: <span className="text-foreground font-medium">{item.acao_uso}</span></span>}
            {item.dt && <span>DT: <span className="text-foreground font-medium">{item.dt}</span></span>}
            {item.duracao && <span>Duração: <span className="text-foreground font-medium">{item.duracao}</span></span>}
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
        {!item.oficial && (
          <>
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
          </>
        )}
        {item.oficial && (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" disabled title="Item oficial do catálogo">
            <BookOpenCheck className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

const FILTROS = ["todos", "arma", "protecao", "geral", "municao", "modificacao"] as const;
type Filtro = typeof FILTROS[number];

export function ItensPage() {
  const { data: itens = [], isLoading } = useItens();
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busca, setBusca] = useState("");

  const filtered = itens.filter((i) => {
    if (filtro !== "todos" && i.categoria !== filtro) return false;
    if (busca) {
      const q = busca.toLowerCase();
      const text = [
        i.nome,
        i.categoria,
        i.subcategoria,
        i.descricao,
        i.especial,
        i.dano,
        i.tipo_dano,
        i.bonus_pericia,
        i.requisitos,
      ].filter(Boolean).join(" ").toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  const stats = useMemo(() => ({
    total: itens.length,
    oficiais: itens.filter((item) => item.oficial).length,
    armas: itens.filter((item) => item.categoria === "arma").length,
    utilitarios: itens.filter((item) => item.categoria === "geral" || item.categoria === "municao").length,
  }), [itens]);

  return (
    <main className="flex-1 overflow-y-auto">
      <section className="border-b border-border bg-background px-5 py-8 lg:px-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="border border-border bg-card px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Arsenal da Ordo
              </span>
              <span className="border border-primary/25 bg-primary/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                Equipamentos
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Itens</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Catalogue armas, proteções, munições, modificações e equipamentos gerais para montar inventários de agentes sem consultar a tabela no meio da sessão.
            </p>
          </div>

          <Button asChild>
          <Link href="/itens/novo">
            <Plus className="h-4 w-4" />
            Novo item
          </Link>
        </Button>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Itens" value={stats.total} icon={<Package className="h-4 w-4" />} />
          <Stat label="Oficiais" value={stats.oficiais} icon={<BookOpenCheck className="h-4 w-4" />} />
          <Stat label="Armas" value={stats.armas} icon={<Sword className="h-4 w-4" />} />
          <Stat label="Utilitários" value={stats.utilitarios} icon={<Shield className="h-4 w-4" />} />
        </div>
      </section>

      {/* Filtros + busca */}
      <section className="flex shrink-0 flex-col gap-3 border-b border-border px-5 py-4 lg:px-8 xl:flex-row xl:items-center">
        <div className="flex gap-1">
          {FILTROS.map((f) => (
            <button
              type="button"
              key={f}
              onClick={() => setFiltro(f)}
              className={cn("px-3 py-2 text-sm transition-colors border", 
                filtro === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {f === "todos" ? "Todos" : CATEGORIA_LABELS[f]}
            </button>
          ))}
        </div>
        <div className="relative w-full xl:ml-auto xl:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar item, efeito, dano, perícia..."
            className="pl-9"
          />
        </div>
      </section>

      {/* Lista */}
      <section className="px-5 py-6 lg:px-8">
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
      </section>
    </main>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <div className="border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

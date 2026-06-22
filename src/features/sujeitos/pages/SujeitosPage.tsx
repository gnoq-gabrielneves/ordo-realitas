"use client";

import { SujeitoCard } from "@/features/sujeitos/components/SujeitoCard";
import { useSujeitos } from "@/features/sujeitos/hooks/useSujeitos";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { Npc } from "@/shared/types/npc";
import { BookOpenCheck, PlusIcon, Search, Skull, Sparkles, Swords, UserRound } from "lucide-react";
import Link from "next/link";
import { ReactNode, useMemo, useState } from "react";

type Filtro = "todos" | "pessoa" | "criatura" | "combate" | "rituais";

const FILTERS: { id: Filtro; label: string; icon: ReactNode }[] = [
  { id: "todos", label: "Todos", icon: <BookOpenCheck className="h-3.5 w-3.5" /> },
  { id: "pessoa", label: "Pessoas", icon: <UserRound className="h-3.5 w-3.5" /> },
  { id: "criatura", label: "Criaturas", icon: <Skull className="h-3.5 w-3.5" /> },
  { id: "combate", label: "Prontos p/ combate", icon: <Swords className="h-3.5 w-3.5" /> },
  { id: "rituais", label: "Com rituais", icon: <Sparkles className="h-3.5 w-3.5" /> },
];

export function SujeitosPage() {
  const { data: sujeitos = [], isLoading, isError } = useSujeitos();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filtro>("todos");

  const isCriatura = (s: Npc) => s.tipo === "criatura";
  const hasCombat = (s: Npc) => s.defesa != null || s.pv != null || s.acoes.length > 0 || s.habilidades.length > 0;

  const stats = useMemo(() => ({
    total: sujeitos.length,
    pessoas: sujeitos.filter((s) => !isCriatura(s)).length,
    criaturas: sujeitos.filter(isCriatura).length,
    combate: sujeitos.filter(hasCombat).length,
    rituais: sujeitos.filter((s) => s.rituais.length > 0).length,
  }), [sujeitos]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sujeitos.filter((s) => {
      if (filter === "pessoa" && isCriatura(s)) return false;
      if (filter === "criatura" && !isCriatura(s)) return false;
      if (filter === "combate" && !hasCombat(s)) return false;
      if (filter === "rituais" && s.rituais.length === 0) return false;
      if (!q) return true;
      return [
        s.name,
        s.tipo,
        s.tamanho,
        s.origem,
        s.descricao,
        s.backstory,
        s.percepcao,
        s.iniciativa,
        s.fortitude,
        s.reflexos,
        s.vontade,
        ...s.pericias.map((p) => `${p.nome} ${p.bonus}`),
        ...s.habilidades.map((h) => `${h.nome} ${h.descricao}`),
        ...s.acoes.map((a) => `${a.nome} ${a.descricao} ${a.dano ?? ""}`),
        ...s.rituais.map((r) => `${r.nome} ${r.elemento} ${r.descricao}`),
      ].some((value) => value?.toLowerCase().includes(q));
    });
  }, [filter, search, sujeitos]);

  const filterCounts: Record<Filtro, number> = {
    todos: stats.total,
    pessoa: stats.pessoas,
    criatura: stats.criaturas,
    combate: stats.combate,
    rituais: stats.rituais,
  };

  return (
    <>
      <AppHeader title="Sujeitos" />
      <main className="flex-1 overflow-y-auto">
        <section className="border-b border-border bg-background px-6 py-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="border border-border bg-muted/30 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Arquivo de ameaças
                </span>
                <span className="border border-primary/30 bg-primary/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Pessoas e criaturas
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">Registro de Sujeitos</h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Catalogue suspeitos, aliados, vítimas, monstros e ameaças prontas para entrar em cena.
              </p>
            </div>
            <Button asChild>
              <Link href="/sujeitos/novo">
                <PlusIcon className="h-4 w-4" />
                Novo Sujeito
              </Link>
            </Button>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-5">
            <StatCard icon={<BookOpenCheck className="h-4 w-4" />} label="Total" value={stats.total} />
            <StatCard icon={<UserRound className="h-4 w-4" />} label="Pessoas" value={stats.pessoas} />
            <StatCard icon={<Skull className="h-4 w-4" />} label="Criaturas" value={stats.criaturas} danger />
            <StatCard icon={<Swords className="h-4 w-4" />} label="Combate" value={stats.combate} />
            <StatCard icon={<Sparkles className="h-4 w-4" />} label="Rituais" value={stats.rituais} />
          </div>
        </section>

        <section className="border-b border-border bg-muted/15 px-6 py-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative max-w-xl flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, origem, ritual, ação, perícia..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 border px-3 py-2 text-xs font-medium transition-colors",
                    filter === item.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
                  )}
                >
                  {item.icon}
                  {item.label}
                  <span className={cn(
                    "ml-0.5 px-1.5 py-0.5 text-[10px]",
                    filter === item.id ? "bg-primary-foreground/15 text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}>
                    {filterCounts[item.id]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium text-foreground">
              {filtered.length} {filtered.length === 1 ? "registro encontrado" : "registros encontrados"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isLoading ? "Carregando..." : "Use os cards como consulta rápida durante a sessão."}
            </p>
          </div>
        </div>

        {isError && (
          <div className="border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">Erro ao carregar registros.</p>
          </div>
        )}

        {!isLoading && sujeitos.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-border py-16 text-center">
            <Skull className="mb-3 h-8 w-8 text-muted-foreground/30" />
            <p className="mb-4 text-sm text-muted-foreground">Nenhum sujeito catalogado ainda.</p>
            <Button asChild>
              <Link href="/sujeitos/novo">
                <PlusIcon className="h-4 w-4" />
                Novo Sujeito
              </Link>
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-dashed border-border py-12 text-center">
            <Search className="mx-auto mb-3 h-7 w-7 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {search ? `Nenhum sujeito encontrado para "${search}".` : "Nenhum sujeito neste filtro."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((s) => (
              <SujeitoCard key={s.id} sujeito={s} />
            ))}
          </div>
        )}
        </section>
      </main>
    </>
  );
}

function StatCard({ icon, label, value, danger }: { icon: ReactNode; label: string; value: number; danger?: boolean }) {
  return (
    <div className={cn("border bg-card p-4", danger ? "border-red-500/25 bg-red-500/[0.025]" : "border-border")}>
      <p className={cn("flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground", danger && "text-red-500")}>
        {icon}{label}
      </p>
      <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

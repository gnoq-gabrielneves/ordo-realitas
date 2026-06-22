"use client";

import { LugarCard } from "@/features/lugares/components/LugarCard";
import { useLugares } from "@/features/lugares/hooks/useLugares";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { Place } from "@/shared/types/place";
import { FolderTree, MapPin, PlusIcon, RadioTower, Search, Waypoints } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

type LugarFilter = "todos" | "raiz" | "sub" | "paranormal" | "pontos";

const filters: { value: LugarFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "raiz", label: "Locais raiz" },
  { value: "sub", label: "Sub-lugares" },
  { value: "paranormal", label: "Paranormal" },
  { value: "pontos", label: "Com pontos" },
];

export function LugaresPage() {
  const { data: lugares = [], isLoading, isError } = useLugares();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<LugarFilter>("todos");

  const subCountByParent = useMemo(() => {
    const count = new Map<string, number>();
    lugares.forEach((lugar) => {
      if (!lugar.parent_id) return;
      count.set(lugar.parent_id, (count.get(lugar.parent_id) ?? 0) + 1);
    });
    return count;
  }, [lugares]);

  const filtered = useMemo(() => {
    const term = normalize(search);

    return lugares
      .filter((lugar) => {
        if (activeFilter === "raiz") return lugar.parent_id === null;
        if (activeFilter === "sub") return lugar.parent_id !== null;
        if (activeFilter === "paranormal") {
          return Boolean(
            lugar.origem ||
            lugar.membrana === "enfraquecida" ||
            lugar.membrana === "rompida" ||
            (lugar.atividade_paranormal && lugar.atividade_paranormal !== "nenhuma")
          );
        }
        if (activeFilter === "pontos") return lugar.pontos_de_interesse.length > 0;
        return true;
      })
      .filter((lugar) => !term || normalize(searchableText(lugar)).includes(term));
  }, [activeFilter, lugares, search]);

  const raizCount = lugares.filter((l) => l.parent_id === null).length;
  const subCount = lugares.length - raizCount;
  const paranormalCount = lugares.filter((l) =>
    l.origem ||
    l.membrana === "enfraquecida" ||
    l.membrana === "rompida" ||
    (l.atividade_paranormal && l.atividade_paranormal !== "nenhuma")
  ).length;
  const pontosCount = lugares.reduce((total, lugar) => total + lugar.pontos_de_interesse.length, 0);

  return (
    <main className="flex-1 overflow-y-auto">
      <section className="border-b border-border bg-background px-5 py-8 lg:px-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="border border-border bg-card px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Cartografia da Ordo
              </span>
              <span className="border border-primary/25 bg-primary/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                Arquivo de campo
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Lugares</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Catalogue locais de investigação, sub-lugares, pontos de interesse, testes escondidos e sinais da Membrana para conduzir cenas sem se perder no meio da sessão.
            </p>
          </div>

          <Button asChild>
            <Link href="/lugares/novo">
              <PlusIcon className="h-4 w-4" />
              Novo lugar
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={<MapPin className="h-4 w-4" />} label="Lugares" value={lugares.length} detail={`${raizCount} raiz`} />
          <StatCard icon={<FolderTree className="h-4 w-4" />} label="Sub-lugares" value={subCount} detail="camadas internas" />
          <StatCard icon={<RadioTower className="h-4 w-4" />} label="Sinais paranormais" value={paranormalCount} detail="atividade ou Membrana" />
          <StatCard icon={<Waypoints className="h-4 w-4" />} label="Pontos" value={pontosCount} detail="pistas e testes" />
        </div>
      </section>

      <section className="border-b border-border px-5 py-4 lg:px-8">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, local, atmosfera, ponto de interesse..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  "border border-border px-3 py-2 text-sm transition-colors hover:border-primary/40 hover:text-foreground",
                  activeFilter === filter.value
                    ? "border-primary bg-primary text-primary-foreground hover:text-primary-foreground"
                    : "bg-card text-muted-foreground"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-6 lg:px-8">
        {isError && <p className="text-sm text-destructive">Erro ao carregar registros.</p>}

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="h-44 animate-pulse border border-border bg-muted/40" />
            ))}
          </div>
        ) : lugares.length === 0 ? (
          <EmptyState />
        ) : filtered.length === 0 ? (
          <div className="border border-dashed border-border py-14 text-center">
            <p className="text-sm text-muted-foreground">Nenhum lugar encontrado com esses filtros.</p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "registro encontrado" : "registros encontrados"}
            </p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((lugar) => (
                <LugarCard key={lugar.id} lugar={lugar} subCount={subCountByParent.get(lugar.id) ?? 0} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function searchableText(lugar: Place) {
  return [
    lugar.name,
    lugar.tipo,
    lugar.localizacao,
    lugar.descricao,
    lugar.atmosfera,
    lugar.backstory,
    lugar.origem,
    lugar.membrana,
    lugar.atividade_paranormal,
    lugar.notas,
    lugar.segredos,
    ...lugar.pontos_de_interesse.flatMap((ponto) => [
      ponto.nome,
      ponto.descricao,
      ...(ponto.testes ?? []).flatMap((teste) => [
        teste.pericia,
        teste.dt,
        teste.descricao,
        teste.sucesso,
        teste.falha,
      ]),
    ]),
  ].filter(Boolean).join(" ");
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function StatCard({ icon, label, value, detail }: { icon: ReactNode; label: string; value: number; detail: string }) {
  return (
    <div className="border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-border py-16 text-center">
      <MapPin className="mb-3 h-8 w-8 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground">Nenhum lugar catalogado ainda.</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Comece pelo local principal da missão e depois crie salas, áreas, esconderijos e pontos de investigação como sub-lugares.
      </p>
      <Button asChild size="sm" className="mt-5">
        <Link href="/lugares/novo">
          <PlusIcon className="h-3.5 w-3.5" />
          Novo lugar
        </Link>
      </Button>
    </div>
  );
}

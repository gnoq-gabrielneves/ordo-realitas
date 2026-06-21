"use client";

import { useCampanhas } from "@/features/campanhas/hooks/useCampanhas";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Campanha } from "@/shared/types/campaign";
import { BookOpen, FileText, PlusIcon, Search, ShieldAlert, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

function Stat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-muted-foreground">{icon}</div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Arquivo</span>
      </div>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
    </div>
  );
}

function CampaignOperationCard({ campanha }: { campanha: Campanha }) {
  const hasPrep = Boolean(campanha.synopsis || campanha.historico || campanha.notas);

  return (
    <Link href={`/campanhas/${campanha.id}`} className="group grid gap-4 border border-border bg-card p-4 hover:border-primary/40 sm:grid-cols-[88px_1fr]">
      <div className="relative flex aspect-square h-22 w-22 items-center justify-center overflow-hidden border border-border bg-muted text-muted-foreground">
        {campanha.image_url ? (
          <Image src={campanha.image_url} alt={campanha.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <BookOpen className="h-7 w-7" />
        )}
      </div>

      <div className="min-w-0">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold group-hover:text-primary">{campanha.name}</h2>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              NEX {campanha.nex_inicial}% / {campanha.nex_final}%
            </p>
          </div>
          <Badge variant={hasPrep ? "outline" : "secondary"} className="rounded-sm text-[10px] uppercase tracking-wider">
            {hasPrep ? "Preparada" : "Rascunho"}
          </Badge>
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {campanha.synopsis || campanha.historico || "Sem sinopse cadastrada. Adicione um resumo para lembrar rapidamente o tom e a premissa da operação."}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {campanha.vilao && (
            <span className="border border-destructive/25 bg-destructive/5 px-2 py-1 text-[10px] uppercase tracking-wider text-destructive">
              Antagonista: {campanha.vilao}
            </span>
          )}
          {campanha.notas && (
            <span className="border border-border bg-muted/40 px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              Notas do mestre
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function CampanhasPage() {
  const { data: campanhas = [], isLoading } = useCampanhas();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return campanhas;
    return campanhas.filter((c) =>
      c.name.toLowerCase().includes(term) ||
      (c.vilao ?? "").toLowerCase().includes(term) ||
      (c.synopsis ?? "").toLowerCase().includes(term)
    );
  }, [campanhas, search]);

  const withVillain = campanhas.filter((c) => c.vilao).length;
  const withNotes = campanhas.filter((c) => c.notas || c.synopsis || c.historico).length;

  return (
    <>
      <AppHeader title="Campanhas" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          <section className="flex flex-col justify-between gap-4 border border-border bg-card p-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary/75">Arquivo de operações</p>
              <h1 className="mt-2 text-2xl font-semibold">Campanhas</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Organize arcos narrativos, antagonistas, progresso de NEX e missões que vão guiar as próximas sessões.
              </p>
            </div>
            <Button asChild className="w-full shrink-0 lg:w-auto" size="sm">
              <Link href="/campanhas/nova">
                <PlusIcon className="h-3.5 w-3.5" />
                Nova campanha
              </Link>
            </Button>
          </section>

          <section className="grid gap-3 sm:grid-cols-3">
            <Stat label="Campanhas" value={campanhas.length} icon={<BookOpen className="h-4 w-4" />} />
            <Stat label="Com antagonista" value={withVillain} icon={<ShieldAlert className="h-4 w-4" />} />
            <Stat label="Com preparo" value={withNotes} icon={<FileText className="h-4 w-4" />} />
          </section>

          <section className="flex flex-col gap-3 border border-border bg-card p-3 md:flex-row md:items-center md:justify-between">
            <div className="relative md:w-96">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, sinopse ou antagonista..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-8 text-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "operação encontrada" : "operações encontradas"}
            </p>
          </section>

          {isLoading && (
            <div className="grid gap-3 xl:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-36 animate-pulse border border-border bg-muted/40" />
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center border border-dashed border-border py-24 text-center text-muted-foreground">
              <Sparkles className="mb-3 h-8 w-8" />
              <p className="text-sm font-medium">Nenhuma campanha encontrada.</p>
              <p className="mt-1 text-xs">Crie uma operação ou ajuste a busca.</p>
            </div>
          )}

          {!isLoading && filtered.length > 0 && (
            <div className="grid gap-3 xl:grid-cols-2">
              {filtered.map((c) => <CampaignOperationCard key={c.id} campanha={c} />)}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

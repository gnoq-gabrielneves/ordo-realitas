"use client";

import { useDeleteRitual, useRituais } from "@/features/rituais/hooks/useRituais";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { ELEMENTO_BADGE, ELEMENTO_LABELS, ELEMENTOS } from "@/shared/constants/elements";
import { CUSTO_PE, Ritual } from "@/shared/types/ritual";
import { BookOpenCheck, Clock, Pencil, Plus, Search, Sparkles, Trash2, WandSparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

const CIRCULO_LABEL: Record<number, string> = { 1: "1°", 2: "2°", 3: "3°", 4: "4°" };

function RitualCard({ ritual }: { ritual: Ritual }) {
  const del = useDeleteRitual();
  const custo = ritual.custo_pe ?? CUSTO_PE[ritual.circulo as 1 | 2 | 3 | 4];

  return (
    <div className="border border-border bg-card p-4 transition-colors hover:border-primary/35 hover:bg-accent/20">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-semibold text-foreground">{ritual.nome}</h2>
            <Badge variant="outline" className={`text-[10px] uppercase tracking-[0.14em] ${ELEMENTO_BADGE[ritual.elemento]}`}>
              {ELEMENTO_LABELS[ritual.elemento]}
            </Badge>
            <Badge variant="secondary" className="text-[10px] uppercase tracking-[0.14em]">
              {CIRCULO_LABEL[ritual.circulo]} círculo
            </Badge>
            {ritual.oficial && (
              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.14em]">
                <BookOpenCheck className="h-3 w-3" />
                Oficial
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{custo} PE</span>
            <span>Exec.: <span className="font-medium text-foreground">{ritual.execucao}</span></span>
            <span>Alcance: <span className="font-medium text-foreground">{ritual.alcance}</span></span>
            {ritual.alvo && <span>Alvo: <span className="font-medium text-foreground">{ritual.alvo}</span></span>}
            {ritual.area && <span>Área: <span className="font-medium text-foreground">{ritual.area}</span></span>}
            {ritual.duracao && <span>Duração: <span className="font-medium text-foreground">{ritual.duracao}</span></span>}
            {ritual.resistencia && <span>Resist.: <span className="font-medium text-foreground">{ritual.resistencia}</span></span>}
            {ritual.dt && <span>DT {ritual.dt}</span>}
          </div>

          {ritual.descricao && (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{ritual.descricao}</p>
          )}

          {(ritual.discente || ritual.verdadeiro) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {ritual.discente && (
                <span className="border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Discente {ritual.discente_custo ? `+${ritual.discente_custo} PE` : ""}
                </span>
              )}
              {ritual.verdadeiro && (
                <span className="border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Verdadeiro {ritual.verdadeiro_custo ? `+${ritual.verdadeiro_custo} PE` : ""}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {!ritual.oficial ? (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link href={`/rituais/${ritual.id}/editar`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
              <ConfirmDialog
                title="Excluir ritual"
                description={`Tem certeza que deseja excluir "${ritual.nome}"?`}
                onConfirm={() => del.mutate(ritual.id)}
                disabled={del.isPending}
              >
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </ConfirmDialog>
            </>
          ) : (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" disabled title="Ritual oficial do catálogo">
              <BookOpenCheck className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function RituaisPage() {
  const { data: rituais = [], isLoading } = useRituais();
  const [filtro, setFiltro] = useState<string>("todos");
  const [circulo, setCirculo] = useState<string>("todos");
  const [busca, setBusca] = useState("");

  const filtered = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return rituais.filter((r) => {
      if (filtro !== "todos" && r.elemento !== filtro) return false;
      if (circulo !== "todos" && String(r.circulo) !== circulo) return false;
      if (!q) return true;
      const text = [
        r.nome,
        r.elemento,
        r.tipo,
        r.execucao,
        r.alcance,
        r.alvo,
        r.area,
        r.duracao,
        r.resistencia,
        r.descricao,
        r.discente,
        r.verdadeiro,
        r.requisitos,
      ].filter(Boolean).join(" ").toLowerCase();
      return text.includes(q);
    });
  }, [busca, circulo, filtro, rituais]);

  const stats = useMemo(() => ({
    total: rituais.length,
    oficiais: rituais.filter((r) => r.oficial).length,
    primeiro: rituais.filter((r) => r.circulo === 1).length,
    avancados: rituais.filter((r) => r.discente || r.verdadeiro).length,
  }), [rituais]);

  return (
    <main className="flex-1 overflow-y-auto">
      <section className="border-b border-border bg-background px-5 py-8 lg:px-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="border border-border bg-card px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Grimório da Ordo
              </span>
              <span className="border border-primary/25 bg-primary/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                Rituais
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Rituais</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Consulte e cadastre rituais com custo, execução, alcance, resistência e versões Discente/Verdadeiro para usar direto nas fichas e cenas.
            </p>
          </div>

          <Button asChild>
            <Link href="/rituais/novo">
              <Plus className="h-4 w-4" />
              Novo ritual
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Rituais" value={stats.total} icon={<Sparkles className="h-4 w-4" />} />
          <Stat label="Oficiais" value={stats.oficiais} icon={<BookOpenCheck className="h-4 w-4" />} />
          <Stat label="1° Círculo" value={stats.primeiro} icon={<WandSparkles className="h-4 w-4" />} />
          <Stat label="Avançados" value={stats.avancados} icon={<Clock className="h-4 w-4" />} />
        </div>
      </section>

      <section className="border-b border-border px-5 py-4 lg:px-8">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Select value={filtro} onValueChange={setFiltro}>
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="Elemento" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="todos">Todos os elementos</SelectItem>
                {ELEMENTOS.map((e) => (
                  <SelectItem key={e} value={e}>{ELEMENTO_LABELS[e]}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={circulo} onValueChange={setCirculo}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Círculo" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="todos">Todos os círculos</SelectItem>
                {[1, 2, 3, 4].map((c) => (
                  <SelectItem key={c} value={String(c)}>{c}° Círculo</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-full xl:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar ritual, efeito, resistência..."
              className="pl-9"
            />
          </div>
        </div>
      </section>

      <section className="px-5 py-6 lg:px-8">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-border py-16 text-center">
            <Sparkles className="mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {rituais.length === 0 ? "Nenhum ritual cadastrado ainda." : "Nenhum ritual encontrado."}
            </p>
            {rituais.length === 0 && (
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/rituais/novo">Criar primeiro ritual</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{filtered.length} {filtered.length === 1 ? "ritual encontrado" : "rituais encontrados"}</p>
            <div className="grid gap-3">
              {filtered.map((r) => <RitualCard key={r.id} ritual={r} />)}
            </div>
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

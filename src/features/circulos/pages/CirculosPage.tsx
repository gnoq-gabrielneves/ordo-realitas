"use client";

import { useCirculos } from "@/features/circulos/hooks/useCirculos";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Circle } from "@/shared/types/circle";
import { Building2, Crown, Network, PlusIcon, Search, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useMemo, useState } from "react";

const tipoLabel: Record<string, string> = {
  organizacao: "Organização",
  familia: "Família",
  culto: "Culto",
  faccao: "Facção",
  grupo: "Grupo",
  outro: "Outro",
};

export function CirculosPage() {
  const { data: circulos = [], isLoading, isError } = useCirculos();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return circulos;
    return circulos.filter((circulo) => [
      circulo.nome,
      circulo.tipo,
      circulo.descricao,
      circulo.lideranca,
      circulo.sede,
      circulo.objetivo,
      circulo.reputacao,
    ].some((value) => value?.toLowerCase().includes(q)));
  }, [circulos, search]);

  const stats = useMemo(() => ({
    total: circulos.length,
    organizacoes: circulos.filter((c) => c.tipo === "organizacao").length,
    familias: circulos.filter((c) => c.tipo === "familia").length,
    ocultos: circulos.filter((c) => c.tipo === "culto" || c.tipo === "faccao").length,
  }), [circulos]);

  return (
    <>
      <AppHeader title="Círculos" />
      <main className="flex-1 overflow-y-auto">
        <section className="border-b border-border bg-background px-6 py-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="border border-border bg-muted/30 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Rede de vínculos
                </span>
                <span className="border border-primary/30 bg-primary/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Famílias, organizações e facções
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">Círculos</h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Agrupe sujeitos por família, organização, culto, facção ou qualquer rede que mova a campanha.
              </p>
            </div>
            <Button asChild>
              <Link href="/circulos/novo">
                <PlusIcon className="h-4 w-4" />
                Novo Círculo
              </Link>
            </Button>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <StatCard icon={<Network className="h-4 w-4" />} label="Total" value={stats.total} />
            <StatCard icon={<Building2 className="h-4 w-4" />} label="Organizações" value={stats.organizacoes} />
            <StatCard icon={<UsersRound className="h-4 w-4" />} label="Famílias" value={stats.familias} />
            <StatCard icon={<Crown className="h-4 w-4" />} label="Ocultos" value={stats.ocultos} />
          </div>
        </section>

        <section className="border-b border-border bg-muted/15 px-6 py-4">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, sede, liderança, reputação..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9"
            />
          </div>
        </section>

        <section className="p-6">
          {isError && (
            <div className="border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm text-destructive">Erro ao carregar círculos.</p>
            </div>
          )}

          {!isLoading && circulos.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-dashed border-border py-16 text-center">
              <Network className="mb-3 h-8 w-8 text-muted-foreground/30" />
              <p className="mb-4 text-sm text-muted-foreground">Nenhum círculo registrado ainda.</p>
              <Button asChild>
                <Link href="/circulos/novo">
                  <PlusIcon className="h-4 w-4" />
                  Novo Círculo
                </Link>
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="border border-dashed border-border py-12 text-center">
              <Search className="mx-auto mb-3 h-7 w-7 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Nenhum círculo encontrado para &quot;{search}&quot;.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((circulo) => <CirculoCard key={circulo.id} circulo={circulo} />)}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function CirculoCard({ circulo }: { circulo: Circle }) {
  return (
    <Link href={`/circulos/${circulo.id}`} className="group block border border-border bg-card transition-colors hover:bg-muted/30">
      <div className="flex items-start gap-4 p-4">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border border-border bg-muted text-muted-foreground">
          {circulo.image_url ? (
            <Image src={circulo.image_url} alt={circulo.nome} fill className="object-cover" />
          ) : (
            <Network className="h-7 w-7 text-muted-foreground/45" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold leading-tight text-foreground">{circulo.nome}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="outline" className="rounded-none text-[10px] uppercase tracking-wider">{tipoLabel[circulo.tipo] ?? circulo.tipo}</Badge>
            {circulo.reputacao && <Badge variant="secondary" className="rounded-none text-[10px] uppercase tracking-wider">{circulo.reputacao}</Badge>}
          </div>
          {circulo.descricao && <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{circulo.descricao}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 border-t border-border/60 px-4 py-3 text-[10px] text-muted-foreground">
        <MiniInfo label="Sede" value={circulo.sede || "Não definida"} />
        <MiniInfo label="Liderança" value={circulo.lideranca || "Não definida"} />
      </div>
    </Link>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="border border-border bg-card p-4">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{icon}{label}</p>
      <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="uppercase tracking-[0.14em]">{label}</p>
      <p className="mt-1 truncate text-xs font-medium text-foreground">{value}</p>
    </div>
  );
}

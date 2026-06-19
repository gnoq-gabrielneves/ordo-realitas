"use client";

import { SujeitoCard } from "@/features/sujeitos/components/SujeitoCard";
import { useSujeitos } from "@/features/sujeitos/hooks/useSujeitos";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { Npc } from "@/shared/types/npc";
import { PlusIcon, Search, Skull, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Aba = "pessoa" | "criatura";

export function SujeitosPage() {
  const { data: sujeitos = [], isLoading, isError } = useSujeitos();
  const [search, setSearch] = useState("");
  const [aba, setAba] = useState<Aba>("pessoa");

  // Sujeitos sem tipo definido caem em "Pessoas" por padrão.
  const isCriatura = (s: Npc) => s.tipo === "criatura";
  const pessoas = sujeitos.filter((s) => !isCriatura(s));
  const criaturas = sujeitos.filter(isCriatura);

  const base = aba === "criatura" ? criaturas : pessoas;
  const filtered = base.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  const TABS: { id: Aba; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "pessoa", label: "Pessoas", icon: <UserRound className="h-3.5 w-3.5" />, count: pessoas.length },
    { id: "criatura", label: "Criaturas", icon: <Skull className="h-3.5 w-3.5" />, count: criaturas.length },
  ];

  return (
    <>
      <AppHeader title="Sujeitos" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-sm font-medium text-foreground">Registro de Sujeitos</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isLoading ? "Carregando..." : `${sujeitos.length} ${sujeitos.length === 1 ? "sujeito catalogado" : "sujeitos catalogados"}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Pesquisar sujeito..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-56 h-8 text-xs"
              />
            </div>
            <Button asChild size="sm">
              <Link href="/sujeitos/novo">
                <PlusIcon className="h-3.5 w-3.5" />
                Novo Sujeito
              </Link>
            </Button>
          </div>
        </div>

        {/* Abas Pessoas / Criaturas */}
        <div className="flex items-center gap-1.5 border-b border-border mb-5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setAba(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 -mb-px transition-colors",
                aba === t.id
                  ? "border-primary text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t.icon}
              {t.label}
              <span className={cn(
                "ml-0.5 text-[10px] tabular-nums rounded-full px-1.5 py-0.5",
                aba === t.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {isError && (
          <p className="text-xs text-destructive">Erro ao carregar registros.</p>
        )}

        {!isLoading && base.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-border py-16 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {aba === "criatura" ? "Nenhuma criatura catalogada ainda." : "Nenhuma pessoa catalogada ainda."}
            </p>
            <Button asChild size="sm">
              <Link href="/sujeitos/novo">
                <PlusIcon className="h-3.5 w-3.5" />
                Novo Sujeito
              </Link>
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground py-8 text-center">
            {search ? `Nenhum sujeito encontrado para "${search}".` : "Nenhum sujeito nesta aba."}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((s) => (
              <SujeitoCard key={s.id} sujeito={s} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

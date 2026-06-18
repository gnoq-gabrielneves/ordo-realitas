"use client";

import { SujeitoCard } from "@/features/sujeitos/components/SujeitoCard";
import { useSujeitos } from "@/features/sujeitos/hooks/useSujeitos";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { PlusIcon, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function SujeitosPage() {
  const { data: sujeitos = [], isLoading, isError } = useSujeitos();
  const [search, setSearch] = useState("");

  const filtered = sujeitos.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <AppHeader title="Sujeitos" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
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

        {isError && (
          <p className="text-xs text-destructive">Erro ao carregar registros.</p>
        )}

        {!isLoading && sujeitos.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-border py-16 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Nenhum sujeito catalogado ainda.
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
            Nenhum sujeito encontrado para "{search}".
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

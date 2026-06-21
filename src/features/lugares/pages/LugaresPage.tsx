"use client";

import { LugarCard } from "@/features/lugares/components/LugarCard";
import { useLugares } from "@/features/lugares/hooks/useLugares";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { MapPin, PlusIcon, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function LugaresPage() {
  const { data: lugares = [], isLoading, isError } = useLugares();
  const [search, setSearch] = useState("");

  const raiz = lugares.filter((l) => l.parent_id === null);
  const filtered = raiz.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <AppHeader title="Lugares" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-sm font-medium text-foreground">Registro de Lugares</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isLoading ? "Carregando..." : `${raiz.length} ${raiz.length === 1 ? "lugar catalogado" : "lugares catalogados"}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Pesquisar lugar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-56 h-8 text-xs"
              />
            </div>
            <Button asChild size="sm">
              <Link href="/lugares/novo">
                <PlusIcon className="h-3.5 w-3.5" />
                Novo Lugar
              </Link>
            </Button>
          </div>
        </div>

        {isError && <p className="text-xs text-destructive">Erro ao carregar registros.</p>}

        {!isLoading && raiz.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-border py-16 text-center">
            <MapPin className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">Nenhum lugar catalogado ainda.</p>
            <Button asChild size="sm">
              <Link href="/lugares/novo">
                <PlusIcon className="h-3.5 w-3.5" />
                Novo Lugar
              </Link>
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground py-8 text-center">
            Nenhum lugar encontrado para &quot;{search}&quot;.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((l) => <LugarCard key={l.id} lugar={l} />)}
          </div>
        )}
      </main>
    </>
  );
}

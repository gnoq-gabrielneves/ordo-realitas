"use client";

import { CampanhaCard } from "@/features/campanhas/components/CampanhaCard";
import { useCampanhas } from "@/features/campanhas/hooks/useCampanhas";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { BookOpen, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function CampanhasPage() {
  const { data: campanhas = [], isLoading } = useCampanhas();
  const [search, setSearch] = useState("");

  const filtered = campanhas.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.vilao ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <AppHeader title="Campanhas" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <Input
            placeholder="Pesquisar campanhas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Button asChild size="sm">
            <Link href="/campanhas/nova">
              <PlusIcon className="h-3.5 w-3.5" />
              Nova Campanha
            </Link>
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse border border-border" />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
            <BookOpen className="h-8 w-8" />
            <p className="text-sm">Nenhuma campanha encontrada nos arquivos.</p>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((c) => <CampanhaCard key={c.id} campanha={c} />)}
          </div>
        )}
      </main>
    </>
  );
}

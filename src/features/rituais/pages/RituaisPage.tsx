"use client";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useDeleteRitual, useRituais } from "@/features/rituais/hooks/useRituais";
import { CUSTO_PE, Ritual, RitualElemento } from "@/shared/types/ritual";
import { Pencil, Plus, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const ELEMENTO_LABELS: Record<RitualElemento, string> = {
  conhecimento: "Conhecimento",
  energia: "Energia",
  morte: "Morte",
  sangue: "Sangue",
  medo: "Medo",
};

const ELEMENTO_COLORS: Record<RitualElemento, string> = {
  conhecimento: "border-blue-500/40 text-blue-400",
  energia: "border-yellow-500/40 text-yellow-400",
  morte: "border-purple-500/40 text-purple-400",
  sangue: "border-red-500/40 text-red-400",
  medo: "border-orange-500/40 text-orange-400",
};

const CIRCULO_LABEL: Record<number, string> = { 1: "1°", 2: "2°", 3: "3°", 4: "4°" };

function RitualRow({ ritual }: { ritual: Ritual }) {
  const del = useDeleteRitual();

  return (
    <div className="flex items-start gap-4 rounded-sm border border-border bg-card px-4 py-3 hover:bg-muted/30 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{ritual.nome}</span>
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 ${ELEMENTO_COLORS[ritual.elemento]}`}
          >
            {ELEMENTO_LABELS[ritual.elemento]}
          </Badge>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {CIRCULO_LABEL[ritual.circulo]} Círculo
          </Badge>
          <span className="text-[10px] text-muted-foreground">{CUSTO_PE[ritual.circulo as 1|2|3|4]} PE</span>
          {ritual.dt && (
            <span className="text-[10px] text-muted-foreground">DT {ritual.dt}</span>
          )}
        </div>

        <div className="mt-1.5 flex gap-3 flex-wrap text-xs text-muted-foreground">
          <span>Exec.: <span className="text-foreground">{ritual.execucao}</span></span>
          <span>Alcance: <span className="text-foreground">{ritual.alcance}</span></span>
          {ritual.alvo && <span>Alvo: <span className="text-foreground">{ritual.alvo}</span></span>}
          {ritual.duracao && <span>Duração: <span className="text-foreground">{ritual.duracao}</span></span>}
          {ritual.resistencia && <span>Resist.: <span className="text-foreground">{ritual.resistencia}</span></span>}
        </div>

        {ritual.descricao && (
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{ritual.descricao}</p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
          <Link href={`/rituais/${ritual.id}/editar`}>
            <Pencil className="h-3.5 w-3.5" />
          </Link>
        </Button>
        <ConfirmDialog
          title="Excluir ritual"
          description={`Tem certeza que deseja excluir "${ritual.nome}"?`}
          onConfirm={() => del.mutate(ritual.id)}
          disabled={del.isPending}
        >
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </Button>
        </ConfirmDialog>
      </div>
    </div>
  );
}

const ELEMENTOS = ["conhecimento", "energia", "morte", "sangue", "medo"] as const;

export function RituaisPage() {
  const { data: rituais = [], isLoading } = useRituais();
  const [filtro, setFiltro] = useState<string>("todos");
  const [circulo, setCirculo] = useState<string>("todos");
  const [busca, setBusca] = useState("");

  const filtered = rituais.filter((r) => {
    if (filtro !== "todos" && r.elemento !== filtro) return false;
    if (circulo !== "todos" && String(r.circulo) !== circulo) return false;
    if (busca && !r.nome.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
        <h1 className="text-sm font-semibold tracking-wide">Banco de Rituais</h1>
        <Button size="sm" asChild>
          <Link href="/rituais/novo">
            <Plus className="h-4 w-4 mr-1.5" />
            Novo Ritual
          </Link>
        </Button>
      </div>

      <div className="flex shrink-0 items-center gap-3 border-b border-border px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Filtros</span>
          <Select value={filtro} onValueChange={setFiltro}>
            <SelectTrigger className="w-52 h-9 text-sm shrink-0">
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
            <SelectTrigger className="w-44 h-9 text-sm shrink-0">
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

        <div className="relative ml-auto w-64 shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar ritual..."
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              {rituais.length === 0 ? "Nenhum ritual cadastrado ainda." : "Nenhum ritual encontrado."}
            </p>
            {rituais.length === 0 && (
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link href="/rituais/novo">Criar primeiro ritual</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-3">{filtered.length} {filtered.length === 1 ? "ritual" : "rituais"}</p>
            {filtered.map((r) => (
              <RitualRow key={r.id} ritual={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

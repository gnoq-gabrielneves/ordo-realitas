import { Badge } from "@/shared/components/ui/badge";
import { Place } from "@/shared/types/place";
import { Eye, MapPin, ScanSearch } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const atividadeLabel: Record<string, { label: string; className: string }> = {
  nenhuma: { label: "Sem atividade", className: "text-muted-foreground border-border" },
  baixa:   { label: "Baixa",         className: "text-amber-700 border-amber-300" },
  moderada:{ label: "Moderada",      className: "text-orange-700 border-orange-300" },
  alta:    { label: "Alta",          className: "text-primary border-primary/40" },
  critica: { label: "Crítica",       className: "text-destructive border-destructive/40" },
};

interface LugarCardProps {
  lugar: Place;
  subCount?: number;
}

export function LugarCard({ lugar, subCount = 0 }: LugarCardProps) {
  const atividade = lugar.atividade_paranormal ? atividadeLabel[lugar.atividade_paranormal] : null;
  const pontosCount = lugar.pontos_de_interesse.length;

  return (
    <Link
      href={`/lugares/${lugar.id}`}
      className="group block border border-border bg-card transition-colors hover:border-primary/35 hover:bg-accent/25"
    >
      <div className="flex gap-4 p-4">
        <div className="relative flex aspect-square h-20 shrink-0 items-center justify-center overflow-hidden border border-border bg-muted text-muted-foreground">
          {lugar.image_url ? (
            <Image src={lugar.image_url} alt={lugar.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <MapPin className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-foreground">{lugar.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {lugar.tipo && (
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-[0.16em]">
                    {lugar.tipo}
                  </Badge>
                )}
                {atividade && lugar.atividade_paranormal !== "nenhuma" && (
                  <Badge variant="outline" className={`text-[10px] uppercase tracking-[0.16em] ${atividade.className}`}>
                    {atividade.label}
                  </Badge>
                )}
              </div>
            </div>
            {lugar.membrana && lugar.membrana !== "integra" && (
              <span className="shrink-0 border border-border px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {lugar.membrana}
              </span>
            )}
          </div>

          {lugar.localizacao && (
            <p className="mt-2 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {lugar.localizacao}
            </p>
          )}

          {lugar.descricao && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{lugar.descricao}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-border text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5 px-4 py-2">
          <ScanSearch className="h-3.5 w-3.5" />
          {pontosCount} {pontosCount === 1 ? "ponto" : "pontos"}
        </span>
        <span className="flex items-center gap-1.5 border-l border-border px-4 py-2">
          <Eye className="h-3.5 w-3.5" />
          {subCount} {subCount === 1 ? "sub-lugar" : "sub-lugares"}
        </span>
      </div>
    </Link>
  );
}

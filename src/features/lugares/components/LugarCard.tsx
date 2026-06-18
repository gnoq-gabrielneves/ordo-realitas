import { Badge } from "@/shared/components/ui/badge";
import { Place } from "@/shared/types/place";
import { MapPin } from "lucide-react";
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
}

export function LugarCard({ lugar }: LugarCardProps) {
  const atividade = lugar.atividade_paranormal ? atividadeLabel[lugar.atividade_paranormal] : null;

  return (
    <Link
      href={`/lugares/${lugar.id}`}
      className="flex items-start gap-4 border border-border bg-card p-4 transition-colors hover:bg-accent/40"
    >
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-muted text-muted-foreground overflow-hidden">
        {lugar.image_url ? (
          <Image src={lugar.image_url} alt={lugar.name} fill className="object-cover" />
        ) : (
          <MapPin className="h-4 w-4" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground">{lugar.name}</span>
          {lugar.membrana && lugar.membrana !== "integra" && (
            <span className="text-[10px] text-muted-foreground capitalize">
              Membrana {lugar.membrana}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {lugar.tipo && (
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
              {lugar.tipo}
            </Badge>
          )}
          {atividade && lugar.atividade_paranormal !== "nenhuma" && (
            <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${atividade.className}`}>
              {atividade.label}
            </Badge>
          )}
          {lugar.localizacao && (
            <span className="text-[10px] text-muted-foreground truncate">{lugar.localizacao}</span>
          )}
        </div>

        {lugar.descricao && (
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{lugar.descricao}</p>
        )}
      </div>
    </Link>
  );
}

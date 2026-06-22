import { Badge } from "@/shared/components/ui/badge";
import { ELEMENTO_BADGE } from "@/shared/constants/elements";
import { Npc } from "@/shared/types/npc";
import { RitualElemento } from "@/shared/types/ritual";
import { cn } from "@/shared/lib/utils";
import { Eye, Heart, Shield, Skull, Sparkles, Swords, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const origemLabel: Record<string, string> = {
  sangue: "Sangue",
  morte: "Morte",
  medo: "Medo",
  conhecimento: "Conhecimento",
  energia: "Energia",
};

interface SujeitoCardProps {
  sujeito: Npc;
}

export function SujeitoCard({ sujeito }: SujeitoCardProps) {
  const isCriatura = sujeito.tipo === "criatura";
  const temCombate = sujeito.defesa != null || sujeito.pv != null || sujeito.acoes.length > 0 || sujeito.habilidades.length > 0;

  return (
    <Link
      href={`/sujeitos/${sujeito.id}`}
      className={cn(
        "group block border bg-card transition-colors hover:bg-muted/30",
        isCriatura ? "border-red-500/25 bg-red-500/[0.025]" : "border-border",
      )}
    >
      <div className="flex items-start gap-4 p-4">
        <div className={cn(
          "relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border bg-muted text-muted-foreground",
          isCriatura ? "border-red-500/35" : "border-border",
        )}>
          {sujeito.image_url ? (
            <Image src={sujeito.image_url} alt={sujeito.name} fill className="object-cover" />
          ) : isCriatura ? (
            <Skull className="h-7 w-7 text-red-500/45" />
          ) : (
            <UserRound className="h-7 w-7 text-muted-foreground/45" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold leading-tight text-foreground">{sujeito.name}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {sujeito.tipo && (
                  <Badge variant={isCriatura ? "outline" : "secondary"} className={cn("rounded-none text-[10px] uppercase tracking-wider", isCriatura && "border-red-500/35 text-red-500")}>
                    {sujeito.tipo}
                  </Badge>
                )}
                {sujeito.origem && (
                  <Badge variant="outline" className={`rounded-none text-[10px] uppercase tracking-wider ${getOrigemBadge(sujeito.origem)}`}>
                    {origemLabel[sujeito.origem]}
                  </Badge>
                )}
                {sujeito.tamanho && (
                  <span className="border border-border px-1.5 py-0.5 text-[10px] capitalize text-muted-foreground">{sujeito.tamanho}</span>
                )}
              </div>
            </div>
            {sujeito.vd != null && (
              <div className="shrink-0 border border-amber-500/35 bg-amber-500/10 px-2 py-1 text-center">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-amber-500">VD</p>
                <p className="text-sm font-semibold tabular-nums">{sujeito.vd}</p>
              </div>
            )}
          </div>

          {sujeito.descricao && (
            <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{sujeito.descricao}</p>
          )}

          {temCombate && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <MiniMetric icon={<Shield className="h-3 w-3" />} label="DEF" value={sujeito.defesa ?? "—"} />
              <MiniMetric icon={<Heart className="h-3 w-3" />} label="PV" value={sujeito.pv ?? "—"} />
              <MiniMetric icon={<Swords className="h-3 w-3" />} label="Ações" value={sujeito.acoes.length + sujeito.habilidades.length} />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border/60 px-4 py-3 text-[10px] text-muted-foreground">
        {sujeito.percepcao && <StatusPill icon={<Eye className="h-3 w-3" />} label={`Percepção ${sujeito.percepcao}`} />}
        {sujeito.rituais.length > 0 && <StatusPill icon={<Sparkles className="h-3 w-3" />} label={`${sujeito.rituais.length} ritual${sujeito.rituais.length !== 1 ? "ais" : ""}`} />}
        {sujeito.resistencias.length > 0 && <StatusPill icon={<Shield className="h-3 w-3" />} label={`${sujeito.resistencias.length} resistência${sujeito.resistencias.length !== 1 ? "s" : ""}`} />}
        {!sujeito.percepcao && sujeito.rituais.length === 0 && sujeito.resistencias.length === 0 && (
          <span>Registro narrativo</span>
        )}
      </div>
    </Link>
  );
}

function MiniMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="border border-border bg-background/70 px-2 py-1.5">
      <p className="flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{icon}{label}</p>
      <p className="mt-0.5 text-xs font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function StatusPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <span className="inline-flex items-center gap-1.5">{icon}{label}</span>;
}

function getOrigemBadge(origem: string): string {
  const key = origem as RitualElemento;
  return ELEMENTO_BADGE[key] ?? "border-primary/30 text-primary";
}

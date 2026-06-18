import { Badge } from "@/shared/components/ui/badge";
import { Npc } from "@/shared/types/npc";
import { UserRound } from "lucide-react";
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
  return (
    <Link
      href={`/sujeitos/${sujeito.id}`}
      className="flex items-start gap-4 border border-border bg-card p-4 transition-colors hover:bg-accent/40"
    >
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-muted text-muted-foreground overflow-hidden">
        {sujeito.image_url ? (
          <Image src={sujeito.image_url} alt={sujeito.name} fill className="object-cover" />
        ) : (
          <UserRound className="h-5 w-5" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground">{sujeito.name}</span>
          {sujeito.vd != null && (
            <span className="text-[10px] font-medium text-muted-foreground">VD {sujeito.vd}</span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {sujeito.tipo && (
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
              {sujeito.tipo}
            </Badge>
          )}
          {sujeito.origem && (
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-primary border-primary/30">
              {origemLabel[sujeito.origem]}
            </Badge>
          )}
          {sujeito.tamanho && (
            <span className="text-[10px] text-muted-foreground capitalize">{sujeito.tamanho}</span>
          )}
        </div>

        {sujeito.descricao && (
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{sujeito.descricao}</p>
        )}
      </div>
    </Link>
  );
}

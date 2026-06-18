"use client";

import { Campanha } from "@/shared/types/campaign";
import { BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CampanhaCardProps { campanha: Campanha }

export function CampanhaCard({ campanha }: CampanhaCardProps) {
  return (
    <Link href={`/campanhas/${campanha.id}`} className="group flex items-start gap-3 border border-border bg-card p-4 hover:border-primary/40 transition-colors">
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center border border-border bg-muted text-muted-foreground overflow-hidden">
        {campanha.image_url
          ? <Image src={campanha.image_url} alt={campanha.name} fill className="object-cover" />
          : <BookOpen className="h-5 w-5" />
        }
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground group-hover:text-primary truncate transition-colors">
          {campanha.name}
        </p>
        {campanha.synopsis && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{campanha.synopsis}</p>
        )}
        <div className="flex items-center gap-3 mt-2">
          {campanha.vilao && (
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Vilão: <span className="text-foreground">{campanha.vilao}</span>
            </span>
          )}
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            NEX {campanha.nex_inicial}% → {campanha.nex_final}%
          </span>
        </div>
      </div>
    </Link>
  );
}

import { RitualElemento } from "@/shared/types/ritual";

export const ELEMENTO_LABELS: Record<RitualElemento, string> = {
  sangue: "Sangue",
  morte: "Morte",
  conhecimento: "Conhecimento",
  energia: "Energia",
  medo: "Medo",
};

export const ELEMENTO_TEXT: Record<RitualElemento, string> = {
  sangue: "text-red-500",
  morte: "text-zinc-700 dark:text-zinc-300",
  conhecimento: "text-amber-500",
  energia: "text-violet-500",
  medo: "text-foreground",
};

export const ELEMENTO_BADGE: Record<RitualElemento, string> = {
  sangue: "border-red-500/40 bg-red-500/10 text-red-500",
  morte: "border-zinc-500/40 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
  conhecimento: "border-amber-500/45 bg-amber-500/10 text-amber-500",
  energia: "border-violet-500/45 bg-violet-500/10 text-violet-500",
  medo: "border-foreground/30 bg-foreground/10 text-foreground",
};

export const ELEMENTO_BG: Record<RitualElemento, string> = {
  sangue: "bg-red-500/10",
  morte: "bg-zinc-500/10",
  conhecimento: "bg-amber-500/10",
  energia: "bg-violet-500/10",
  medo: "bg-foreground/10",
};

export const ELEMENTOS = Object.keys(ELEMENTO_LABELS) as RitualElemento[];

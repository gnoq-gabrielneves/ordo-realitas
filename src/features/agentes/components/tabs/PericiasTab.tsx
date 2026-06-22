"use client";

import { Input } from "@/shared/components/ui/input";
import { PERICIAS } from "@/shared/constants/pericias";
import { AgentPericiaEntry, AgentSheet, GrauPericia } from "@/shared/types/agent";
import { cn } from "@/shared/lib/utils";

interface PericiasTabProps {
  data: AgentSheet;
  onChange: (patch: Partial<AgentSheet>) => void;
}

const ATRIB_COLORS: Record<string, string> = {
  AGI: "text-green-400",
  FOR: "text-red-400",
  INT: "text-blue-400",
  PRE: "text-yellow-400",
  VIG: "text-orange-400",
};

// Leigo → Treinado → Veterano → Expert
const GRAUS: { label: string; bonus: number; short: string }[] = [
  { label: "Leigo",    bonus: 0,  short: "—"  },
  { label: "Treinado", bonus: 5,  short: "T"  },
  { label: "Veterano", bonus: 10, short: "V"  },
  { label: "Expert",   bonus: 15, short: "E"  },
];

function getGrau(entry: AgentPericiaEntry): GrauPericia {
  if (entry.grau !== undefined) return entry.grau;
  return entry.treinado ? 1 : 0;
}

export function PericiasTab({ data, onChange }: PericiasTabProps) {
  const atributos: Record<string, number> = {
    AGI: data.agi, FOR: data.forca, INT: data.intelecto, PRE: data.presenca, VIG: data.vigor,
  };

  const getPer = (key: string): AgentPericiaEntry =>
    data.pericias[key] ?? { treinado: false, grau: 0, outros: 0 };

  const setPer = (key: string, patch: Partial<AgentPericiaEntry>) => {
    const current = getPer(key);
    onChange({ pericias: { ...data.pericias, [key]: { ...current, ...patch } } });
  };

  const cycleGrau = (key: string, current: GrauPericia) => {
    const next = ((current + 1) % 4) as GrauPericia;
    setPer(key, { grau: next, treinado: next >= 1 });
  };

  return (
    <div className="space-y-4">
      <div className="border border-border bg-muted/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Como testes funcionam</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          O atributo define quantos d20 você rola e você usa o maior resultado. O total numérico abaixo mostra apenas bônus fixos:
          treinamento, modificadores e efeitos. Exemplo: AGI 2 vira 2d20; Treinado soma +5.
        </p>
      </div>

      <div className="space-y-1">
      <div className="grid grid-cols-[1fr_80px_90px_70px_80px] gap-2 px-3 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        <span>Perícia</span>
        <span className="text-center">Rolagem</span>
        <span className="text-center">Grau</span>
        <span className="text-center">Outros</span>
        <span className="text-center">Bônus</span>
      </div>

      {PERICIAS.map((p) => {
        const per = getPer(p.key);
        const grau = getGrau(per);
        const base = atributos[p.atributo] ?? 0;
        const bonus = GRAUS[grau].bonus;
        const total = bonus + (per.outros ?? 0);
        const dicePool = base > 0 ? `${base}d20` : "2d20 pior";

        return (
          <div
            key={p.key}
            className="grid grid-cols-[1fr_80px_90px_70px_80px] gap-2 items-center px-3 py-1.5 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm truncate">{p.nome}</span>
              {p.somentetreinada && <span className="text-[9px] text-muted-foreground shrink-0">*</span>}
              {p.penalidade      && <span className="text-[9px] text-muted-foreground shrink-0">+</span>}
            </div>

            <div className="text-center">
              <span className={cn("text-xs font-mono font-medium", ATRIB_COLORS[p.atributo])}>
                {p.atributo} {dicePool}
              </span>
            </div>

            {/* Grau — cicla ao clicar */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => cycleGrau(p.key, grau)}
                title={`${GRAUS[grau].label} (+${GRAUS[grau].bonus}) — clique para avançar`}
                className={cn(
                  "h-6 min-w-16 rounded px-2 text-[11px] font-semibold border transition-colors",
                  grau === 0 && "border-border text-muted-foreground hover:border-primary/40",
                  grau === 1 && "border-primary/50 text-primary bg-primary/10",
                  grau === 2 && "border-yellow-500/50 text-yellow-400 bg-yellow-500/10",
                  grau === 3 && "border-purple-500/50 text-purple-400 bg-purple-500/10",
                )}
              >
                {grau === 0 ? "—" : `${GRAUS[grau].short} +${GRAUS[grau].bonus}`}
              </button>
            </div>

            <div>
              <Input
                type="number"
                value={per.outros ?? 0}
                onChange={(e) => setPer(p.key, { outros: Number(e.target.value) })}
                className="h-6 w-full text-center text-xs px-1"
              />
            </div>

            <div className="text-center">
              <span className={cn("text-sm font-semibold", total > 0 ? "text-foreground" : "text-muted-foreground")}>
                {total >= 0 ? `+${total}` : total}
              </span>
            </div>
          </div>
        );
      })}

      <p className="px-3 pt-2 text-[10px] text-muted-foreground">
        * Somente treinada &nbsp; + Penalidade de carga &nbsp;·&nbsp; Atributo 0 rola dois d20 e usa o pior resultado.
      </p>
      </div>
    </div>
  );
}

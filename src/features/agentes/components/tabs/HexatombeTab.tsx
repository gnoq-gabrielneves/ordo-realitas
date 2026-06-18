"use client";

import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import {
  DESERTOR_REGRAS, ESTIGMAS, FORMA_SUPREMA, estigmaHabilidade, getEstigma, getEstigmas,
} from "@/shared/constants/hexatombe";
import { AgentSheet } from "@/shared/types/agent";
import { cn } from "@/shared/lib/utils";
import { Minus, Plus, Skull } from "lucide-react";

interface HexatombeTabProps {
  data: AgentSheet;
  onChange: (patch: Partial<AgentSheet>) => void;
}

export function HexatombeTab({ data, onChange }: HexatombeTabProps) {
  const estigmas = data.estigmas ?? [];
  const estigmasAtivos = getEstigmas(estigmas);
  const acumulo = data.desertor_acumulo ?? 0;

  const toggleEstigma = (id: string) => {
    const e = getEstigma(id);
    const habilidades = data.habilidades ?? [];
    if (estigmas.includes(id)) {
      // remove o estigma e sua habilidade auto-adicionada (casada por nome)
      onChange({
        estigmas: estigmas.filter((x) => x !== id),
        habilidades: e ? habilidades.filter((h) => h.nome !== e.poder) : habilidades,
      });
    } else {
      // adiciona o estigma e, se ainda não existir, sua habilidade de sacrifício
      const jaTem = e && habilidades.some((h) => h.nome === e.poder);
      onChange({
        estigmas: [...estigmas, id],
        habilidades: e && !jaTem ? [...habilidades, estigmaHabilidade(e)] : habilidades,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Identidade */}
      <div className="rounded-md border border-red-500/20 bg-red-500/[0.03] p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Skull className="h-4 w-4 text-red-400" />
          <p className="text-xs font-medium text-red-400 uppercase tracking-wider">Identidade do Mascarado</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Codinome / Máscara</label>
          <Input
            value={data.codinome ?? ""}
            onChange={(e) => onChange({ codinome: e.target.value || null })}
            placeholder="Ex: Mutilador Noturno"
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Estigmas da Coroa de Espinhos
            <span className="text-muted-foreground/60 font-normal"> · marque os adquiridos na campanha</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ESTIGMAS.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => toggleEstigma(e.id)}
                className={cn(
                  "rounded border px-2 py-1.5 text-xs font-medium transition-colors",
                  estigmas.includes(e.id)
                    ? `${e.corBg} ${e.cor} border-current`
                    : "border-border text-muted-foreground hover:border-primary/40"
                )}
              >
                {e.nome}
              </button>
            ))}
          </div>
        </div>

        {estigmasAtivos.map((e) => (
          <div key={e.id} className={cn("rounded border-l-2 pl-3 py-1 space-y-1", e.corBorda)}>
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-semibold", e.cor)}>{e.nome}</span>
              <span className="text-[11px] text-muted-foreground">{e.palavras.join(" · ")}</span>
            </div>
            <p className={cn("text-xs italic", e.cor)}>“{e.clamor}”</p>
            <div className="pt-1">
              <p className="text-xs font-medium">
                {e.poder}
                <span className="text-[10px] text-muted-foreground font-normal"> · {e.poderAcao}{e.poderCustoPe ? ` · ${e.poderCustoPe} PE` : ""}</span>
                <span className="text-[10px] text-green-500/80 font-normal"> · adicionado às Habilidades ✓</span>
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{e.poderDesc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Regras da Forma Suprema */}
      <div className="rounded-md border border-border p-4 space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Intenção Assassina — Forma Suprema</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <span className="text-green-400">+{FORMA_SUPREMA.bonusPv} PV</span>
          <span className="text-cyan-400">+{FORMA_SUPREMA.bonusPe} PE</span>
          <span className="text-blue-400">+{FORMA_SUPREMA.bonusDefesa} Defesa</span>
          <span className="text-muted-foreground">Ativar: {FORMA_SUPREMA.ativacao} + {FORMA_SUPREMA.custoSan} SAN (+{FORMA_SUPREMA.custoSanRodadaExtra}/rodada)</span>
        </div>
        <ul className="space-y-1">
          {FORMA_SUPREMA.passivos.map((p, i) => (
            <li key={i} className="text-[11px] text-muted-foreground flex gap-1.5">
              <span className="text-red-400 shrink-0">›</span>{p}
            </li>
          ))}
        </ul>
        <div className="space-y-1 pt-1">
          {FORMA_SUPREMA.avisos.map((a, i) => (
            <p key={i} className="text-[10px] text-amber-500/80 leading-snug">⚠ {a}</p>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">
          Edite os valores da forma desperta alternando para <strong className="text-foreground">Forma Suprema</strong> no topo da ficha.
        </p>
      </div>

      {/* Estado Desertor */}
      <div className="rounded-md border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado Desertor</p>
            <p className="text-[11px] text-muted-foreground">Quando a equipe perde seu sacrifício.</p>
          </div>
          <Switch
            checked={data.desertor}
            onCheckedChange={(v) => onChange({ desertor: v, desertor_acumulo: v ? data.desertor_acumulo : 0 })}
          />
        </div>

        {data.desertor && (
          <div className="space-y-3 pt-1">
            <ul className="space-y-1 text-[11px] text-muted-foreground">
              <li>› {DESERTOR_REGRAS.pvMetade}</li>
              <li>› {DESERTOR_REGRAS.fortitude}</li>
              <li>› {DESERTOR_REGRAS.acumulo}</li>
            </ul>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Sacrifícios sofridos</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ desertor_acumulo: Math.max(0, acumulo - 1) })}
                  className="h-6 w-6 rounded border border-border flex items-center justify-center hover:border-primary/50"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-sm font-semibold tabular-nums w-6 text-center">{acumulo}</span>
                <button
                  type="button"
                  onClick={() => onChange({ desertor_acumulo: Math.min(DESERTOR_REGRAS.acumuloMax, acumulo + 1) })}
                  className="h-6 w-6 rounded border border-border flex items-center justify-center hover:border-primary/50"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              {acumulo > 0 && (
                <span className="text-[11px] text-destructive">
                  −{acumulo}d10 PV máx · −{acumulo} em testes
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

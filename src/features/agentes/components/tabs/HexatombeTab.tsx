"use client";

import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import {
  DESERTOR_REGRAS,
  ESTIGMAS,
  FORMA_SUPREMA,
  HEXATOMBE_RULE_CARDS,
  estigmaHabilidade,
  getEstigma,
  getEstigmas,
} from "@/shared/constants/hexatombe";
import { AgentSheet } from "@/shared/types/agent";
import { cn } from "@/shared/lib/utils";
import { BookOpenCheck, Crown, Minus, Plus, Skull, Sparkles } from "lucide-react";

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
      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="border border-red-500/20 bg-red-500/[0.03] p-5 space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-red-500/30 bg-red-500/10 text-red-400">
              <Skull className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-400">Identidade do Mascarado</p>
              <h3 className="mt-1 text-xl font-semibold">{data.codinome || "Máscara sem nome"}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Use esta aba para controlar os estigmas, poderes de sacrifício e estados especiais da Hexatombe.
              </p>
            </div>
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
        </div>

        <div className="grid grid-cols-3 border border-border bg-muted/20">
          <HexSummary label="Estigmas" value={`${estigmasAtivos.length}/6`} />
          <HexSummary label="Desertor" value={data.desertor ? "Sim" : "Não"} danger={data.desertor} />
          <HexSummary label="Forma" value={data.forma_ativa ? "Ativa" : "Dormindo"} danger={data.forma_ativa} />
        </div>
      </section>

      <section className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-red-400" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Estigmas da Coroa de Espinhos</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Marque os estigmas adquiridos na campanha. Cada um adiciona automaticamente seu poder em Habilidades.
          </p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {ESTIGMAS.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => toggleEstigma(e.id)}
                className={cn(
                  "border p-3 text-left transition-colors",
                  estigmas.includes(e.id)
                    ? `${e.corBg} ${e.cor} border-current`
                    : "border-border text-muted-foreground hover:border-red-500/40 hover:text-foreground"
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{e.nome}</span>
                  {estigmas.includes(e.id) && <BookOpenCheck className="h-4 w-4" />}
                </span>
                <span className="mt-1 block text-[10px] uppercase tracking-[0.14em] opacity-75">{e.palavras.join(" · ")}</span>
                <span className="mt-3 block text-xs leading-relaxed text-muted-foreground">{e.poder}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {estigmasAtivos.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Poderes adquiridos</p>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
        {estigmasAtivos.map((e) => (
          <div key={e.id} className={cn("border bg-card p-4 space-y-3", e.corBorda)}>
            <div className="flex items-center gap-2">
              <span className={cn("text-sm font-semibold", e.cor)}>{e.nome}</span>
              <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{e.palavras.join(" · ")}</span>
            </div>
            <p className={cn("text-xs italic leading-relaxed", e.cor)}>“{e.clamor}”</p>
            <div className="pt-1">
              <p className="text-sm font-semibold">
                {e.poder}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {e.poderAcao}{e.poderCustoPe ? ` · ${e.poderCustoPe} PE` : ""} · adicionado às Habilidades
              </p>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{e.poderDesc}</p>
            </div>
          </div>
        ))}
          </div>
        </section>
      )}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {HEXATOMBE_RULE_CARDS.map((rule) => (
          <div key={rule.titulo} className="border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-400">{rule.titulo}</p>
            <p className="mt-1 text-sm font-semibold">{rule.subtitulo}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{rule.texto}</p>
          </div>
        ))}
      </section>

      {/* Regras da Forma Suprema */}
      <div className="border border-border p-4 space-y-3">
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
      <div className="border border-border p-4 space-y-3">
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

function HexSummary({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex min-h-24 flex-col justify-end border-r border-border p-4 last:border-r-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className={cn("mt-2 text-xl font-semibold", danger && "text-red-500")}>{value}</p>
    </div>
  );
}

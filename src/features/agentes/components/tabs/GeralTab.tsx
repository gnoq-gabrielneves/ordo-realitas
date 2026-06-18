"use client";

import { ImageUpload } from "@/shared/components/ImageUpload/ImageUpload";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { CLASSES, calcularCargaMax, calcularLimitePE, calcularRecursos, calcularRecursosPD } from "@/shared/utils/agentCalc";
import { AgentSheet } from "@/shared/types/agent";
import { Wand2 } from "lucide-react";
import { useEffect } from "react";

interface GeralTabProps {
  data: AgentSheet;
  onChange: (patch: Partial<AgentSheet>) => void;
  /** No modo Forma Suprema os valores vêm da base + bônus, não das fórmulas de classe. */
  formaSuprema?: boolean;
}

function NumField({ label, value, onChange, min = 0, hint }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; hint?: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-1">
        <Label className="text-xs">{label}</Label>
        {hint !== undefined && hint !== value && (
          <button
            type="button"
            onClick={() => onChange(hint)}
            className="text-[10px] text-primary/70 hover:text-primary transition-colors"
            title={`Calcular: ${hint}`}
          >
            ={hint}
          </button>
        )}
      </div>
      <Input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 text-sm text-center"
      />
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 text-sm"
      />
    </div>
  );
}

export function GeralTab({ data, onChange, formaSuprema }: GeralTabProps) {
  const defesa = 10 + data.agi + data.defesa_bonus + data.defesa_equip;
  const isSobrevivente = data.classe === "Sobrevivente";

  // Auto-calc PE por rodada e carga máxima sempre que NEX, classe ou Força mudar
  // (desligado na Forma Suprema — esses valores vêm da base).
  useEffect(() => {
    if (formaSuprema) return;
    const limitePE = calcularLimitePE(data.nex, data.classe);
    const cargaMax = calcularCargaMax(data.forca);
    const patch: Partial<AgentSheet> = {};
    if (data.pe_por_rodada !== limitePE) patch.pe_por_rodada = limitePE;
    if (data.carga_max !== cargaMax) patch.carga_max = cargaMax;
    if (Object.keys(patch).length > 0) onChange(patch);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.nex, data.classe, data.forca, formaSuprema]);

  // Fórmulas de classe não se aplicam à forma desperta.
  const recursos    = formaSuprema ? null : calcularRecursos(data.classe, data.nex, data.vigor, data.presenca);
  const recursosPD  = formaSuprema ? null : calcularRecursosPD(data.classe, data.nex, data.vigor, data.presenca);

  const aplicarRecursos = () => {
    if (data.usa_pd) {
      if (!recursosPD) return;
      onChange({ pv_max: recursosPD.pv_max, pd_max: recursosPD.pd_max });
    } else {
      if (!recursos) return;
      onChange({ pv_max: recursos.pv_max, pe_max: recursos.pe_max, san_max: recursos.san_max });
    }
  };

  const recursosDesatualizados = data.usa_pd
    ? recursosPD && (recursosPD.pv_max !== data.pv_max || recursosPD.pd_max !== data.pd_max)
    : recursos && (recursos.pv_max !== data.pv_max || recursos.pe_max !== data.pe_max || recursos.san_max !== data.san_max);

  return (
    <div className="space-y-6">
      {/* Identidade */}
      <div className="flex gap-6 items-start">
        <ImageUpload
          value={data.image_url}
          onChange={(url) => onChange({ image_url: url })}
          bucket="agentes"
        />
        <div className="flex-1 grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">Nome do Personagem</Label>
            <Input
              value={data.nome ?? ""}
              onChange={(e) => onChange({ nome: e.target.value || null })}
              placeholder="Nome do agente"
              className="h-8 text-sm"
            />
          </div>
          <TextField
            label="Origem"
            value={data.origem ?? ""}
            onChange={(v) => onChange({ origem: v || null })}
            placeholder="Ex: Policial"
          />
          <div className="space-y-1.5">
            <Label className="text-xs">Classe</Label>
            <Select
              value={data.classe ?? ""}
              onValueChange={(v) => onChange({ classe: v || null })}
            >
              <SelectTrigger className="w-full h-8 text-sm">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent position="popper">
                {CLASSES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">Trilha</Label>
            <Input
              value={data.trilha ?? ""}
              onChange={(e) => onChange({ trilha: e.target.value || null })}
              placeholder="Ex: Agente de Campo"
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>

      {/* NEX / Estágio + Deslocamento */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">{isSobrevivente ? "Estágio (1-5)" : "NEX (%)"}</Label>
          <Input
            type="number"
            min={isSobrevivente ? 1 : 5}
            max={isSobrevivente ? 5 : 99}
            value={data.nex}
            onChange={(e) => onChange({ nex: Number(e.target.value) })}
            className="h-8 text-sm text-center"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Limite PE / Rodada</Label>
          <div className="h-8 rounded-md border border-border bg-muted/30 flex items-center justify-center text-sm font-semibold text-muted-foreground">
            {calcularLimitePE(data.nex, data.classe)}
          </div>
        </div>
        <TextField
          label="Deslocamento"
          value={data.deslocamento}
          onChange={(v) => onChange({ deslocamento: v })}
          placeholder="9m/6q"
        />
      </div>

      {/* Atributos */}
      <div className="rounded-md border border-border p-4 space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Atributos</p>
        <div className="grid grid-cols-5 gap-3">
          {([
            ["AGI", "agi"], ["FOR", "forca"], ["INT", "intelecto"], ["PRE", "presenca"], ["VIG", "vigor"]
          ] as [string, keyof AgentSheet][]).map(([label, key]) => (
            <div key={key} className="space-y-1.5 text-center">
              <Label className="text-xs">{label}</Label>
              <Input
                type="number"
                min={-5}
                max={20}
                value={data[key] as number}
                onChange={(e) => onChange({ [key]: Number(e.target.value) })}
                className="h-9 text-center text-base font-semibold"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Recursos */}
      <div className="rounded-md border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recursos</p>
          <div className="flex items-center gap-3">
            {recursosDesatualizados && (
              <span className="text-[10px] text-amber-400">Valores calculados disponíveis</span>
            )}
            <div className="flex items-center gap-2">
              {recursos && (
                <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] px-2 gap-1" onClick={aplicarRecursos}>
                  <Wand2 className="h-3 w-3" />
                  Calcular máximos
                </Button>
              )}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-xs text-muted-foreground">PD</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={data.usa_pd}
                  onClick={() => onChange({ usa_pd: !data.usa_pd })}
                  className={`relative h-5 w-9 rounded-full transition-colors ${data.usa_pd ? "bg-primary" : "bg-muted"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${data.usa_pd ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </label>
            </div>
          </div>
        </div>

        {data.usa_pd ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs text-center font-medium">PV — Pontos de Vida</p>
              <div className="grid grid-cols-2 gap-2">
                <NumField label="Máx." value={data.pv_max} onChange={(v) => onChange({ pv_max: v })} hint={recursosPD?.pv_max} />
                <NumField label="Atual" value={data.pv_atual} onChange={(v) => onChange({ pv_atual: v })} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-center font-medium">PD — Pontos de Determinação</p>
              <div className="grid grid-cols-2 gap-2">
                <NumField label="Máx." value={data.pd_max} onChange={(v) => onChange({ pd_max: v })} hint={recursosPD?.pd_max} />
                <NumField label="Atual" value={data.pd_atual} onChange={(v) => onChange({ pd_atual: v })} />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-xs text-center font-medium">PV — Pontos de Vida</p>
              <div className="grid grid-cols-2 gap-2">
                <NumField label="Máx." value={data.pv_max} onChange={(v) => onChange({ pv_max: v })} hint={recursos?.pv_max} />
                <NumField label="Atual" value={data.pv_atual} onChange={(v) => onChange({ pv_atual: v })} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-center font-medium">PE — Pontos de Esforço</p>
              <div className="grid grid-cols-2 gap-2">
                <NumField label="Máx." value={data.pe_max} onChange={(v) => onChange({ pe_max: v })} hint={recursos?.pe_max} />
                <NumField label="Atual" value={data.pe_atual} onChange={(v) => onChange({ pe_atual: v })} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-center font-medium">SAN — Sanidade</p>
              <div className="grid grid-cols-2 gap-2">
                <NumField label="Máx." value={data.san_max} onChange={(v) => onChange({ san_max: v })} hint={recursos?.san_max} />
                <NumField label="Atual" value={data.san_atual} onChange={(v) => onChange({ san_atual: v })} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Combate passivo */}
      <div className="rounded-md border border-border p-4 space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Defesa & Proteção</p>
        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-1.5 text-center">
            <Label className="text-xs">Defesa Total</Label>
            <div className="h-8 rounded-md border border-border bg-muted/30 flex items-center justify-center text-sm font-semibold">
              {defesa}
            </div>
          </div>
          <NumField label="Bônus Outros" value={data.defesa_bonus} onChange={(v) => onChange({ defesa_bonus: v })} />
          <NumField label="Bônus Equip." value={data.defesa_equip} onChange={(v) => onChange({ defesa_equip: v })} />
          <div className="space-y-1.5">
            <Label className="text-xs">Proteção</Label>
            <Input
              value={data.protecao ?? ""}
              onChange={(e) => onChange({ protecao: e.target.value || null })}
              className="h-8 text-sm"
              placeholder="Ex: 3"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Resistências</Label>
          <Input
            value={data.resistencias ?? ""}
            onChange={(e) => onChange({ resistencias: e.target.value || null })}
            className="h-8 text-sm"
            placeholder="Ex: +5 vs Medo"
          />
        </div>
      </div>

      {/* Carga e Prestígio */}
      <div className="grid grid-cols-3 gap-3">
        <NumField label="Pontos de Prestígio" value={data.pontos_prestigio} onChange={(v) => onChange({ pontos_prestigio: v })} />
        <NumField label="Limite de Crédito (I-IV)" value={data.limite_credito} onChange={(v) => onChange({ limite_credito: Math.min(4, Math.max(1, v)) })} />
        <TextField label="Patente" value={data.patente ?? ""} onChange={(v) => onChange({ patente: v || null })} placeholder="Ex: Agente Especial" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Carga Máxima (espaços)</Label>
          <div className="flex items-center gap-2">
            <div className="h-8 flex-1 rounded-md border border-border bg-muted/30 flex items-center justify-center text-sm font-semibold text-muted-foreground">
              {calcularCargaMax(data.forca)} esp.
            </div>
            <span className="text-[10px] text-muted-foreground">baseado em FOR {data.forca}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

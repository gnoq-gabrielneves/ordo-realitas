"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { AgentHabilidade, AgentSheet } from "@/shared/types/agent";
import { GripVertical, Plus, Trash2, Zap } from "lucide-react";

interface HabilidadesTabProps {
  data: AgentSheet;
  onChange: (patch: Partial<AgentSheet>) => void;
}

const ACOES = ["Passiva", "Livre", "Reação", "Movimento", "Padrão", "Completa"];

export function HabilidadesTab({ data, onChange }: HabilidadesTabProps) {
  const habilidades: AgentHabilidade[] = data.habilidades ?? [];

  const set = (i: number, patch: Partial<AgentHabilidade>) =>
    onChange({ habilidades: habilidades.map((h, idx) => (idx === i ? { ...h, ...patch } : h)) });

  const add = () =>
    onChange({ habilidades: [...habilidades, { nome: "", descricao: "", acao: "", custo_pe: 0 }] });

  const remove = (i: number) =>
    onChange({ habilidades: habilidades.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-3">
      {habilidades.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Zap className="h-8 w-8 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">Nenhuma habilidade cadastrada.</p>
        </div>
      ) : (
        habilidades.map((h, i) => (
          <div key={i} className="group rounded-md border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground/30 shrink-0" />
              <Input
                value={h.nome}
                onChange={(e) => set(i, { nome: e.target.value })}
                placeholder="Nome da habilidade"
                className="h-8 text-sm font-medium flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => remove(i)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="flex gap-2">
              <div className="w-36 shrink-0">
                <Select
                  value={h.acao ?? ""}
                  onValueChange={(v) => set(i, { acao: v === "__none__" ? "" : v })}
                >
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Ação" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="__none__" className="text-muted-foreground">— sem ação —</SelectItem>
                    {ACOES.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1.5 w-28 shrink-0">
                <Input
                  type="number"
                  min={0}
                  value={h.custo_pe ?? 0}
                  onChange={(e) => set(i, { custo_pe: Number(e.target.value) })}
                  className="h-8 text-xs text-center w-14"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {data.usa_pd ? "PD" : "PE"}
                </span>
              </div>
            </div>

            <Textarea
              value={h.descricao}
              onChange={(e) => set(i, { descricao: e.target.value })}
              placeholder="Descreva o efeito da habilidade..."
              rows={3}
              className="resize-none text-sm"
            />
          </div>
        ))
      )}

      <Button type="button" variant="outline" className="w-full" onClick={add}>
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Habilidade
      </Button>
    </div>
  );
}

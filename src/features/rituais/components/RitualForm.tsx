"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { ELEMENTO_LABELS, ELEMENTO_TEXT } from "@/shared/constants/elements";
import { CUSTO_PE, Ritual, RitualCirculo, RitualElemento, RitualPayload } from "@/shared/types/ritual";
import { useState } from "react";

interface RitualFormProps {
  initial?: Ritual;
  onSubmit: (payload: RitualPayload) => void;
  loading?: boolean;
}

const empty: RitualPayload = {
  nome: "",
  elemento: "conhecimento",
  circulo: 1,
  execucao: "Ação Padrão",
  alcance: "Pessoal",
  alvo: null,
  duracao: null,
  resistencia: null,
  dt: null,
  descricao: null,
};

export function RitualForm({ initial, onSubmit, loading }: RitualFormProps) {
  const [form, setForm] = useState<RitualPayload>(initial ? {
    nome: initial.nome,
    elemento: initial.elemento,
    circulo: initial.circulo,
    execucao: initial.execucao,
    alcance: initial.alcance,
    alvo: initial.alvo,
    duracao: initial.duracao,
    resistencia: initial.resistencia,
    dt: initial.dt,
    descricao: initial.descricao,
  } : empty);

  const set = <K extends keyof RitualPayload>(k: K, v: RitualPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nome */}
      <div className="space-y-1.5">
        <Label>Nome do Ritual</Label>
        <Input
          value={form.nome}
          onChange={(e) => set("nome", e.target.value)}
          placeholder="Ex: Visão do Além, Chama Negra..."
          required
        />
      </div>

      {/* Elemento + Círculo */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Elemento</Label>
          <Select value={form.elemento} onValueChange={(v) => set("elemento", v as RitualElemento)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {(Object.entries(ELEMENTO_LABELS) as [RitualElemento, string][]).map(([k, label]) => (
                <SelectItem key={k} value={k}>
                  <span className={ELEMENTO_TEXT[k]}>{label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Círculo</Label>
          <Select
            value={String(form.circulo)}
            onValueChange={(v) => set("circulo", Number(v) as RitualCirculo)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {([1, 2, 3, 4] as RitualCirculo[]).map((c) => (
                <SelectItem key={c} value={String(c)}>
                  {c}° Círculo — {CUSTO_PE[c]} PE
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="rounded-md border border-border p-4 space-y-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Parâmetros</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Execução</Label>
            <Select value={form.execucao} onValueChange={(v) => set("execucao", v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="Ação Padrão">Ação Padrão</SelectItem>
                <SelectItem value="Ação de Movimento">Ação de Movimento</SelectItem>
                <SelectItem value="Ação Completa">Ação Completa</SelectItem>
                <SelectItem value="Reação">Reação</SelectItem>
                <SelectItem value="Livre">Livre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Alcance</Label>
            <Select value={form.alcance} onValueChange={(v) => set("alcance", v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="Pessoal">Pessoal</SelectItem>
                <SelectItem value="Curto">Curto</SelectItem>
                <SelectItem value="Médio">Médio</SelectItem>
                <SelectItem value="Longo">Longo</SelectItem>
                <SelectItem value="Extremo">Extremo</SelectItem>
                <SelectItem value="Ilimitado">Ilimitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Alvo</Label>
            <Input
              value={form.alvo ?? ""}
              onChange={(e) => set("alvo", e.target.value || null)}
              placeholder="Ex: 1 criatura, Você..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Duração</Label>
            <Input
              value={form.duracao ?? ""}
              onChange={(e) => set("duracao", e.target.value || null)}
              placeholder="Ex: Instantâneo, 1 cena..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Resistência</Label>
            <Input
              value={form.resistencia ?? ""}
              onChange={(e) => set("resistencia", e.target.value || null)}
              placeholder="Ex: Vontade reduz à metade"
            />
          </div>
          <div className="space-y-1.5">
            <Label>DT</Label>
            <Input
              type="number"
              min={0}
              value={form.dt ?? ""}
              onChange={(e) => set("dt", e.target.value ? Number(e.target.value) : null)}
              placeholder="Ex: 14"
            />
          </div>
        </div>
      </div>

      {/* Descrição */}
      <div className="space-y-1.5">
        <Label>Descrição / Efeito</Label>
        <Textarea
          value={form.descricao ?? ""}
          onChange={(e) => set("descricao", e.target.value || null)}
          placeholder="Descreva o efeito do ritual..."
          rows={5}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading || !form.nome.trim()}>
          {loading ? "Salvando..." : initial ? "Salvar Alterações" : "Criar Ritual"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Item, ItemCategoria, ItemPayload } from "@/shared/types/item";
import { useState } from "react";

interface ItemFormProps {
  initial?: Item;
  onSubmit: (payload: ItemPayload) => void;
  loading?: boolean;
}

const CREDITO_LABELS: Record<number, string> = {
  1: "I — Básico",
  2: "II — Padrão",
  3: "III — Restrito",
  4: "IV — Militar",
};

const empty: ItemPayload = {
  nome: "",
  categoria: "geral",
  subcategoria: null,
  espacos: 1,
  dano: null,
  teste: null,
  critico: null,
  alcance: null,
  especial: null,
  protecao_valor: null,
  penalidade: null,
  descricao: null,
  credito_tier: 1,
};

export function ItemForm({ initial, onSubmit, loading }: ItemFormProps) {
  const [form, setForm] = useState<ItemPayload>(initial ? {
    nome: initial.nome,
    categoria: initial.categoria,
    subcategoria: initial.subcategoria,
    espacos: initial.espacos,
    dano: initial.dano,
    teste: initial.teste,
    critico: initial.critico,
    alcance: initial.alcance,
    especial: initial.especial,
    protecao_valor: initial.protecao_valor,
    penalidade: initial.penalidade,
    descricao: initial.descricao,
    credito_tier: initial.credito_tier,
  } : empty);

  const set = <K extends keyof ItemPayload>(k: K, v: ItemPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const setCategoria = (cat: ItemCategoria) => {
    setForm((f) => ({
      ...f,
      categoria: cat,
      subcategoria: null,
      dano: null, teste: null, critico: null, alcance: null, especial: null,
      protecao_valor: null, penalidade: null,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identidade */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1.5">
          <Label>Nome</Label>
          <Input
            value={form.nome}
            onChange={(e) => set("nome", e.target.value)}
            placeholder="Ex: Pistola .38, Colete Balístico..."
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label>Categoria</Label>
          <Select value={form.categoria} onValueChange={(v) => setCategoria(v as ItemCategoria)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="arma">Arma</SelectItem>
              <SelectItem value="protecao">Proteção</SelectItem>
              <SelectItem value="geral">Geral / Equipamento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {form.categoria === "arma" && (
          <div className="space-y-1.5">
            <Label>Tipo de Arma</Label>
            <Select
              value={form.subcategoria ?? ""}
              onValueChange={(v) => set("subcategoria", v || null)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="simples">Simples</SelectItem>
                <SelectItem value="tatica">Tática</SelectItem>
                <SelectItem value="pesada">Pesada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {form.categoria === "protecao" && (
          <div className="space-y-1.5">
            <Label>Tipo de Proteção</Label>
            <Select
              value={form.subcategoria ?? ""}
              onValueChange={(v) => set("subcategoria", v || null)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="leve">Leve</SelectItem>
                <SelectItem value="pesada">Pesada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Campos específicos — Arma */}
      {form.categoria === "arma" && (
        <div className="rounded-md border border-border p-4 space-y-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estatísticas da Arma</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label>Teste</Label>
              <Select value={form.teste ?? ""} onValueChange={(v) => set("teste", v || null)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Atrib." />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="AGI">AGI</SelectItem>
                  <SelectItem value="FOR">FOR</SelectItem>
                  <SelectItem value="INT">INT</SelectItem>
                  <SelectItem value="PRE">PRE</SelectItem>
                  <SelectItem value="VIG">VIG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Dano</Label>
              <Input
                value={form.dano ?? ""}
                onChange={(e) => set("dano", e.target.value || null)}
                placeholder="Ex: 1d6+2"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Crítico</Label>
              <Input
                value={form.critico ?? ""}
                onChange={(e) => set("critico", e.target.value || null)}
                placeholder="Ex: 20/x2"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Alcance</Label>
              <Input
                value={form.alcance ?? ""}
                onChange={(e) => set("alcance", e.target.value || null)}
                placeholder="Ex: Curto"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Especial</Label>
            <Input
              value={form.especial ?? ""}
              onChange={(e) => set("especial", e.target.value || null)}
              placeholder="Características especiais, munição, etc."
            />
          </div>
        </div>
      )}

      {/* Campos específicos — Proteção */}
      {form.categoria === "protecao" && (
        <div className="rounded-md border border-border p-4 space-y-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estatísticas da Proteção</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Proteção</Label>
              <Input
                value={form.protecao_valor ?? ""}
                onChange={(e) => set("protecao_valor", e.target.value || null)}
                placeholder="Ex: 3"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Penalidade</Label>
              <Input
                value={form.penalidade ?? ""}
                onChange={(e) => set("penalidade", e.target.value || null)}
                placeholder="Ex: -2 Furtividade"
              />
            </div>
          </div>
        </div>
      )}

      {/* Descrição geral */}
      <div className="space-y-1.5">
        <Label>Descrição</Label>
        <Textarea
          value={form.descricao ?? ""}
          onChange={(e) => set("descricao", e.target.value || null)}
          placeholder="Descrição do item, lore, efeitos especiais..."
          rows={3}
        />
      </div>

      {/* Inventário / Crédito */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Espaços no inventário</Label>
          <Input
            type="number"
            min={0}
            value={form.espacos}
            onChange={(e) => set("espacos", Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Limite de Crédito</Label>
          <Select
            value={String(form.credito_tier)}
            onValueChange={(v) => set("credito_tier", Number(v) as 1 | 2 | 3 | 4)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {[1, 2, 3, 4].map((t) => (
                <SelectItem key={t} value={String(t)}>{CREDITO_LABELS[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading || !form.nome.trim()}>
          {loading ? "Salvando..." : initial ? "Salvar Alterações" : "Criar Item"}
        </Button>
      </div>
    </form>
  );
}

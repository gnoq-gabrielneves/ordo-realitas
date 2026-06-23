"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Item, ItemCategoria, ItemCategoriaValor, ItemPayload } from "@/shared/types/item";
import { useState } from "react";

interface ItemFormProps {
  initial?: Item;
  onSubmit: (payload: ItemPayload) => void;
  loading?: boolean;
}

const CREDITO_LABELS: Record<number, string> = {
  0: "0 — Livre",
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
};

const empty: ItemPayload = {
  nome: "",
  categoria: "geral",
  subcategoria: null,
  categoria_valor: 0,
  espacos: 1,
  espacos_texto: null,
  proficiencia: null,
  tipo_arma: null,
  empunhadura: null,
  dano: null,
  teste: null,
  critico: null,
  alcance: null,
  tipo_dano: null,
  especial: null,
  protecao_valor: null,
  defesa_bonus: null,
  rd: null,
  penalidade: null,
  descricao: null,
  image_url: null,
  bonus_pericia: null,
  acao_uso: null,
  custo_pe: null,
  dt: null,
  duracao: null,
  resistencia: null,
  requisitos: null,
  tags: [],
  fonte: "manual",
  oficial: false,
  data: {},
  credito_tier: 0,
};

export function ItemForm({ initial, onSubmit, loading }: ItemFormProps) {
  const [form, setForm] = useState<ItemPayload>(initial ? {
    nome: initial.nome,
    categoria: initial.categoria,
    subcategoria: initial.subcategoria,
    categoria_valor: initial.categoria_valor ?? initial.credito_tier ?? 0,
    espacos: initial.espacos,
    espacos_texto: initial.espacos_texto,
    proficiencia: initial.proficiencia,
    tipo_arma: initial.tipo_arma,
    empunhadura: initial.empunhadura,
    dano: initial.dano,
    teste: initial.teste,
    critico: initial.critico,
    alcance: initial.alcance,
    tipo_dano: initial.tipo_dano,
    especial: initial.especial,
    protecao_valor: initial.protecao_valor,
    defesa_bonus: initial.defesa_bonus,
    rd: initial.rd,
    penalidade: initial.penalidade,
    descricao: initial.descricao,
    image_url: initial.image_url,
    bonus_pericia: initial.bonus_pericia,
    acao_uso: initial.acao_uso,
    custo_pe: initial.custo_pe,
    dt: initial.dt,
    duracao: initial.duracao,
    resistencia: initial.resistencia,
    requisitos: initial.requisitos,
    tags: initial.tags ?? [],
    fonte: initial.fonte ?? "manual",
    oficial: initial.oficial ?? false,
    data: initial.data ?? {},
    credito_tier: initial.categoria_valor ?? initial.credito_tier ?? 0,
  } : empty);

  const set = <K extends keyof ItemPayload>(k: K, v: ItemPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const setCategoria = (cat: ItemCategoria) => {
    setForm((f) => ({
      ...f,
      categoria: cat,
      subcategoria: null,
      dano: null, teste: null, critico: null, alcance: null, especial: null,
      tipo_dano: null, proficiencia: null, tipo_arma: null, empunhadura: null,
      protecao_valor: null, defesa_bonus: null, rd: null, penalidade: null,
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
              <SelectItem value="municao">Munição</SelectItem>
              <SelectItem value="modificacao">Modificação</SelectItem>
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
                <SelectItem value="escudo">Escudo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {form.categoria === "geral" && (
          <div className="space-y-1.5">
            <Label>Tipo de equipamento</Label>
            <Select value={form.subcategoria ?? ""} onValueChange={(v) => set("subcategoria", v || null)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="acessorio">Acessório</SelectItem>
                <SelectItem value="explosivo">Explosivo</SelectItem>
                <SelectItem value="operacional">Operacional</SelectItem>
                <SelectItem value="paranormal">Paranormal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {form.categoria === "modificacao" && (
          <div className="space-y-1.5">
            <Label>Aplica em</Label>
            <Select value={form.subcategoria ?? ""} onValueChange={(v) => set("subcategoria", v || null)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="arma">Arma</SelectItem>
                <SelectItem value="protecao">Proteção</SelectItem>
                <SelectItem value="acessorio">Acessório</SelectItem>
                <SelectItem value="municao">Munição</SelectItem>
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
              <Label>Teste de ataque</Label>
              <Select value={form.teste ?? ""} onValueChange={(v) => set("teste", v || null)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Atrib." />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="Luta">Luta</SelectItem>
                  <SelectItem value="Pontaria">Pontaria</SelectItem>
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
            <div className="space-y-1.5">
              <Label>Tipo de dano</Label>
              <Input
                value={form.tipo_dano ?? ""}
                onChange={(e) => set("tipo_dano", e.target.value || null)}
                placeholder="C, I, P, B, Fogo..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de arma</Label>
              <Input
                value={form.tipo_arma ?? ""}
                onChange={(e) => set("tipo_arma", e.target.value || null)}
                placeholder="Corpo a corpo, fogo..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Empunhadura</Label>
              <Input
                value={form.empunhadura ?? ""}
                onChange={(e) => set("empunhadura", e.target.value || null)}
                placeholder="Leve, uma mão, duas mãos"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Proficiência</Label>
              <Input
                value={form.proficiencia ?? ""}
                onChange={(e) => set("proficiencia", e.target.value || null)}
                placeholder="Simples, tática, pesada"
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
              <Label>Defesa</Label>
              <Input
                value={form.protecao_valor ?? ""}
                onChange={(e) => set("protecao_valor", e.target.value || null)}
                placeholder="Ex: +5"
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
            <div className="space-y-1.5">
              <Label>RD / Resistência</Label>
              <Input
                value={form.rd ?? ""}
                onChange={(e) => set("rd", e.target.value || null)}
                placeholder="Ex: Balístico 2"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Bônus numérico de defesa</Label>
              <Input
                type="number"
                value={form.defesa_bonus ?? ""}
                onChange={(e) => set("defesa_bonus", e.target.value === "" ? null : Number(e.target.value))}
                placeholder="Ex: 5"
              />
            </div>
          </div>
        </div>
      )}

      {(form.categoria === "geral" || form.categoria === "municao" || form.categoria === "modificacao") && (
        <div className="rounded-md border border-border p-4 space-y-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Regras de Uso</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Bônus / Perícia</Label>
              <Input value={form.bonus_pericia ?? ""} onChange={(e) => set("bonus_pericia", e.target.value || null)} placeholder="+5 Percepção" />
            </div>
            <div className="space-y-1.5">
              <Label>Ação</Label>
              <Input value={form.acao_uso ?? ""} onChange={(e) => set("acao_uso", e.target.value || null)} placeholder="Padrão, movimento..." />
            </div>
            <div className="space-y-1.5">
              <Label>Custo PE</Label>
              <Input type="number" min={0} value={form.custo_pe ?? ""} onChange={(e) => set("custo_pe", e.target.value === "" ? null : Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>DT / Resistência</Label>
              <Input value={form.dt ?? ""} onChange={(e) => set("dt", e.target.value || null)} placeholder="Fortitude DT Agi" />
            </div>
            <div className="space-y-1.5">
              <Label>Duração</Label>
              <Input value={form.duracao ?? ""} onChange={(e) => set("duracao", e.target.value || null)} placeholder="Cena, rodada..." />
            </div>
            <div className="space-y-1.5">
              <Label>Alcance / Área</Label>
              <Input value={form.alcance ?? ""} onChange={(e) => set("alcance", e.target.value || null)} placeholder="Curto, médio, 6m..." />
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

      <div className="space-y-1.5">
        <Label>Requisitos / Observações</Label>
        <Input
          value={form.requisitos ?? ""}
          onChange={(e) => set("requisitos", e.target.value || null)}
          placeholder="Ex: só para proteções pesadas; requer proficiência..."
        />
      </div>

      {/* Inventário / Crédito */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
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
          <Label>Espaços especiais</Label>
          <Input
            value={form.espacos_texto ?? ""}
            onChange={(e) => set("espacos_texto", e.target.value || null)}
            placeholder="Ex: *"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Categoria do item</Label>
          <Select
            value={String(form.categoria_valor)}
            onValueChange={(v) => {
              const value = Number(v) as ItemCategoriaValor;
              setForm((current) => ({ ...current, categoria_valor: value, credito_tier: value }));
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {[0, 1, 2, 3, 4, 5, 6].map((t) => (
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

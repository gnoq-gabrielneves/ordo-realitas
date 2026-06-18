"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useItens } from "@/features/itens/hooks/useItens";
import { AgentAtaque, AgentSheet } from "@/shared/types/agent";
import { Item } from "@/shared/types/item";
import { Package, Plus, Trash2 } from "lucide-react";

interface CombateTabProps {
  data: AgentSheet;
  onChange: (patch: Partial<AgentSheet>) => void;
}

// Opções de teste de ataque: perícias de combate (com atributo) + atributos crus.
const TESTES = ["Luta (FOR)", "Luta (AGI)", "Pontaria (AGI)", "AGI", "FOR", "INT", "PRE", "VIG"];

const emptyAtaque = (): AgentAtaque => ({
  nome: "", teste: "Luta (FOR)", dano: "", critico: "", alcance: "", especial: "",
});

// Converte uma arma do inventário em um ataque preenchido.
function ataqueFromItem(item: Item): AgentAtaque {
  const agil = (item.especial ?? "").toLowerCase().includes("ágil");
  const teste =
    item.teste === "Pontaria" ? "Pontaria (AGI)" : agil ? "Luta (AGI)" : "Luta (FOR)";
  const limpa = (v: string | null) => (v && v !== "—" ? v : "");
  return {
    nome: item.nome,
    teste,
    dano: limpa(item.dano),
    critico: limpa(item.critico),
    alcance: limpa(item.alcance),
    especial: limpa(item.especial),
  };
}

function ProfCheck({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`h-4 w-4 rounded border transition-colors shrink-0 ${checked ? "bg-primary border-primary" : "border-border hover:border-primary/50"}`}
      >
        {checked && (
          <svg className="mx-auto h-2.5 w-2.5 text-primary-foreground" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <span className="text-sm">{label}</span>
    </label>
  );
}

export function CombateTab({ data, onChange }: CombateTabProps) {
  const ataques = data.ataques ?? [];
  const { data: allItens = [] } = useItens();

  // Armas presentes no inventário (com dados completos do item).
  const armasInventario = (data.inventario ?? [])
    .map((inv, idx) => {
      const cat = inv.categoria.split("·")[0];
      if (cat !== "arma") return null;
      const full = allItens.find((x) => x.id === inv.item_id);
      return full ? { key: `${idx}-${full.id}`, item: full } : null;
    })
    .filter((x): x is { key: string; item: Item } => x !== null);

  const setAtaque = (i: number, patch: Partial<AgentAtaque>) => {
    const updated = ataques.map((a, idx) => idx === i ? { ...a, ...patch } : a);
    onChange({ ataques: updated });
  };

  const addAtaque = () => onChange({ ataques: [...ataques, emptyAtaque()] });

  const addFromInventario = (key: string) => {
    const found = armasInventario.find((a) => a.key === key);
    if (found) onChange({ ataques: [...ataques, ataqueFromItem(found.item)] });
  };

  const removeAtaque = (i: number) =>
    onChange({ ataques: ataques.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-6">
      {/* Proficiências */}
      <div className="rounded-md border border-border p-4 space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Proficiências</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Armas</p>
            <ProfCheck label="Simples" checked={data.prof_arma_simples} onChange={(v) => onChange({ prof_arma_simples: v })} />
            <ProfCheck label="Táticas" checked={data.prof_arma_tatica} onChange={(v) => onChange({ prof_arma_tatica: v })} />
            <ProfCheck label="Pesadas" checked={data.prof_arma_pesada} onChange={(v) => onChange({ prof_arma_pesada: v })} />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Proteções</p>
            <ProfCheck label="Leves" checked={data.prof_prot_leve} onChange={(v) => onChange({ prof_prot_leve: v })} />
            <ProfCheck label="Pesadas" checked={data.prof_prot_pesada} onChange={(v) => onChange({ prof_prot_pesada: v })} />
          </div>
        </div>
      </div>

      {/* Ataques */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ataques</p>
          <div className="flex items-center gap-2">
            {armasInventario.length > 0 && (
              <Select value="" onValueChange={addFromInventario}>
                <SelectTrigger className="w-auto h-8 text-xs gap-1.5">
                  <Package className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Puxar do inventário" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {armasInventario.map(({ key, item }) => (
                    <SelectItem key={key} value={key}>
                      {item.nome}
                      {item.dano ? <span className="text-muted-foreground"> · {item.dano}</span> : null}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button type="button" variant="outline" size="sm" onClick={addAtaque}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Adicionar
            </Button>
          </div>
        </div>

        {ataques.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhum ataque cadastrado.</p>
        )}

        {ataques.map((ataque, i) => (
          <div key={i} className="rounded-md border border-border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Input
                value={ataque.nome}
                onChange={(e) => setAtaque(i, { nome: e.target.value })}
                placeholder="Nome do ataque / arma"
                className="h-8 text-sm flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                onClick={() => removeAtaque(i)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Teste</Label>
                <Select value={ataque.teste} onValueChange={(v) => setAtaque(i, { teste: v })}>
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {TESTES.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Dano</Label>
                <Input value={ataque.dano} onChange={(e) => setAtaque(i, { dano: e.target.value })} placeholder="1d6+2" className="h-8 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Crítico</Label>
                <Input value={ataque.critico} onChange={(e) => setAtaque(i, { critico: e.target.value })} placeholder="20/x2" className="h-8 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Alcance</Label>
                <Input value={ataque.alcance} onChange={(e) => setAtaque(i, { alcance: e.target.value })} placeholder="Curto" className="h-8 text-xs" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Especial</Label>
              <Input value={ataque.especial} onChange={(e) => setAtaque(i, { especial: e.target.value })} placeholder="Características especiais..." className="h-8 text-xs" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

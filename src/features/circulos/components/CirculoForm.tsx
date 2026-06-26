"use client";

import { ImageUpload } from "@/shared/components/ImageUpload/ImageUpload";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Circle, CirclePayload, CircleTipo } from "@/shared/types/circle";
import { Eye, Network, Save } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

const TIPO_OPTIONS: { value: CircleTipo; label: string }[] = [
  { value: "organizacao", label: "Organização" },
  { value: "familia", label: "Família" },
  { value: "culto", label: "Culto" },
  { value: "faccao", label: "Facção" },
  { value: "grupo", label: "Grupo" },
  { value: "outro", label: "Outro" },
];

const EMPTY_PAYLOAD: CirclePayload = {
  nome: "",
  tipo: "grupo",
  image_url: null,
  descricao: null,
  lideranca: null,
  sede: null,
  objetivo: null,
  reputacao: null,
  segredos: null,
  notas: null,
};

interface CirculoFormProps {
  initial?: Circle;
  onSubmit: (payload: CirclePayload) => void;
  isLoading?: boolean;
}

export function CirculoForm({ initial, onSubmit, isLoading }: CirculoFormProps) {
  const [form, setForm] = useState<CirclePayload>(
    initial ? {
      nome: initial.nome,
      tipo: initial.tipo,
      image_url: initial.image_url,
      descricao: initial.descricao,
      lideranca: initial.lideranca,
      sede: initial.sede,
      objetivo: initial.objetivo,
      reputacao: initial.reputacao,
      segredos: initial.segredos,
      notas: initial.notas,
    } : EMPTY_PAYLOAD
  );

  function set<K extends keyof CirclePayload>(key: K, value: CirclePayload[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <EditorCard title="Identidade" icon={<Network className="h-4 w-4" />} description="Nome, tipo e presença visual do círculo nos arquivos da mesa.">
          <div className="grid gap-5 md:grid-cols-[170px_minmax(0,1fr)]">
            <Field label="Imagem">
              <ImageUpload bucket="circulos" value={form.image_url} onChange={(url) => set("image_url", url)} className="aspect-square h-auto w-full" />
            </Field>
            <div className="grid content-start gap-4">
              <Field label="Nome *">
                <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} required placeholder="Ex: Família Leone" />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Tipo">
                  <Select value={form.tipo} onValueChange={(value) => set("tipo", value as CircleTipo)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent position="popper">
                      {TIPO_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Sede">
                  <Input value={form.sede ?? ""} onChange={(e) => set("sede", e.target.value || null)} placeholder="Cidade, mansão, base..." />
                </Field>
              </div>
              <Field label="Descrição">
                <Textarea value={form.descricao ?? ""} onChange={(e) => set("descricao", e.target.value || null)} rows={4} placeholder="Como esse grupo aparece no mundo, símbolos, reputação pública..." />
              </Field>
            </div>
          </div>
        </EditorCard>

        <EditorCard title="Dossiê" icon={<Eye className="h-4 w-4" />} description="Informações úteis para conectar sujeitos e cenas.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Liderança">
              <Input value={form.lideranca ?? ""} onChange={(e) => set("lideranca", e.target.value || null)} placeholder="Patriarca, diretoria, líder oculto..." />
            </Field>
            <Field label="Reputação">
              <Input value={form.reputacao ?? ""} onChange={(e) => set("reputacao", e.target.value || null)} placeholder="Influente, decadente, temida..." />
            </Field>
            <div className="md:col-span-2">
              <Field label="Objetivo">
                <Textarea value={form.objetivo ?? ""} onChange={(e) => set("objetivo", e.target.value || null)} rows={3} placeholder="O que esse círculo quer, protege ou esconde?" />
              </Field>
            </div>
            <Field label="Segredos">
              <Textarea value={form.segredos ?? ""} onChange={(e) => set("segredos", e.target.value || null)} rows={5} placeholder="Coisas que os jogadores ainda não sabem." />
            </Field>
            <Field label="Notas">
              <Textarea value={form.notas ?? ""} onChange={(e) => set("notas", e.target.value || null)} rows={5} placeholder="Ganchos, vínculos, pendências..." />
            </Field>
          </div>
        </EditorCard>
      </div>

      <aside className="space-y-4">
        <div className="sticky top-6 space-y-4">
          <EditorCard title="Resumo" icon={<Eye className="h-4 w-4" />}>
            <div className="space-y-3">
              <Summary label="Nome" value={form.nome || "Sem nome"} />
              <Summary label="Tipo" value={TIPO_OPTIONS.find((option) => option.value === form.tipo)?.label ?? form.tipo} />
              <Summary label="Sede" value={form.sede || "Não definida"} />
              <Summary label="Liderança" value={form.lideranca || "Não definida"} />
            </div>
          </EditorCard>
          <div className="border border-primary/30 bg-primary/[0.04] p-4">
            <p className="text-sm font-semibold">{initial ? "Alterar círculo" : "Novo círculo"}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Depois de salvar, ele aparece no cadastro de sujeitos.</p>
            <Button type="submit" className="mt-3 w-full" disabled={isLoading}>
              <Save className="h-4 w-4" />
              {isLoading ? "Salvando..." : initial ? "Salvar alterações" : "Criar círculo"}
            </Button>
          </div>
        </div>
      </aside>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground uppercase tracking-wider">{label}</Label>
      {children}
    </div>
  );
}

function EditorCard({ title, description, icon, children }: { title: string; description?: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em]">{title}</h2>
        </div>
        {description && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Summary({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-2 text-sm last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[180px] truncate text-right font-medium">{value}</span>
    </div>
  );
}

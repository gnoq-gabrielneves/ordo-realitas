"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { ELEMENTO_LABELS, ELEMENTO_TEXT } from "@/shared/constants/elements";
import { CUSTO_PE, Ritual, RitualCirculo, RitualElemento, RitualPayload } from "@/shared/types/ritual";
import { BookOpen, Eye, Save, Sparkles, WandSparkles } from "lucide-react";
import type { ReactNode } from "react";
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
  custo_pe: CUSTO_PE[1],
  dano: null,
  area: null,
  tipo: null,
  componentes: null,
  discente: null,
  discente_custo: null,
  verdadeiro: null,
  verdadeiro_custo: null,
  requisitos: null,
  descricao: null,
  image_url: null,
  tags: [],
  fonte: "manual",
  oficial: false,
  data: {},
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
    custo_pe: initial.custo_pe ?? CUSTO_PE[initial.circulo],
    dano: initial.dano,
    area: initial.area,
    tipo: initial.tipo,
    componentes: initial.componentes,
    discente: initial.discente,
    discente_custo: initial.discente_custo,
    verdadeiro: initial.verdadeiro,
    verdadeiro_custo: initial.verdadeiro_custo,
    requisitos: initial.requisitos,
    descricao: initial.descricao,
    image_url: initial.image_url,
    tags: initial.tags ?? [],
    fonte: initial.fonte ?? "manual",
    oficial: initial.oficial ?? false,
    data: initial.data ?? {},
  } : empty);

  const set = <K extends keyof RitualPayload>(k: K, v: RitualPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const setCirculo = (circulo: RitualCirculo) => {
    setForm((f) => ({ ...f, circulo, custo_pe: CUSTO_PE[circulo] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <EditorCard
          icon={<WandSparkles className="h-5 w-5" />}
          title="Identidade"
          description="Defina nome, elemento, círculo e o papel geral do ritual no grimório."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nome do ritual" className="md:col-span-2">
              <Input
                value={form.nome}
                onChange={(e) => set("nome", e.target.value)}
                placeholder="Ex: Visão do Além, Chama Negra..."
                required
              />
            </Field>

            <Field label="Elemento">
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
            </Field>

            <Field label="Círculo">
              <Select
                value={String(form.circulo)}
                onValueChange={(v) => setCirculo(Number(v) as RitualCirculo)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  {([1, 2, 3, 4] as RitualCirculo[]).map((c) => (
                    <SelectItem key={c} value={String(c)}>
                      {c}° Círculo · {CUSTO_PE[c]} PE
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Tipo / função">
              <Input
                value={form.tipo ?? ""}
                onChange={(e) => set("tipo", e.target.value || null)}
                placeholder="Dano, suporte, controle, investigação..."
              />
            </Field>

            <Field label="Componentes">
              <Input
                value={form.componentes ?? ""}
                onChange={(e) => set("componentes", e.target.value || null)}
                placeholder="Gestos, ritualísticos, objeto..."
              />
            </Field>
          </div>
        </EditorCard>

        <EditorCard
          icon={<Sparkles className="h-5 w-5" />}
          title="Parâmetros"
          description="Campos que entram direto na consulta durante a cena."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Execução">
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
            </Field>

            <Field label="Alcance">
              <Select value={form.alcance} onValueChange={(v) => set("alcance", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="Pessoal">Pessoal</SelectItem>
                  <SelectItem value="Toque">Toque</SelectItem>
                  <SelectItem value="Curto">Curto</SelectItem>
                  <SelectItem value="Médio">Médio</SelectItem>
                  <SelectItem value="Longo">Longo</SelectItem>
                  <SelectItem value="Extremo">Extremo</SelectItem>
                  <SelectItem value="Ilimitado">Ilimitado</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Alvo">
              <Input value={form.alvo ?? ""} onChange={(e) => set("alvo", e.target.value || null)} placeholder="Ex: 1 criatura, você..." />
            </Field>

            <Field label="Área">
              <Input value={form.area ?? ""} onChange={(e) => set("area", e.target.value || null)} placeholder="Ex: esfera 6m, linha..." />
            </Field>

            <Field label="Duração">
              <Input value={form.duracao ?? ""} onChange={(e) => set("duracao", e.target.value || null)} placeholder="Instantânea, cena, sustentada..." />
            </Field>

            <Field label="Resistência">
              <Input value={form.resistencia ?? ""} onChange={(e) => set("resistencia", e.target.value || null)} placeholder="Vontade reduz à metade..." />
            </Field>

            <Field label="Dano / cura">
              <Input value={form.dano ?? ""} onChange={(e) => set("dano", e.target.value || null)} placeholder="Ex: 4d6, 2d8+2..." />
            </Field>

            <Field label="DT fixa">
              <Input
                type="number"
                min={0}
                value={form.dt ?? ""}
                onChange={(e) => set("dt", e.target.value ? Number(e.target.value) : null)}
                placeholder="Normalmente calculada pela ficha"
              />
            </Field>
          </div>
        </EditorCard>

        <EditorCard
          icon={<BookOpen className="h-5 w-5" />}
          title="Efeito"
          description="Texto operacional para consulta rápida no inventário de rituais e na ficha."
        >
          <div className="grid gap-4">
            <Field label="Efeito base">
              <Textarea
                value={form.descricao ?? ""}
                onChange={(e) => set("descricao", e.target.value || null)}
                placeholder="Descreva o efeito do ritual em termos de jogo..."
                rows={6}
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-[130px_minmax(0,1fr)]">
              <Field label="Custo Discente">
                <Input
                  type="number"
                  min={0}
                  value={form.discente_custo ?? ""}
                  onChange={(e) => set("discente_custo", e.target.value ? Number(e.target.value) : null)}
                  placeholder="+PE"
                />
              </Field>
              <Field label="Versão Discente">
                <Textarea value={form.discente ?? ""} onChange={(e) => set("discente", e.target.value || null)} rows={3} placeholder="O que muda na versão Discente..." />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-[130px_minmax(0,1fr)]">
              <Field label="Custo Verdadeiro">
                <Input
                  type="number"
                  min={0}
                  value={form.verdadeiro_custo ?? ""}
                  onChange={(e) => set("verdadeiro_custo", e.target.value ? Number(e.target.value) : null)}
                  placeholder="+PE"
                />
              </Field>
              <Field label="Versão Verdadeiro">
                <Textarea value={form.verdadeiro ?? ""} onChange={(e) => set("verdadeiro", e.target.value || null)} rows={3} placeholder="O que muda na versão Verdadeiro..." />
              </Field>
            </div>

            <Field label="Requisitos">
              <Input value={form.requisitos ?? ""} onChange={(e) => set("requisitos", e.target.value || null)} placeholder="Ex: requer 3° círculo e afinidade..." />
            </Field>
          </div>
        </EditorCard>
      </div>

      <aside>
        <div className="sticky top-24 space-y-5">
          <section className="border border-border bg-card">
            <div className="border-b border-border p-5">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <Eye className="h-4 w-4" />
                Resumo
              </div>
            </div>
            <div className="grid gap-3 p-5">
              <Summary label="Nome" value={form.nome || "Sem nome"} />
              <Summary label="Elemento" value={ELEMENTO_LABELS[form.elemento]} />
              <Summary label="Círculo" value={`${form.circulo}° círculo`} />
              <Summary label="Custo base" value={`${form.custo_pe} PE`} />
              <Summary label="Execução" value={form.execucao} />
              <Summary label="Alcance" value={form.alcance} />
            </div>
          </section>

          <section className="border border-primary/25 bg-primary/5 p-5">
            <p className="font-semibold text-foreground">{initial ? "Alterar ritual" : "Novo ritual"}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Rituais salvos aqui ficam disponíveis para fichas, sujeitos e consulta do mestre.
            </p>
            <Button type="submit" disabled={loading || !form.nome.trim()} className="mt-5 w-full">
              <Save className="h-4 w-4" />
              {loading ? "Salvando..." : initial ? "Salvar alterações" : "Criar ritual"}
            </Button>
          </section>
        </div>
      </aside>
    </form>
  );
}

function EditorCard({ icon, title, description, children }: { icon: ReactNode; title: string; description: string; children: ReactNode }) {
  return (
    <section className="border border-border bg-card">
      <div className="border-b border-border p-5">
        <div className="flex items-center gap-2 text-foreground">
          <span className="text-primary">{icon}</span>
          <h2 className="text-lg font-semibold uppercase tracking-[0.18em]">{title}</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className ? `space-y-1.5 ${className}` : "space-y-1.5"}>
      <Label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-background/60 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

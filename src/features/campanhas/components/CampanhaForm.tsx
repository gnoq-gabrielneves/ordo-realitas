"use client";

import { ImageUpload } from "@/shared/components/ImageUpload/ImageUpload";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { CampanhaPayload } from "@/shared/types/campaign";
import { useState } from "react";

interface CampanhaFormProps {
  defaultValues?: Partial<CampanhaPayload>;
  onSubmit: (payload: CampanhaPayload) => void;
  isPending?: boolean;
}

export function CampanhaForm({ defaultValues, onSubmit, isPending }: CampanhaFormProps) {
  const [form, setForm] = useState<CampanhaPayload>({
    name: defaultValues?.name ?? "",
    image_url: defaultValues?.image_url ?? null,
    synopsis: defaultValues?.synopsis ?? null,
    historico: defaultValues?.historico ?? null,
    vilao: defaultValues?.vilao ?? null,
    nex_inicial: defaultValues?.nex_inicial ?? 0,
    nex_final: defaultValues?.nex_final ?? 35,
    notas: defaultValues?.notas ?? null,
  });

  function set(field: keyof CampanhaPayload, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      className="space-y-8"
    >
      {/* Identificação */}
      <section className="space-y-5">
        <SectionTitle>Identificação</SectionTitle>

        <div className="flex items-start gap-6">
          <ImageUpload bucket="campanhas" value={form.image_url} onChange={(url) => set("image_url", url)} />
          <div className="flex-1 space-y-4">
            <Field label="Nome da Campanha">
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="Ex: Vendeta Oculta" />
            </Field>
            <Field label="Vilão Principal">
              <Input value={form.vilao ?? ""} onChange={(e) => set("vilao", e.target.value || null)} placeholder="Nome do antagonista" />
            </Field>
          </div>
        </div>

        <Field label="Sinopse">
          <Textarea
            value={form.synopsis ?? ""}
            onChange={(e) => set("synopsis", e.target.value || null)}
            placeholder="Resumo curto da campanha..."
            rows={3}
          />
        </Field>

        <Field label="Histórico">
          <Textarea
            value={form.historico ?? ""}
            onChange={(e) => set("historico", e.target.value || null)}
            placeholder="Contexto narrativo e história de fundo..."
            rows={5}
          />
        </Field>
      </section>

      {/* NEX */}
      <section className="space-y-5">
        <SectionTitle>Progressão de NEX</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <Field label="NEX Inicial (%)">
            <Input
              type="number" min={0} max={99}
              value={form.nex_inicial}
              onChange={(e) => set("nex_inicial", Number(e.target.value))}
            />
          </Field>
          <Field label="NEX Final (%)">
            <Input
              type="number" min={0} max={99}
              value={form.nex_final}
              onChange={(e) => set("nex_final", Number(e.target.value))}
            />
          </Field>
        </div>
      </section>

      {/* Notas */}
      <section className="space-y-5">
        <SectionTitle>Notas do Mestre</SectionTitle>
        <Field label="Notas">
          <Textarea
            value={form.notas ?? ""}
            onChange={(e) => set("notas", e.target.value || null)}
            placeholder="Anotações internas, planejamento, etc."
            rows={4}
          />
        </Field>
      </section>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar Campanha"}
        </Button>
      </div>
    </form>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{children}</p>
      <div className="mt-1 h-px bg-border" />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

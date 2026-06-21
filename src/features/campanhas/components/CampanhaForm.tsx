"use client";

import { ImageUpload } from "@/shared/components/ImageUpload/ImageUpload";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { CampanhaPayload } from "@/shared/types/campaign";
import { BookOpen, FileText, ShieldAlert, Target } from "lucide-react";
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
      className="grid gap-6 xl:grid-cols-[1fr_320px]"
    >
      <div className="space-y-6">
        <section className="border border-border bg-card p-5">
          <SectionTitle
            icon={<BookOpen className="h-4 w-4" />}
            title="Dossiê da campanha"
            description="Identifique a operação e registre a premissa que vai orientar as próximas sessões."
          />

          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-start">
            <ImageUpload bucket="campanhas" value={form.image_url} onChange={(url) => set("image_url", url)} />
            <div className="flex-1 space-y-4">
              <Field label="Nome da campanha">
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="Ex: Vendeta Oculta" />
              </Field>
              <Field label="Antagonista ou ameaça central">
                <Input value={form.vilao ?? ""} onChange={(e) => set("vilao", e.target.value || null)} placeholder="Nome do vilão, criatura, culto ou força paranormal" />
              </Field>
              <Field label="Resumo da operação">
                <Textarea
                  value={form.synopsis ?? ""}
                  onChange={(e) => set("synopsis", e.target.value || null)}
                  placeholder="Premissa curta: qual é o mistério, onde acontece e por que os agentes se envolvem?"
                  rows={4}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="NEX inicial (%)">
                  <Input
                    type="number" min={0} max={99}
                    value={form.nex_inicial}
                    onChange={(e) => set("nex_inicial", Number(e.target.value))}
                  />
                </Field>
                <Field label="NEX final (%)">
                  <Input
                    type="number" min={0} max={99}
                    value={form.nex_final}
                    onChange={(e) => set("nex_final", Number(e.target.value))}
                  />
                </Field>
              </div>
            </div>
          </div>
        </section>

        <section className="border border-border bg-card p-5">
          <SectionTitle
            icon={<FileText className="h-4 w-4" />}
            title="Histórico e bastidores"
            description="Contexto para o mestre: o que aconteceu antes da primeira cena e quais verdades sustentam o mistério."
          />
          <div className="mt-5 space-y-4">
            <Field label="Histórico">
              <Textarea
                value={form.historico ?? ""}
                onChange={(e) => set("historico", e.target.value || null)}
                placeholder="Contexto narrativo, linha do tempo, eventos passados e pistas de bastidor..."
                rows={7}
              />
            </Field>
          </div>
        </section>

        <section className="border border-border bg-card p-5">
          <SectionTitle
            icon={<ShieldAlert className="h-4 w-4" />}
            title="Notas privadas do mestre"
            description="Informações secretas, alternativas de sessão, suspeitos, consequências e lembretes."
          />
          <div className="mt-5">
            <Field label="Notas">
              <Textarea
                value={form.notas ?? ""}
                onChange={(e) => set("notas", e.target.value || null)}
                placeholder="Anotações internas, reviravoltas, cenas opcionais, segredos e consequências..."
                rows={6}
              />
            </Field>
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <div className="sticky top-6 space-y-4">
          <div className="border border-primary/30 bg-primary/5 p-4">
            <Target className="mb-3 h-5 w-5 text-primary" />
            <p className="text-sm font-semibold">Modelo de campanha</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Pense como um arquivo oficial: resumo, histórico, ameaça central, progressão e notas internas. As missões entram depois como capítulos jogáveis.
            </p>
          </div>

          <div className="border border-border bg-card p-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Checklist</p>
            <div className="mt-3 space-y-2 text-sm">
              <Check done={Boolean(form.name)} label="Nome definido" />
              <Check done={Boolean(form.synopsis)} label="Premissa resumida" />
              <Check done={Boolean(form.vilao)} label="Ameaça central" />
              <Check done={Boolean(form.historico)} label="Histórico registrado" />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar campanha"}
          </Button>
        </div>
      </aside>
    </form>
  );
}

function SectionTitle({ title, description, icon }: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-muted text-primary">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
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

function Check({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={done ? "h-2 w-2 bg-primary" : "h-2 w-2 border border-amber-600"} />
      <span className={done ? "text-muted-foreground line-through decoration-muted-foreground/40" : "text-foreground"}>{label}</span>
    </div>
  );
}

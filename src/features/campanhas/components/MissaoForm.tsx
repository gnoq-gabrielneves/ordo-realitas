"use client";

import { ImageUpload } from "@/shared/components/ImageUpload/ImageUpload";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Textarea } from "@/shared/components/ui/textarea";
import { CampanhaHandout, MissaoPayload } from "@/shared/types/campaign";
import { BookOpen, FileImage, FileText, Flag, PlusIcon, ScrollText, Trash2 } from "lucide-react";
import { useState } from "react";

interface MissaoFormProps {
  campaignId: string;
  defaultValues?: Partial<MissaoPayload>;
  onSubmit: (payload: MissaoPayload) => void;
  isPending?: boolean;
}

export function MissaoForm({ campaignId, defaultValues, onSubmit, isPending }: MissaoFormProps) {
  const [form, setForm] = useState<MissaoPayload>({
    campaign_id: campaignId,
    titulo: defaultValues?.titulo ?? "",
    numero: defaultValues?.numero ?? 1,
    is_prologo: defaultValues?.is_prologo ?? false,
    resumo: defaultValues?.resumo ?? null,
    historico: defaultValues?.historico ?? null,
    prologo: defaultValues?.prologo ?? null,
    epilogo: defaultValues?.epilogo ?? null,
    nex_inicial: defaultValues?.nex_inicial ?? null,
    nex_final: defaultValues?.nex_final ?? null,
    handouts: defaultValues?.handouts ?? [],
    notas: defaultValues?.notas ?? null,
  });

  function set(field: keyof MissaoPayload, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addHandout() {
    set("handouts", [...form.handouts, { titulo: "", conteudo: "", image_url: null }]);
  }

  function setHandout(i: number, field: keyof CampanhaHandout, value: string) {
    const next = [...form.handouts];
    next[i] = { ...next[i], [field]: value };
    set("handouts", next);
  }

  function removeHandout(i: number) {
    set("handouts", form.handouts.filter((_, idx) => idx !== i));
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="border border-border bg-card p-5">
          <SectionTitle
            icon={<Flag className="h-4 w-4" />}
            title="Identificação da missão"
            description="Defina a posição da missão dentro da campanha, o NEX esperado e o objetivo central."
          />
          <div className="mt-5 space-y-5">
            <div className="grid gap-4 md:grid-cols-[1fr_140px]">
              <Field label="Título da missão">
                <Input
                  value={form.titulo}
                  onChange={(e) => set("titulo", e.target.value)}
                  required
                  placeholder="Ex: A Chegada em Curitiba"
                />
              </Field>
              <Field label="Número">
                <Input
                  type="number" min={0}
                  value={form.numero}
                  onChange={(e) => set("numero", Number(e.target.value))}
                />
              </Field>
            </div>

            <div className="flex items-center gap-3 border border-border bg-muted/30 px-3 py-2">
              <Switch
                id="is_prologo"
                checked={form.is_prologo}
                onCheckedChange={(v) => set("is_prologo", v)}
              />
              <div>
                <Label htmlFor="is_prologo" className="cursor-pointer text-xs font-medium">É prólogo</Label>
                <p className="text-[11px] text-muted-foreground">Use para abertura da campanha ou missão 0.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="NEX inicial (%)">
                <Input
                  type="number" min={0} max={99}
                  value={form.nex_inicial ?? ""}
                  onChange={(e) => set("nex_inicial", e.target.value ? Number(e.target.value) : null)}
                  placeholder="Ex: 0"
                />
              </Field>
              <Field label="NEX final (%)">
                <Input
                  type="number" min={0} max={99}
                  value={form.nex_final ?? ""}
                  onChange={(e) => set("nex_final", e.target.value ? Number(e.target.value) : null)}
                  placeholder="Ex: 10"
                />
              </Field>
            </div>

            <Field label="Resumo da missão">
              <Textarea
                value={form.resumo ?? ""}
                onChange={(e) => set("resumo", e.target.value || null)}
                placeholder="Em poucas linhas: qual é o problema, onde acontece e o que os agentes precisam descobrir?"
                rows={4}
              />
            </Field>
          </div>
        </section>

        <section className="border border-border bg-card p-5">
          <SectionTitle
            icon={<BookOpen className="h-4 w-4" />}
            title="Estrutura narrativa"
            description="Siga a lógica de arquivo oficial: histórico, abertura lida aos jogadores e encerramento."
          />
          <div className="mt-5">
            <Tabs defaultValue="historico">
              <TabsList className="mb-5">
                <TabsTrigger value="historico">Histórico</TabsTrigger>
                <TabsTrigger value="prologo">Prólogo</TabsTrigger>
                <TabsTrigger value="epilogo">Epílogo</TabsTrigger>
              </TabsList>
              <TabsContent value="historico">
                <Field label="Histórico">
                  <Textarea
                    value={form.historico ?? ""}
                    onChange={(e) => set("historico", e.target.value || null)}
                    placeholder="Contexto narrativo, acontecimentos anteriores, envolvidos e verdade oculta..."
                    rows={8}
                  />
                </Field>
              </TabsContent>
              <TabsContent value="prologo">
                <Field label="Prólogo para leitura">
                  <Textarea
                    value={form.prologo ?? ""}
                    onChange={(e) => set("prologo", e.target.value || null)}
                    placeholder="Texto de abertura da missão, pronto para narrar aos jogadores..."
                    rows={8}
                  />
                </Field>
              </TabsContent>
              <TabsContent value="epilogo">
                <Field label="Epílogo">
                  <Textarea
                    value={form.epilogo ?? ""}
                    onChange={(e) => set("epilogo", e.target.value || null)}
                    placeholder="Texto de encerramento, consequências e gancho para a próxima sessão..."
                    rows={8}
                  />
                </Field>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section className="border border-border bg-card p-5">
          <SectionTitle
            icon={<FileImage className="h-4 w-4" />}
            title="Handouts e evidências"
            description="Documentos, imagens, mensagens e pistas que podem aparecer na tela de exibição."
          />
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Anexos que podem ser revelados durante a missão.</p>
              <Button type="button" variant="outline" size="sm" onClick={addHandout}>
                <PlusIcon className="h-3.5 w-3.5" /> Adicionar
              </Button>
            </div>
            {form.handouts.length === 0 && (
              <div className="border border-dashed border-border py-8 text-center">
                <p className="text-xs text-muted-foreground">Nenhum handout cadastrado.</p>
              </div>
            )}
            {form.handouts.map((h, i) => (
              <div key={i} className="space-y-3 border border-border p-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={h.titulo}
                    onChange={(e) => setHandout(i, "titulo", e.target.value)}
                    placeholder="Título do handout"
                    className="flex-1"
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeHandout(i)}
                    className="text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div className="shrink-0">
                    <p className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">Imagem</p>
                    <ImageUpload
                      bucket="campanhas"
                      value={h.image_url ?? null}
                      onChange={(url) => setHandout(i, "image_url", url ?? "")}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">Conteúdo</p>
                    <Textarea
                      value={h.conteudo}
                      onChange={(e) => setHandout(i, "conteudo", e.target.value)}
                      placeholder="Conteúdo do documento, transcrição, pista ou evidência..."
                      rows={5}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-border bg-card p-5">
          <SectionTitle
            icon={<FileText className="h-4 w-4" />}
            title="Notas do mestre"
            description="Lembretes internos, alternativas, segredos, reações de NPCs e consequências."
          />
          <div className="mt-5">
            <Field label="Notas">
              <Textarea
                value={form.notas ?? ""}
                onChange={(e) => set("notas", e.target.value || null)}
                placeholder="Anotações internas, dicas, alternativas..."
                rows={8}
              />
            </Field>
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <div className="sticky top-6 space-y-4">
          <div className="border border-primary/30 bg-primary/5 p-4">
            <ScrollText className="mb-3 h-5 w-5 text-primary" />
            <p className="text-sm font-semibold">Estrutura recomendada</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Missões oficiais costumam ser lidas como um arquivo: resumo, histórico, prólogo, partes/cenas, epílogo, NPCs/criaturas e handouts.
            </p>
          </div>

          <div className="border border-border bg-card p-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Checklist</p>
            <div className="mt-3 space-y-2 text-sm">
              <Check done={Boolean(form.titulo)} label="Título definido" />
              <Check done={Boolean(form.resumo)} label="Resumo objetivo" />
              <Check done={Boolean(form.historico)} label="Histórico preparado" />
              <Check done={Boolean(form.prologo)} label="Prólogo narrável" />
              <Check done={form.handouts.length > 0} label="Handouts anexados" />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar missão"}
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

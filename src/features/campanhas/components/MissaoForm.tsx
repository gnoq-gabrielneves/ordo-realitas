"use client";

import { ImageUpload } from "@/shared/components/ImageUpload/ImageUpload";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Textarea } from "@/shared/components/ui/textarea";
import { CampanhaHandout, MissaoPayload } from "@/shared/types/campaign";
import { PlusIcon, Trash2 } from "lucide-react";
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
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-6">
      <Tabs defaultValue="geral">
        <TabsList className="mb-6">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="narrativa">Narrativa</TabsTrigger>
          <TabsTrigger value="handouts">Handouts</TabsTrigger>
          <TabsTrigger value="notas">Notas</TabsTrigger>
        </TabsList>

        {/* GERAL */}
        <TabsContent value="geral" className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Título da Missão">
              <Input
                value={form.titulo}
                onChange={(e) => set("titulo", e.target.value)}
                required
                placeholder="Ex: A Chegada em Curitiba"
                className="col-span-2"
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

          <div className="flex items-center gap-3">
            <Switch
              id="is_prologo"
              checked={form.is_prologo}
              onCheckedChange={(v) => set("is_prologo", v)}
            />
            <Label htmlFor="is_prologo" className="text-xs cursor-pointer">É prólogo (Missão 0)</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="NEX Inicial (%)">
              <Input
                type="number" min={0} max={99}
                value={form.nex_inicial ?? ""}
                onChange={(e) => set("nex_inicial", e.target.value ? Number(e.target.value) : null)}
                placeholder="Ex: 0"
              />
            </Field>
            <Field label="NEX Final (%)">
              <Input
                type="number" min={0} max={99}
                value={form.nex_final ?? ""}
                onChange={(e) => set("nex_final", e.target.value ? Number(e.target.value) : null)}
                placeholder="Ex: 10"
              />
            </Field>
          </div>

          <Field label="Resumo">
            <Textarea
              value={form.resumo ?? ""}
              onChange={(e) => set("resumo", e.target.value || null)}
              placeholder="O que acontece nesta missão em uma frase..."
              rows={3}
            />
          </Field>
        </TabsContent>

        {/* NARRATIVA */}
        <TabsContent value="narrativa" className="space-y-5">
          <Field label="Histórico">
            <Textarea
              value={form.historico ?? ""}
              onChange={(e) => set("historico", e.target.value || null)}
              placeholder="Contexto narrativo, o que levou até aqui..."
              rows={5}
            />
          </Field>
          <Field label="Prólogo">
            <Textarea
              value={form.prologo ?? ""}
              onChange={(e) => set("prologo", e.target.value || null)}
              placeholder="Texto de abertura da missão (lido para os jogadores)..."
              rows={5}
            />
          </Field>
          <Field label="Epílogo">
            <Textarea
              value={form.epilogo ?? ""}
              onChange={(e) => set("epilogo", e.target.value || null)}
              placeholder="Texto de encerramento da missão..."
              rows={5}
            />
          </Field>
        </TabsContent>

        {/* HANDOUTS */}
        <TabsContent value="handouts" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Evidências e documentos para entregar aos agentes.</p>
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
            <div key={i} className="border border-border p-4 space-y-3">
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
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Imagem</p>
                  <ImageUpload
                    bucket="campanhas"
                    value={h.image_url ?? null}
                    onChange={(url) => setHandout(i, "image_url", url ?? "")}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Conteúdo</p>
                  <Textarea
                    value={h.conteudo}
                    onChange={(e) => setHandout(i, "conteudo", e.target.value)}
                    placeholder="Conteúdo do documento, evidência..."
                    rows={5}
                  />
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* NOTAS */}
        <TabsContent value="notas">
          <Field label="Notas do Mestre">
            <Textarea
              value={form.notas ?? ""}
              onChange={(e) => set("notas", e.target.value || null)}
              placeholder="Anotações internas, dicas, alternativas..."
              rows={8}
            />
          </Field>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar Missão"}
        </Button>
      </div>
    </form>
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

"use client";

import { ImageUpload } from "@/shared/components/ImageUpload/ImageUpload";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Textarea } from "@/shared/components/ui/textarea";
import { PERICIAS } from "@/shared/constants/pericias";

// Perícias únicas por nome (Profissão aparece 2x no constant).
const PERICIAS_UNICAS = PERICIAS.filter(
  (p, i, arr) => arr.findIndex((x) => x.nome === p.nome) === i
);
import { Place, PlacePayload, PlacePonto, PlacePontoTeste } from "@/shared/types/place";
import { Dices, PlusIcon, Trash2 } from "lucide-react";
import { useState } from "react";

const EMPTY_PAYLOAD: PlacePayload = {
  parent_id: null,
  name: "",
  tipo: null,
  localizacao: null,
  image_url: null,
  descricao: null,
  atmosfera: null,
  backstory: null,
  atividade_paranormal: null,
  origem: null,
  membrana: null,
  pontos_de_interesse: [],
  notas: null,
  segredos: null,
};

interface LugarFormProps {
  initial?: Place;
  parentId?: string;
  onSubmit: (payload: PlacePayload) => void;
  isLoading?: boolean;
}

export function LugarForm({ initial, parentId, onSubmit, isLoading }: LugarFormProps) {
  const [form, setForm] = useState<PlacePayload>(
    initial ? {
      parent_id: initial.parent_id,
      name: initial.name,
      tipo: initial.tipo,
      localizacao: initial.localizacao,
      image_url: initial.image_url,
      descricao: initial.descricao,
      atmosfera: initial.atmosfera,
      backstory: initial.backstory,
      atividade_paranormal: initial.atividade_paranormal,
      origem: initial.origem,
      membrana: initial.membrana,
      pontos_de_interesse: initial.pontos_de_interesse,
      notas: initial.notas,
      segredos: initial.segredos,
    } : { ...EMPTY_PAYLOAD, parent_id: parentId ?? null }
  );

  function set<K extends keyof PlacePayload>(key: K, value: PlacePayload[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addPonto() {
    set("pontos_de_interesse", [...form.pontos_de_interesse, { nome: "", descricao: "" }]);
  }
  function updatePonto(i: number, field: keyof PlacePonto, v: string) {
    const arr = [...form.pontos_de_interesse];
    arr[i] = { ...arr[i], [field]: v };
    set("pontos_de_interesse", arr);
  }
  function removePonto(i: number) {
    set("pontos_de_interesse", form.pontos_de_interesse.filter((_, idx) => idx !== i));
  }

  function updatePontoTestes(i: number, testes: PlacePontoTeste[]) {
    const arr = [...form.pontos_de_interesse];
    arr[i] = { ...arr[i], testes };
    set("pontos_de_interesse", arr);
  }
  function addTeste(i: number) {
    const testes = form.pontos_de_interesse[i].testes ?? [];
    updatePontoTestes(i, [...testes, { pericia: "", dt: "", descricao: "", tipo: "jogador" }]);
  }
  function updateTeste(i: number, ti: number, field: keyof PlacePontoTeste, v: string) {
    const testes = [...(form.pontos_de_interesse[i].testes ?? [])];
    testes[ti] = { ...testes[ti], [field]: v };
    updatePontoTestes(i, testes);
  }
  function removeTeste(i: number, ti: number) {
    const testes = (form.pontos_de_interesse[i].testes ?? []).filter((_, idx) => idx !== ti);
    updatePontoTestes(i, testes);
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-6">
      <Tabs defaultValue="identificacao">
        <TabsList className="mb-6">
          <TabsTrigger value="identificacao">Identificação</TabsTrigger>
          <TabsTrigger value="paranormal">Paranormal</TabsTrigger>
          <TabsTrigger value="pontos">Pontos de Interesse</TabsTrigger>
          <TabsTrigger value="notas">Notas</TabsTrigger>
        </TabsList>

        {/* IDENTIFICAÇÃO */}
        <TabsContent value="identificacao" className="space-y-4">
          <Field label="Imagem">
            <ImageUpload bucket="lugares" value={form.image_url} onChange={(url) => set("image_url", url)} />
          </Field>

          <Field label="Nome *">
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo">
              <Input
                value={form.tipo ?? ""}
                onChange={(e) => set("tipo", e.target.value || null)}
                placeholder="ex: Edificação, Área Urbana, Base..."
              />
            </Field>
            <Field label="Localização">
              <Input
                value={form.localizacao ?? ""}
                onChange={(e) => set("localizacao", e.target.value || null)}
                placeholder="ex: Curitiba, PR"
              />
            </Field>
          </div>

          <Field label="Descrição / Aparência">
            <Textarea
              value={form.descricao ?? ""}
              onChange={(e) => set("descricao", e.target.value || null)}
              rows={3}
              placeholder="Como o lugar se apresenta fisicamente..."
            />
          </Field>

          <Field label="Atmosfera">
            <Textarea
              value={form.atmosfera ?? ""}
              onChange={(e) => set("atmosfera", e.target.value || null)}
              rows={2}
              placeholder="Como o lugar se sente — opressivo, frio, familiar..."
            />
          </Field>

          <Field label="Backstory">
            <Textarea
              value={form.backstory ?? ""}
              onChange={(e) => set("backstory", e.target.value || null)}
              rows={5}
              placeholder="História do lugar, eventos marcantes..."
            />
          </Field>
        </TabsContent>

        {/* PARANORMAL */}
        <TabsContent value="paranormal" className="space-y-4">
          <Field label="Nível de Atividade Paranormal">
            <Select
              value={form.atividade_paranormal ?? ""}
              onValueChange={(v) => set("atividade_paranormal", v as PlacePayload["atividade_paranormal"])}
            >
              <SelectTrigger className="w-full"><SelectValue placeholder="Selecionar" /></SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="nenhuma">Nenhuma</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="moderada">Moderada</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="critica">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Origem da Manifestação">
            <Select
              value={form.origem ?? ""}
              onValueChange={(v) => set("origem", v as PlacePayload["origem"])}
            >
              <SelectTrigger className="w-full"><SelectValue placeholder="Nenhuma" /></SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="sangue">Sangue</SelectItem>
                <SelectItem value="morte">Morte</SelectItem>
                <SelectItem value="medo">Medo</SelectItem>
                <SelectItem value="conhecimento">Conhecimento</SelectItem>
                <SelectItem value="energia">Energia</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Estado da Membrana">
            <Select
              value={form.membrana ?? ""}
              onValueChange={(v) => set("membrana", v as PlacePayload["membrana"])}
            >
              <SelectTrigger className="w-full"><SelectValue placeholder="Selecionar" /></SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="integra">Íntegra</SelectItem>
                <SelectItem value="enfraquecida">Enfraquecida</SelectItem>
                <SelectItem value="rompida">Rompida</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </TabsContent>

        {/* PONTOS DE INTERESSE */}
        <TabsContent value="pontos">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Pontos de Interesse</p>
            <Button type="button" variant="outline" size="sm" onClick={addPonto}>
              <PlusIcon className="h-3.5 w-3.5" />
              Adicionar
            </Button>
          </div>
          <div className="space-y-4">
            {form.pontos_de_interesse.map((p, i) => (
              <div key={i} className="border border-border p-3 space-y-2">
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Nome do ponto (ex: Mesa, Arquivo, Porta)"
                    value={p.nome}
                    onChange={(e) => updatePonto(i, "nome", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removePonto(i)}
                    className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <Textarea
                  placeholder="Descrição, o que pode ser encontrado aqui..."
                  rows={2}
                  value={p.descricao}
                  onChange={(e) => updatePonto(i, "descricao", e.target.value)}
                />

                {/* Testes de perícia */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                      <Dices className="h-3 w-3" /> Testes de Perícia
                    </span>
                    <Button type="button" variant="ghost" size="sm" className="h-6 text-[11px] px-2" onClick={() => addTeste(i)}>
                      <PlusIcon className="h-3 w-3 mr-1" /> Teste
                    </Button>
                  </div>

                  {(p.testes ?? []).map((t, ti) => (
                    <div key={ti} className="rounded border border-border/60 bg-muted/20 p-2 space-y-2">
                      <div className="flex gap-2">
                        <Select value={t.pericia} onValueChange={(v) => updateTeste(i, ti, "pericia", v)}>
                          <SelectTrigger className="h-8 text-xs flex-1"><SelectValue placeholder="Perícia" /></SelectTrigger>
                          <SelectContent position="popper">
                            {PERICIAS_UNICAS.map((per) => (
                              <SelectItem key={per.key} value={per.nome}>{per.nome}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          className="h-8 text-xs w-28"
                          placeholder="DT (ex: 15)"
                          value={t.dt}
                          onChange={(e) => updateTeste(i, ti, "dt", e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => removeTeste(i, ti)}
                          className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {/* Tipo: quem inicia o teste */}
                      <div className="flex items-center gap-1.5">
                        {([
                          ["jogador", "Jogador", "espontâneo"],
                          ["mestre", "Mestre", "solicitado"],
                        ] as const).map(([val, label, hint]) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => updateTeste(i, ti, "tipo", val)}
                            title={hint}
                            className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                              (t.tipo ?? "jogador") === val
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border text-muted-foreground hover:border-primary/50"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <Textarea
                        className="text-xs"
                        placeholder="Descrição / contexto do teste (opcional)..."
                        rows={2}
                        value={t.descricao}
                        onChange={(e) => updateTeste(i, ti, "descricao", e.target.value)}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-500">Se passar</span>
                          <Textarea
                            className="text-xs"
                            placeholder="O que o agente descobre / ganha ao passar..."
                            rows={2}
                            value={t.sucesso ?? ""}
                            onChange={(e) => updateTeste(i, ti, "sucesso", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-medium uppercase tracking-wider text-red-500">Se falhar</span>
                          <Textarea
                            className="text-xs"
                            placeholder="O que acontece / a consequência ao falhar..."
                            rows={2}
                            value={t.falha ?? ""}
                            onChange={(e) => updateTeste(i, ti, "falha", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {form.pontos_de_interesse.length === 0 && (
              <p className="text-xs text-muted-foreground py-8 text-center border border-dashed border-border">
                Nenhum ponto de interesse adicionado.
              </p>
            )}
          </div>
        </TabsContent>

        {/* NOTAS */}
        <TabsContent value="notas" className="space-y-4">
          <Field label="Notas do Mestre">
            <Textarea
              value={form.notas ?? ""}
              onChange={(e) => set("notas", e.target.value || null)}
              rows={5}
              placeholder="Informações de bastidor, ganchos de missão..."
            />
          </Field>
          <Field label="Segredos">
            <Textarea
              value={form.segredos ?? ""}
              onChange={(e) => set("segredos", e.target.value || null)}
              rows={5}
              placeholder="Coisas que os agentes ainda não descobriram..."
            />
          </Field>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : initial ? "Salvar Alterações" : "Registrar Lugar"}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground uppercase tracking-wider">{label}</Label>
      {children}
    </div>
  );
}

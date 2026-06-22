"use client";

import { ImageUpload } from "@/shared/components/ImageUpload/ImageUpload";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { PERICIAS } from "@/shared/constants/pericias";
import { cn } from "@/shared/lib/utils";
import { Place, PlacePayload, PlacePonto, PlacePontoTeste } from "@/shared/types/place";
import { BookOpen, Dices, Eye, FileWarning, MapPin, PlusIcon, RadioTower, Save, ScanSearch, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

const PERICIAS_UNICAS = PERICIAS.filter(
  (p, i, arr) => arr.findIndex((x) => x.nome === p.nome) === i
);

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

const atividadeOptions = [
  { value: "nenhuma", label: "Nenhuma", hint: "Local comum, sem manifestação aparente." },
  { value: "baixa", label: "Baixa", hint: "Sinais sutis, presságios e pistas discretas." },
  { value: "moderada", label: "Moderada", hint: "O paranormal afeta a cena e chama atenção." },
  { value: "alta", label: "Alta", hint: "Local perigoso, bom para pressão e encontros." },
  { value: "critica", label: "Crítica", hint: "Membrana em colapso, alto risco para os agentes." },
] as const;

const origemOptions = [
  { value: "sangue", label: "Sangue" },
  { value: "morte", label: "Morte" },
  { value: "medo", label: "Medo" },
  { value: "conhecimento", label: "Conhecimento" },
  { value: "energia", label: "Energia" },
] as const;

const membranaOptions = [
  { value: "integra", label: "Íntegra" },
  { value: "enfraquecida", label: "Enfraquecida" },
  { value: "rompida", label: "Rompida" },
] as const;

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
    set("pontos_de_interesse", [...form.pontos_de_interesse, { nome: "", descricao: "", testes: [] }]);
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
    updatePontoTestes(i, [...testes, { pericia: "", dt: "", descricao: "", tipo: "jogador", sucesso: "", falha: "" }]);
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

  const testsCount = form.pontos_de_interesse.reduce((total, ponto) => total + (ponto.testes?.length ?? 0), 0);
  const atividadeLabel = atividadeOptions.find((option) => option.value === form.atividade_paranormal)?.label ?? "Não definida";
  const origemLabel = origemOptions.find((option) => option.value === form.origem)?.label ?? "Não definida";
  const membranaLabel = membranaOptions.find((option) => option.value === form.membrana)?.label ?? "Não definida";

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <EditorCard
          icon={<MapPin className="h-5 w-5" />}
          title="Identidade"
          description="Nome, imagem e descrição rápida para reconhecer o lugar durante a sessão."
        >
          <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
            <div className="space-y-3">
              <div className="aspect-square overflow-hidden border border-border">
                <ImageUpload
                  bucket="lugares"
                  value={form.image_url}
                  onChange={(url) => set("image_url", url)}
                  className="h-full w-full"
                  label="Lugar"
                />
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Use uma imagem quadrada ou centralizada. Ela aparece na listagem e no dossiê.
              </p>
            </div>

            <div className="grid content-start gap-4">
              <Field label="Nome *">
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex: Mansão Leone" required />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Tipo">
                  <Input
                    value={form.tipo ?? ""}
                    onChange={(e) => set("tipo", e.target.value || null)}
                    placeholder="Edificação, ruína, bairro..."
                  />
                </Field>
                <Field label="Localização">
                  <Input
                    value={form.localizacao ?? ""}
                    onChange={(e) => set("localizacao", e.target.value || null)}
                    placeholder="Cidade, estado, plano..."
                  />
                </Field>
              </div>

              <Field label="Descrição visível">
                <Textarea
                  value={form.descricao ?? ""}
                  onChange={(e) => set("descricao", e.target.value || null)}
                  rows={4}
                  placeholder="O que os agentes percebem ao chegar? Estrutura, cheiro, sons, estado do ambiente..."
                />
              </Field>
            </div>
          </div>
        </EditorCard>

        <EditorCard
          icon={<RadioTower className="h-5 w-5" />}
          title="Presença Paranormal"
          description="Defina o quanto o lugar interfere na investigação e qual elemento domina a cena."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="Atividade">
              <Select
                value={form.atividade_paranormal ?? "none"}
                onValueChange={(v) => set("atividade_paranormal", v === "none" ? null : v as PlacePayload["atividade_paranormal"])}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="none">Não definida</SelectItem>
                  {atividadeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Origem">
              <Select
                value={form.origem ?? "none"}
                onValueChange={(v) => set("origem", v === "none" ? null : v as PlacePayload["origem"])}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="none">Não definida</SelectItem>
                  {origemOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Membrana">
              <Select
                value={form.membrana ?? "none"}
                onValueChange={(v) => set("membrana", v === "none" ? null : v as PlacePayload["membrana"])}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="none">Não definida</SelectItem>
                  {membranaOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-5">
            {atividadeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => set("atividade_paranormal", option.value)}
                className={cn(
                  "border p-3 text-left transition-colors hover:border-primary/40",
                  form.atividade_paranormal === option.value ? "border-primary bg-primary/5" : "border-border bg-background/60"
                )}
              >
                <p className="text-sm font-semibold text-foreground">{option.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{option.hint}</p>
              </button>
            ))}
          </div>

          <Field label="Atmosfera" className="mt-4">
            <Textarea
              value={form.atmosfera ?? ""}
              onChange={(e) => set("atmosfera", e.target.value || null)}
              rows={3}
              placeholder="Frio antinatural, silêncio pesado, cheiro de sangue seco, luzes tremendo..."
            />
          </Field>
        </EditorCard>

        <EditorCard
          icon={<ScanSearch className="h-5 w-5" />}
          title="Pontos de Interesse"
          description="Monte as áreas investigáveis com pistas, testes e consequências de sucesso ou falha."
          meta={`${form.pontos_de_interesse.length} ${form.pontos_de_interesse.length === 1 ? "ponto" : "pontos"} · ${testsCount} ${testsCount === 1 ? "teste" : "testes"}`}
          action={(
            <Button type="button" variant="outline" size="sm" onClick={addPonto}>
              <PlusIcon className="h-3.5 w-3.5" />
              Ponto
            </Button>
          )}
        >
          {form.pontos_de_interesse.length === 0 ? (
            <button
              type="button"
              onClick={addPonto}
              className="w-full border border-dashed border-border py-10 text-center text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              Adicionar primeiro ponto de interesse
            </button>
          ) : (
            <div className="space-y-4">
              {form.pontos_de_interesse.map((ponto, i) => (
                <div key={i} className="border border-border bg-background/60">
                  <div className="grid gap-3 border-b border-border p-4 lg:grid-cols-[minmax(0,1fr)_36px]">
                    <div className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
                      <Field label={`Ponto ${i + 1}`}>
                        <Input
                          placeholder="Mesa, arquivo, altar, porta..."
                          value={ponto.nome}
                          onChange={(e) => updatePonto(i, "nome", e.target.value)}
                        />
                      </Field>
                      <Field label="Descrição">
                        <Textarea
                          placeholder="O que existe aqui e o que pode ser encontrado."
                          rows={2}
                          value={ponto.descricao}
                          onChange={(e) => updatePonto(i, "descricao", e.target.value)}
                        />
                      </Field>
                    </div>
                    <IconButton label="Remover ponto" onClick={() => removePonto(i)}>
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>

                  <div className="p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        <Dices className="h-3.5 w-3.5" />
                        Testes do ponto
                      </span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => addTeste(i)}>
                        <PlusIcon className="h-3.5 w-3.5" />
                        Teste
                      </Button>
                    </div>

                    {(ponto.testes ?? []).length === 0 ? (
                      <div className="border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
                        Nenhum teste cadastrado para este ponto.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(ponto.testes ?? []).map((teste, ti) => (
                          <div key={ti} className="border border-border bg-card p-3">
                            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_130px_150px_36px]">
                              <Field label="Perícia">
                                <Select value={teste.pericia || "none"} onValueChange={(v) => updateTeste(i, ti, "pericia", v === "none" ? "" : v)}>
                                  <SelectTrigger className="w-full"><SelectValue placeholder="Perícia" /></SelectTrigger>
                                  <SelectContent position="popper">
                                    <SelectItem value="none">Selecionar</SelectItem>
                                    {PERICIAS_UNICAS.map((per) => (
                                      <SelectItem key={per.key} value={per.nome}>{per.nome}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </Field>

                              <Field label="DT">
                                <Input
                                  placeholder="15"
                                  value={teste.dt}
                                  onChange={(e) => updateTeste(i, ti, "dt", e.target.value)}
                                />
                              </Field>

                              <Field label="Quem inicia">
                                <Select value={teste.tipo ?? "jogador"} onValueChange={(v) => updateTeste(i, ti, "tipo", v)}>
                                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                  <SelectContent position="popper">
                                    <SelectItem value="jogador">Jogador procura</SelectItem>
                                    <SelectItem value="mestre">Mestre pede</SelectItem>
                                  </SelectContent>
                                </Select>
                              </Field>

                              <IconButton label="Remover teste" onClick={() => removeTeste(i, ti)}>
                                <Trash2 className="h-4 w-4" />
                              </IconButton>
                            </div>

                            <Field label="Contexto do teste" className="mt-3">
                              <Textarea
                                placeholder="Quando esse teste entra? O que exatamente está sendo avaliado?"
                                rows={2}
                                value={teste.descricao}
                                onChange={(e) => updateTeste(i, ti, "descricao", e.target.value)}
                              />
                            </Field>

                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                              <Field label="Se passar">
                                <Textarea
                                  placeholder="Informação revelada, vantagem, pista..."
                                  rows={2}
                                  value={teste.sucesso ?? ""}
                                  onChange={(e) => updateTeste(i, ti, "sucesso", e.target.value)}
                                />
                              </Field>
                              <Field label="Se falhar">
                                <Textarea
                                  placeholder="Custo, pista incompleta, consequência..."
                                  rows={2}
                                  value={teste.falha ?? ""}
                                  onChange={(e) => updateTeste(i, ti, "falha", e.target.value)}
                                />
                              </Field>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </EditorCard>

        <EditorCard
          icon={<BookOpen className="h-5 w-5" />}
          title="Dossiê Narrativo"
          description="História, notas e segredos para você consultar sem mostrar tudo aos jogadores."
        >
          <div className="grid gap-4">
            <Field label="História do lugar">
              <Textarea
                value={form.backstory ?? ""}
                onChange={(e) => set("backstory", e.target.value || null)}
                rows={5}
                placeholder="Eventos marcantes, quem passou por aqui, por que esse lugar importa..."
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Notas do mestre">
                <Textarea
                  value={form.notas ?? ""}
                  onChange={(e) => set("notas", e.target.value || null)}
                  rows={5}
                  placeholder="Gatilhos de cena, variações, lembretes de condução..."
                />
              </Field>
              <Field label="Segredos">
                <Textarea
                  value={form.segredos ?? ""}
                  onChange={(e) => set("segredos", e.target.value || null)}
                  rows={5}
                  placeholder="Revelações que os jogadores ainda não sabem..."
                />
              </Field>
            </div>
          </div>
        </EditorCard>
      </div>

      <aside className="space-y-5">
        <div className="sticky top-24 space-y-5">
          <section className="border border-border bg-card">
            <div className="border-b border-border p-5">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <Eye className="h-4 w-4" />
                Resumo
              </div>
            </div>
            <div className="grid gap-3 p-5">
              <SummaryRow label="Nome" value={form.name || "Sem nome"} />
              <SummaryRow label="Tipo" value={form.tipo || "Não definido"} />
              <SummaryRow label="Atividade" value={atividadeLabel} />
              <SummaryRow label="Origem" value={origemLabel} />
              <SummaryRow label="Membrana" value={membranaLabel} />
              <SummaryRow label="Pontos" value={String(form.pontos_de_interesse.length)} />
              <SummaryRow label="Testes" value={String(testsCount)} />
            </div>
          </section>

          <section className="border border-primary/25 bg-primary/5 p-5">
            <div className="flex items-start gap-3">
              <FileWarning className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-semibold text-foreground">{initial ? "Alterar registro" : "Novo registro"}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Salve para atualizar o arquivo usado na listagem, no dossiê e nas cenas vinculadas.
                </p>
              </div>
            </div>
            <Button type="submit" disabled={isLoading || !form.name.trim()} className="mt-5 w-full">
              <Save className="h-4 w-4" />
              {isLoading ? "Salvando..." : initial ? "Salvar alterações" : "Registrar lugar"}
            </Button>
          </section>
        </div>
      </aside>
    </form>
  );
}

function EditorCard({ icon, title, description, meta, action, children }: {
  icon: ReactNode;
  title: string;
  description: string;
  meta?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border border-border bg-card">
      <div className="flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-foreground">
            <span className="text-primary">{icon}</span>
            <h2 className="text-lg font-semibold uppercase tracking-[0.18em]">{title}</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {meta && <span className="border border-border px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{meta}</span>}
          {action}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-background/60 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-9 w-9 shrink-0 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
    >
      {children}
    </button>
  );
}

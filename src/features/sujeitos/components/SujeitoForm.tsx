"use client";

import { ImageUpload } from "@/shared/components/ImageUpload/ImageUpload";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Textarea } from "@/shared/components/ui/textarea";
import { Npc, NpcAcao, NpcAcaoTipo, NpcHabilidade, NpcPayload, NpcPericia, NpcResistencia, NpcRitual } from "@/shared/types/npc";
import { PERICIAS } from "@/shared/constants/pericias";
import { useItens } from "@/features/itens/hooks/useItens";
import { useRituais } from "@/features/rituais/hooks/useRituais";
import { Item } from "@/shared/types/item";
import { CUSTO_PE, Ritual } from "@/shared/types/ritual";
import { Package, PlusIcon, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";

// Perícias únicas por nome (Profissão aparece 2x no constant).
const PERICIAS_UNICAS = PERICIAS.filter(
  (p, i, arr) => arr.findIndex((x) => x.nome === p.nome) === i
);

const ACOES_HABILIDADE = ["Passiva", "Livre", "Reação", "Movimento", "Padrão", "Completa"];

// Testes que podem evitar uma habilidade: resistências + perícias (sem duplicar).
const TESTES_RESISTENCIA = Array.from(
  new Set(["Fortitude", "Reflexos", "Vontade", ...PERICIAS_UNICAS.map((p) => p.nome)])
);

// Converte uma arma do banco de itens em uma ação de NPC.
function acaoFromItem(item: Item): NpcAcao {
  const limpa = (v: string | null | undefined) => (v && v !== "—" ? v : "");
  return {
    tipo: "padrao",
    nome: item.nome,
    descricao: limpa(item.especial),
    teste: limpa(item.teste),
    dano: limpa(item.dano),
    critico: limpa(item.critico),
  };
}

const EMPTY_PAYLOAD: NpcPayload = {
  name: "",
  image_url: null,
  tipo: null,
  tamanho: null,
  vd: null,
  origem: null,
  descricao: null,
  backstory: null,
  percepcao: null,
  iniciativa: null,
  percepcao_as_cegas: false,
  agi: null,
  atrib_for: null,
  atrib_int: null,
  pre: null,
  vig: null,
  defesa: null,
  fortitude: null,
  reflexos: null,
  vontade: null,
  pv: null,
  pv_atual: null,
  deslocamento: null,
  pp_dt: null,
  pp_dano: null,
  pp_imune_nex: null,
  pericias: [],
  resistencias: [],
  vulnerabilidades: [],
  habilidades: [],
  acoes: [],
  rituais: [],
};

interface SujeitoFormProps {
  initial?: Npc;
  onSubmit: (payload: NpcPayload) => void;
  isLoading?: boolean;
}

export function SujeitoForm({ initial, onSubmit, isLoading }: SujeitoFormProps) {
  const { data: itens = [] } = useItens();
  const armas = itens.filter((it) => it.categoria === "arma");
  const { data: rituaisBiblioteca = [] } = useRituais();
  const [form, setForm] = useState<NpcPayload>(
    initial ? {
      name: initial.name,
      image_url: initial.image_url,
      tipo: initial.tipo,
      tamanho: initial.tamanho,
      vd: initial.vd,
      origem: initial.origem,
      descricao: initial.descricao,
      backstory: initial.backstory,
      percepcao: initial.percepcao,
      iniciativa: initial.iniciativa,
      percepcao_as_cegas: initial.percepcao_as_cegas,
      agi: initial.agi,
      atrib_for: initial.atrib_for,
      atrib_int: initial.atrib_int,
      pre: initial.pre,
      vig: initial.vig,
      defesa: initial.defesa,
      fortitude: initial.fortitude,
      reflexos: initial.reflexos,
      vontade: initial.vontade,
      pv: initial.pv,
      pv_atual: initial.pv_atual,
      deslocamento: initial.deslocamento,
      pp_dt: initial.pp_dt,
      pp_dano: initial.pp_dano,
      pp_imune_nex: initial.pp_imune_nex,
      pericias: initial.pericias,
      resistencias: initial.resistencias,
      vulnerabilidades: initial.vulnerabilidades,
      habilidades: initial.habilidades,
      acoes: initial.acoes,
      rituais: initial.rituais,
    } : EMPTY_PAYLOAD
  );

  function set<K extends keyof NpcPayload>(key: K, value: NpcPayload[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function numOrNull(v: string) {
    const n = parseInt(v);
    return isNaN(n) ? null : n;
  }

  // --- listas dinâmicas ---
  function addPericia() {
    set("pericias", [...form.pericias, { nome: "", bonus: "" }]);
  }
  function updatePericia(i: number, field: keyof NpcPericia, v: string) {
    const arr = [...form.pericias];
    arr[i] = { ...arr[i], [field]: v };
    set("pericias", arr);
  }
  function removePericia(i: number) {
    set("pericias", form.pericias.filter((_, idx) => idx !== i));
  }

  function addResistencia() {
    set("resistencias", [...form.resistencias, { tipo: "", valor: "" }]);
  }
  function updateResistencia(i: number, field: keyof NpcResistencia, v: string) {
    const arr = [...form.resistencias];
    arr[i] = { ...arr[i], [field]: v };
    set("resistencias", arr);
  }
  function removeResistencia(i: number) {
    set("resistencias", form.resistencias.filter((_, idx) => idx !== i));
  }

  function addVulnerabilidade() {
    set("vulnerabilidades", [...form.vulnerabilidades, ""]);
  }
  function updateVulnerabilidade(i: number, v: string) {
    const arr = [...form.vulnerabilidades];
    arr[i] = v;
    set("vulnerabilidades", arr);
  }
  function removeVulnerabilidade(i: number) {
    set("vulnerabilidades", form.vulnerabilidades.filter((_, idx) => idx !== i));
  }

  function addHabilidade() {
    set("habilidades", [...form.habilidades, { nome: "", descricao: "", acao: "" }]);
  }
  function updateHabilidade(i: number, field: keyof NpcHabilidade, v: string) {
    const arr = [...form.habilidades];
    arr[i] = { ...arr[i], [field]: v };
    set("habilidades", arr);
  }
  function removeHabilidade(i: number) {
    set("habilidades", form.habilidades.filter((_, idx) => idx !== i));
  }

  function addAcao() {
    set("acoes", [...form.acoes, { tipo: "padrao", nome: "", descricao: "" }]);
  }
  function addAcaoFromItem(itemId: string) {
    const item = armas.find((it) => it.id === itemId);
    if (item) set("acoes", [...form.acoes, acaoFromItem(item)]);
  }
  function updateAcao(i: number, field: keyof NpcAcao, v: string) {
    const arr = [...form.acoes];
    arr[i] = { ...arr[i], [field]: v };
    set("acoes", arr);
  }
  function addOpcao(i: number) {
    set("habilidades", form.habilidades.map((h, idx) => idx === i ? { ...h, opcoes: [...(h.opcoes ?? []), { titulo: "", texto: "" }] } : h));
  }
  function updateOpcao(i: number, oi: number, field: "titulo" | "texto", v: string) {
    set("habilidades", form.habilidades.map((h, idx) => {
      if (idx !== i) return h;
      const opcoes = [...(h.opcoes ?? [])];
      opcoes[oi] = { ...opcoes[oi], [field]: v };
      return { ...h, opcoes };
    }));
  }
  function removeOpcao(i: number, oi: number) {
    set("habilidades", form.habilidades.map((h, idx) => idx === i ? { ...h, opcoes: (h.opcoes ?? []).filter((_, x) => x !== oi) } : h));
  }
  function removeAcao(i: number) {
    set("acoes", form.acoes.filter((_, idx) => idx !== i));
  }

  function addRitual() {
    set("rituais", [...form.rituais, { nome: "", elemento: "", grau: "", descricao: "" }]);
  }
  function addRitualFromBiblioteca(ritualId: string) {
    const r = rituaisBiblioteca.find((x: Ritual) => x.id === ritualId);
    if (!r) return;
    set("rituais", [...form.rituais, {
      nome: r.nome,
      elemento: r.elemento.toUpperCase(),
      grau: `${r.circulo}° Círculo`,
      dt: r.dt != null ? String(r.dt) : "",
      custo_pe: CUSTO_PE[r.circulo as 1 | 2 | 3 | 4],
      descricao: r.descricao ?? "",
    }]);
  }
  function updateRitual(i: number, field: keyof NpcRitual, v: string) {
    const arr = [...form.rituais];
    arr[i] = { ...arr[i], [field]: v };
    set("rituais", arr);
  }
  function removeRitual(i: number) {
    set("rituais", form.rituais.filter((_, idx) => idx !== i));
  }

  const acaoTipoLabel: Record<NpcAcaoTipo, string> = {
    padrao: "Padrão",
    movimento: "Movimento",
    livre: "Livre",
    completa: "Completa",
    reacao: "Reação",
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      className="space-y-6"
    >
      <Tabs defaultValue="identificacao">
        <TabsList className="mb-6">
          <TabsTrigger value="identificacao">Identificação</TabsTrigger>
          <TabsTrigger value="atributos">Atributos</TabsTrigger>
          <TabsTrigger value="pericias">Perícias</TabsTrigger>
          <TabsTrigger value="habilidades">Habilidades</TabsTrigger>
          <TabsTrigger value="acoes">Ações</TabsTrigger>
          <TabsTrigger value="rituais">Rituais</TabsTrigger>
        </TabsList>

        {/* --- IDENTIFICAÇÃO --- */}
        <TabsContent value="identificacao" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Field label="Imagem">
              <ImageUpload
                bucket="sujeitos"
                value={form.image_url}
                onChange={(url) => set("image_url", url)}
              />
            </Field>

            <Field label="Nome do Sujeito *">
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Tipo">
                <Select value={form.tipo ?? ""} onValueChange={(v) => set("tipo", v as NpcPayload["tipo"])}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="pessoa">Pessoa</SelectItem>
                    <SelectItem value="criatura">Criatura</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Tamanho">
                <Select value={form.tamanho ?? ""} onValueChange={(v) => set("tamanho", v as NpcPayload["tamanho"])}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="pequeno">Pequeno</SelectItem>
                    <SelectItem value="medio">Médio</SelectItem>
                    <SelectItem value="grande">Grande</SelectItem>
                    <SelectItem value="enorme">Enorme</SelectItem>
                    <SelectItem value="colossal">Colossal</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="VD">
                <Input
                  type="number"
                  value={form.vd ?? ""}
                  onChange={(e) => set("vd", numOrNull(e.target.value))}
                />
              </Field>

              <Field label="Origem Paranormal">
                <Select value={form.origem ?? ""} onValueChange={(v) => set("origem", v as NpcPayload["origem"])}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Nenhuma (mundano)" /></SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="sangue">Sangue</SelectItem>
                    <SelectItem value="morte">Morte</SelectItem>
                    <SelectItem value="medo">Medo</SelectItem>
                    <SelectItem value="conhecimento">Conhecimento</SelectItem>
                    <SelectItem value="energia">Energia</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Descrição / Aparência">
              <Textarea
                value={form.descricao ?? ""}
                onChange={(e) => set("descricao", e.target.value || null)}
                rows={3}
              />
            </Field>

            <Field label="Backstory">
              <Textarea
                value={form.backstory ?? ""}
                onChange={(e) => set("backstory", e.target.value || null)}
                rows={6}
                placeholder="História, motivações, segredos..."
              />
            </Field>
          </div>
        </TabsContent>

        {/* --- ATRIBUTOS & COMBATE --- */}
        <TabsContent value="atributos" className="space-y-6">
          <section>
            <SectionTitle>Sentidos</SectionTitle>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <Field label="Percepção">
                <Input value={form.percepcao ?? ""} onChange={(e) => set("percepcao", e.target.value || null)} placeholder="ex: 2O+10" />
              </Field>
              <Field label="Iniciativa">
                <Input value={form.iniciativa ?? ""} onChange={(e) => set("iniciativa", e.target.value || null)} placeholder="ex: 2O+5" />
              </Field>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Switch
                checked={form.percepcao_as_cegas}
                onCheckedChange={(v) => set("percepcao_as_cegas", v)}
              />
              <Label className="text-xs text-muted-foreground">Percepção às Cegas</Label>
            </div>
          </section>

          <section>
            <SectionTitle>Atributos</SectionTitle>
            <div className="grid grid-cols-5 gap-3 mt-3">
              {(["agi", "atrib_for", "atrib_int", "pre", "vig"] as const).map((attr) => (
                <Field key={attr} label={attrLabel(attr)}>
                  <Input
                    type="number"
                    value={form[attr] ?? ""}
                    onChange={(e) => set(attr, numOrNull(e.target.value))}
                    className="text-center"
                  />
                </Field>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle>Combate</SectionTitle>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <Field label="Defesa">
                <Input type="number" value={form.defesa ?? ""} onChange={(e) => set("defesa", numOrNull(e.target.value))} />
              </Field>
              <Field label="PV">
                <Input type="number" value={form.pv ?? ""} onChange={(e) => set("pv", numOrNull(e.target.value))} />
              </Field>
              <Field label="Fortitude">
                <Input value={form.fortitude ?? ""} onChange={(e) => set("fortitude", e.target.value || null)} placeholder="ex: 3O+10" />
              </Field>
              <Field label="Reflexos">
                <Input value={form.reflexos ?? ""} onChange={(e) => set("reflexos", e.target.value || null)} placeholder="ex: 2O+5" />
              </Field>
              <Field label="Vontade">
                <Input value={form.vontade ?? ""} onChange={(e) => set("vontade", e.target.value || null)} placeholder="ex: 3O+10" />
              </Field>
              <Field label="Deslocamento">
                <Input value={form.deslocamento ?? ""} onChange={(e) => set("deslocamento", e.target.value || null)} placeholder="ex: 9m | 6" />
              </Field>
            </div>
          </section>

          {/* Presença Perturbadora — só para criaturas */}
          {form.tipo === "criatura" && (
            <section>
              <SectionTitle>Presença Perturbadora</SectionTitle>
              <p className="text-xs text-muted-foreground mt-0.5 mb-3">Perda de Sanidade ao ver a criatura.</p>
              <div className="grid grid-cols-3 gap-3">
                <Field label="DT">
                  <Input value={form.pp_dt ?? ""} onChange={(e) => set("pp_dt", e.target.value || null)} placeholder="ex: 20" />
                </Field>
                <Field label="Dano">
                  <Input value={form.pp_dano ?? ""} onChange={(e) => set("pp_dano", e.target.value || null)} placeholder="ex: 3d8 mental" />
                </Field>
                <Field label="Imune a partir de (NEX)">
                  <Input value={form.pp_imune_nex ?? ""} onChange={(e) => set("pp_imune_nex", e.target.value || null)} placeholder="ex: 40%" />
                </Field>
              </div>
            </section>
          )}
        </TabsContent>

        {/* --- PERÍCIAS --- */}
        <TabsContent value="pericias" className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <SectionTitle>Perícias</SectionTitle>
              <AddButton onClick={addPericia} />
            </div>
            <div className="space-y-2">
              {form.pericias.map((p, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Select value={p.nome} onValueChange={(v) => updatePericia(i, "nome", v)}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Perícia" /></SelectTrigger>
                    <SelectContent position="popper">
                      {PERICIAS_UNICAS.map((per) => (
                        <SelectItem key={per.key} value={per.nome}>{per.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Bônus (ex: 2O+10)" value={p.bonus} onChange={(e) => updatePericia(i, "bonus", e.target.value)} className="w-40" />
                  <RemoveButton onClick={() => removePericia(i)} />
                </div>
              ))}
              {form.pericias.length === 0 && <Empty>Nenhuma perícia adicionada.</Empty>}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <SectionTitle>Resistências</SectionTitle>
              <AddButton onClick={addResistencia} />
            </div>
            <div className="space-y-2">
              {form.resistencias.map((r, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input placeholder="Tipo (ex: Balístico)" value={r.tipo} onChange={(e) => updateResistencia(i, "tipo", e.target.value)} />
                  <Input placeholder="Valor (ex: 5)" value={r.valor} onChange={(e) => updateResistencia(i, "valor", e.target.value)} className="w-28" />
                  <RemoveButton onClick={() => removeResistencia(i)} />
                </div>
              ))}
              {form.resistencias.length === 0 && <Empty>Nenhuma resistência adicionada.</Empty>}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <SectionTitle>Vulnerabilidades</SectionTitle>
              <AddButton onClick={addVulnerabilidade} />
            </div>
            <div className="space-y-2">
              {form.vulnerabilidades.map((v, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input placeholder="ex: Energia" value={v} onChange={(e) => updateVulnerabilidade(i, e.target.value)} />
                  <RemoveButton onClick={() => removeVulnerabilidade(i)} />
                </div>
              ))}
              {form.vulnerabilidades.length === 0 && <Empty>Nenhuma vulnerabilidade adicionada.</Empty>}
            </div>
          </section>
        </TabsContent>

        {/* --- HABILIDADES --- */}
        <TabsContent value="habilidades">
          <div className="flex items-center justify-between mb-3">
            <SectionTitle>Habilidades Especiais</SectionTitle>
            <AddButton onClick={addHabilidade} />
          </div>
          <div className="space-y-4">
            {form.habilidades.map((h, i) => (
              <div key={i} className="border border-border p-3 space-y-2">
                <div className="flex gap-2 items-center">
                  <Input placeholder="Nome da habilidade" value={h.nome} onChange={(e) => updateHabilidade(i, "nome", e.target.value)} />
                  <Select value={h.acao || "__none__"} onValueChange={(v) => updateHabilidade(i, "acao", v === "__none__" ? "" : v)}>
                    <SelectTrigger className="w-40 shrink-0"><SelectValue placeholder="Ação" /></SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="__none__" className="text-muted-foreground">— sem ação —</SelectItem>
                      {ACOES_HABILIDADE.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <RemoveButton onClick={() => removeHabilidade(i)} />
                </div>
                <Textarea placeholder="Descrição" rows={2} value={h.descricao} onChange={(e) => updateHabilidade(i, "descricao", e.target.value)} />
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">Evita com</span>
                  <Select value={h.resistencia || "__none__"} onValueChange={(v) => updateHabilidade(i, "resistencia", v === "__none__" ? "" : v)}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Teste / perícia" /></SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="__none__" className="text-muted-foreground">— nenhum —</SelectItem>
                      {TESTES_RESISTENCIA.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input placeholder="DT (ex: 20)" value={h.resistencia_dt ?? ""} onChange={(e) => updateHabilidade(i, "resistencia_dt", e.target.value)} className="w-32 shrink-0" />
                </div>

                {/* Desfechos / opções condicionais */}
                <div className="space-y-2 border-t border-border/60 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Desfechos / opções</span>
                    <Button type="button" variant="ghost" size="sm" className="h-6 text-[11px] px-2" onClick={() => addOpcao(i)}>
                      <PlusIcon className="h-3 w-3 mr-1" /> Opção
                    </Button>
                  </div>
                  {(h.opcoes ?? []).map((o, oi) => (
                    <div key={oi} className="rounded border border-border/60 bg-muted/20 p-2 space-y-1.5">
                      <div className="flex gap-2 items-center">
                        <Input placeholder="Título (ex: Tentou se defender)" value={o.titulo} onChange={(e) => updateOpcao(i, oi, "titulo", e.target.value)} className="h-8 text-xs" />
                        <button type="button" onClick={() => removeOpcao(i, oi)} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <Textarea placeholder="O que acontece nesse caso..." rows={2} value={o.texto} onChange={(e) => updateOpcao(i, oi, "texto", e.target.value)} className="text-xs" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {form.habilidades.length === 0 && <Empty>Nenhuma habilidade adicionada.</Empty>}
          </div>
        </TabsContent>

        {/* --- AÇÕES --- */}
        <TabsContent value="acoes">
          <div className="flex items-center justify-between mb-3 gap-2">
            <SectionTitle>Ações</SectionTitle>
            <div className="flex items-center gap-2">
              {armas.length > 0 && (
                <Select value="" onValueChange={addAcaoFromItem}>
                  <SelectTrigger className="w-auto h-8 text-xs gap-1.5">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Puxar de um item" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {armas.map((it) => (
                      <SelectItem key={it.id} value={it.id}>
                        {it.nome}{it.dano ? <span className="text-muted-foreground"> · {it.dano}</span> : null}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <AddButton onClick={addAcao} />
            </div>
          </div>
          <div className="space-y-4">
            {form.acoes.map((a, i) => (
              <div key={i} className="border border-border p-3 space-y-3">
                <div className="flex gap-2 items-center">
                  <Select value={a.tipo} onValueChange={(v) => updateAcao(i, "tipo", v)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent position="popper">
                      {(Object.entries(acaoTipoLabel) as [NpcAcaoTipo, string][]).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Nome da ação" value={a.nome} onChange={(e) => updateAcao(i, "nome", e.target.value)} />
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-sm text-muted-foreground">×</span>
                    <Input
                      type="number" min={1}
                      placeholder="1"
                      title="Quantidade de ataques"
                      value={a.quantidade ?? ""}
                      onChange={(e) => {
                        const n = e.target.value ? Math.max(1, parseInt(e.target.value, 10) || 1) : undefined;
                        set("acoes", form.acoes.map((x, idx) => (idx === i ? { ...x, quantidade: n } : x)));
                      }}
                      className="w-16 text-center"
                    />
                  </div>
                  <RemoveButton onClick={() => removeAcao(i)} />
                </div>
                <Textarea placeholder="Descrição" rows={2} value={a.descricao} onChange={(e) => updateAcao(i, "descricao", e.target.value)} />
                <div className="grid grid-cols-3 gap-2">
                  <Input placeholder="Teste (ex: 3O+15)" value={a.teste ?? ""} onChange={(e) => updateAcao(i, "teste", e.target.value)} />
                  <Input placeholder="Dano (ex: 2d6+10)" value={a.dano ?? ""} onChange={(e) => updateAcao(i, "dano", e.target.value)} />
                  <Input placeholder="Crítico (ex: 19, x3)" value={a.critico ?? ""} onChange={(e) => updateAcao(i, "critico", e.target.value)} />
                </div>
              </div>
            ))}
            {form.acoes.length === 0 && <Empty>Nenhuma ação adicionada.</Empty>}
          </div>
        </TabsContent>

        {/* --- RITUAIS --- */}
        <TabsContent value="rituais">
          <div className="flex items-center justify-between mb-3 gap-2">
            <SectionTitle>Rituais</SectionTitle>
            <div className="flex items-center gap-2">
              {rituaisBiblioteca.length > 0 && (
                <Select value="" onValueChange={addRitualFromBiblioteca}>
                  <SelectTrigger className="w-auto h-8 text-xs gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Puxar da biblioteca" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-72">
                    {rituaisBiblioteca.map((r: Ritual) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.nome}<span className="text-muted-foreground"> · {r.circulo}° · {r.elemento}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <AddButton onClick={addRitual} />
            </div>
          </div>
          <div className="space-y-4">
            {form.rituais.map((r, i) => (
              <div key={i} className="border border-border p-3 space-y-3">
                <div className="flex gap-2 items-center">
                  <Input placeholder="Nome do ritual" value={r.nome} onChange={(e) => updateRitual(i, "nome", e.target.value)} className="flex-1" />
                  <RemoveButton onClick={() => removeRitual(i)} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Input placeholder="Elemento (ex: SANGUE)" value={r.elemento} onChange={(e) => updateRitual(i, "elemento", e.target.value)} />
                  <Input placeholder="Grau (ex: Discente 2)" value={r.grau} onChange={(e) => updateRitual(i, "grau", e.target.value)} />
                  <Input placeholder="DT (ex: 20)" value={r.dt ?? ""} onChange={(e) => updateRitual(i, "dt", e.target.value)} />
                  <Input
                    type="number" min={0}
                    placeholder="PE"
                    value={r.custo_pe ?? ""}
                    onChange={(e) => {
                      const n = e.target.value ? Math.max(0, parseInt(e.target.value, 10) || 0) : undefined;
                      set("rituais", form.rituais.map((x, idx) => (idx === i ? { ...x, custo_pe: n } : x)));
                    }}
                  />
                </div>
                <Textarea placeholder="Descrição do efeito" rows={2} value={r.descricao} onChange={(e) => updateRitual(i, "descricao", e.target.value)} />
              </div>
            ))}
            {form.rituais.length === 0 && <Empty>Nenhum ritual adicionado.</Empty>}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : initial ? "Salvar Alterações" : "Registrar Sujeito"}
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{children}</p>;
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick}>
      <PlusIcon className="h-3.5 w-3.5" />
      Adicionar
    </Button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground py-4 text-center border border-dashed border-border">{children}</p>;
}

function attrLabel(attr: string) {
  const map: Record<string, string> = {
    agi: "AGI", atrib_for: "FOR", atrib_int: "INT", pre: "PRE", vig: "VIG",
  };
  return map[attr] ?? attr;
}

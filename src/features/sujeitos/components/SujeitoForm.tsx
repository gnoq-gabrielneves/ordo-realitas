"use client";

import { ImageUpload } from "@/shared/components/ImageUpload/ImageUpload";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { Textarea } from "@/shared/components/ui/textarea";
import { Npc, NpcAcao, NpcAcaoTipo, NpcHabilidade, NpcPayload, NpcPericia, NpcResistencia, NpcRitual } from "@/shared/types/npc";
import { PERICIAS } from "@/shared/constants/pericias";
import { useCirculos } from "@/features/circulos/hooks/useCirculos";
import { useItens } from "@/features/itens/hooks/useItens";
import { useRituais } from "@/features/rituais/hooks/useRituais";
import { Item } from "@/shared/types/item";
import { ELEMENTO_BADGE, ELEMENTO_BG, ELEMENTO_LABELS, ELEMENTOS } from "@/shared/constants/elements";
import { CUSTO_PE, Ritual, RitualCirculo, RitualElemento } from "@/shared/types/ritual";
import { cn } from "@/shared/lib/utils";
import { BookOpenCheck, CheckCircle2, Eye, Heart, Package, PlusIcon, Search, Shield, Sparkles, Swords, Trash2, UserRound, X } from "lucide-react";
import { useRef, useState } from "react";

// Perícias únicas por nome (Profissão aparece 2x no constant).
const PERICIAS_UNICAS = PERICIAS.filter(
  (p, i, arr) => arr.findIndex((x) => x.nome === p.nome) === i
);

const ACOES_HABILIDADE = ["Passiva", "Livre", "Reação", "Movimento", "Padrão", "Completa"];
const CIRCULOS: RitualCirculo[] = [1, 2, 3, 4];

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

function parseDescricaoRitual(descricao: string) {
  return descricao.split(/(?=↑\s)/)[0].trim();
}

function ritualFromBiblioteca(r: Ritual): NpcRitual {
  const detalhes = [
    r.execucao && `Execução: ${r.execucao}`,
    r.alcance && `Alcance: ${r.alcance}`,
    r.alvo && `Alvo: ${r.alvo}`,
    r.area && `Área: ${r.area}`,
    r.duracao && `Duração: ${r.duracao}`,
    r.resistencia && r.resistencia !== "—" && `Resistência: ${r.resistencia}`,
  ].filter(Boolean).join(" · ");

  return {
    nome: r.nome,
    elemento: ELEMENTO_LABELS[r.elemento],
    grau: `${r.circulo}° Círculo`,
    dt: r.dt != null ? String(r.dt) : "",
    custo_pe: r.custo_pe ?? CUSTO_PE[r.circulo],
    descricao: [detalhes, r.descricao].filter(Boolean).join("\n\n"),
  };
}

const EMPTY_PAYLOAD: NpcPayload = {
  circle_id: null,
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
  enigma_medo: null,
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
  const { data: circulos = [] } = useCirculos();
  const { data: itens = [] } = useItens();
  const armas = itens.filter((it) => it.categoria === "arma");
  const { data: rituaisBiblioteca = [] } = useRituais();
  const [buscaAcao, setBuscaAcao] = useState("");
  const [buscaRitual, setBuscaRitual] = useState("");
  const [filtroElemento, setFiltroElemento] = useState<RitualElemento | "todos">("todos");
  const [filtroCirculo, setFiltroCirculo] = useState<RitualCirculo | "todos">("todos");
  const [ritualAdicionado, setRitualAdicionado] = useState<string | null>(null);
  const ritualFeedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [form, setForm] = useState<NpcPayload>(
    initial ? {
      circle_id: initial.circle_id,
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
      enigma_medo: initial.enigma_medo,
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
  function addAcaoItem(item: Item) {
    set("acoes", [...form.acoes, acaoFromItem(item)]);
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
    set("rituais", [...form.rituais, ritualFromBiblioteca(r)]);
    setRitualAdicionado(ritualId);
    if (ritualFeedbackTimer.current) clearTimeout(ritualFeedbackTimer.current);
    ritualFeedbackTimer.current = setTimeout(() => setRitualAdicionado(null), 2600);
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

  const armasFiltradas = armas.filter((item) => {
    if (!buscaAcao.trim()) return true;
    const q = buscaAcao.toLowerCase();
    return [item.nome, item.dano, item.teste, item.especial].some((value) => (value ?? "").toLowerCase().includes(q));
  });

  const rituaisFiltrados = rituaisBiblioteca
    .filter((r: Ritual) => filtroElemento === "todos" || r.elemento === filtroElemento)
    .filter((r: Ritual) => filtroCirculo === "todos" || r.circulo === filtroCirculo)
    .filter((r: Ritual) => {
      if (!buscaRitual.trim()) return true;
      const q = buscaRitual.toLowerCase();
      return [r.nome, r.descricao, r.alvo, r.area, r.resistencia].some((value) => (value ?? "").toLowerCase().includes(q));
    });

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"
    >
      <div className="space-y-6">
        <EditorCard title="Identidade" icon={<UserRound className="h-4 w-4" />} description="Defina quem é o sujeito e como ele deve aparecer nos arquivos da mesa.">
          <div className="grid gap-5 xl:grid-cols-[170px_minmax(0,1fr)]">
            <Field label="Imagem">
              <ImageUpload
                bucket="sujeitos"
                value={form.image_url}
                onChange={(url) => set("image_url", url)}
                className="aspect-square h-auto w-full"
              />
            </Field>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Nome do Sujeito *">
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="Ex: Carniçal de Sangue" />
              </Field>
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
              <Field label="VD">
                <Input
                  type="number"
                  value={form.vd ?? ""}
                  onChange={(e) => set("vd", numOrNull(e.target.value))}
                />
              </Field>
              <Field label="Origem">
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
              <Field label="Círculo">
                <Select value={form.circle_id ?? "none"} onValueChange={(v) => set("circle_id", v === "none" ? null : v)}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Sem círculo" /></SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="none">Sem círculo</SelectItem>
                    {circulos.map((circulo) => (
                      <SelectItem key={circulo.id} value={circulo.id}>{circulo.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="md:col-span-3">
                <Field label="Descrição / Aparência">
                  <Textarea
                    value={form.descricao ?? ""}
                    onChange={(e) => set("descricao", e.target.value || null)}
                    rows={3}
                    placeholder="Como o sujeito aparece em cena, pistas visuais, comportamento..."
                  />
                </Field>
              </div>
            </div>
          </div>
        </EditorCard>

        <EditorCard title="Combate e atributos" icon={<Heart className="h-4 w-4" />} description="Valores usados em iniciativa, ataques, defesa e testes rápidos.">
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <SectionTitle>Defesa e vida</SectionTitle>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field label="Defesa">
                  <Input type="number" value={form.defesa ?? ""} onChange={(e) => set("defesa", numOrNull(e.target.value))} />
                </Field>
                <Field label="PV">
                  <Input type="number" value={form.pv ?? ""} onChange={(e) => set("pv", numOrNull(e.target.value))} />
                </Field>
              </div>
            </div>
            <div>
              <SectionTitle>Sentidos</SectionTitle>
              <div className="mt-3 grid grid-cols-2 gap-3">
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
            </div>
          </div>

          <div className="mt-5">
            <SectionTitle>Atributos</SectionTitle>
            <div className="mt-3 grid grid-cols-5 gap-3">
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
          </div>

          <div className="mt-5">
            <SectionTitle>Resistências e movimento</SectionTitle>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
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
          </div>

          {form.tipo === "criatura" && (
            <div className="mt-5 space-y-4">
              <div className="border border-purple-500/25 bg-purple-500/[0.04] p-4">
                <SectionTitle>Presença Perturbadora</SectionTitle>
                <p className="mb-3 mt-0.5 text-xs text-muted-foreground">Perda de Sanidade ao ver a criatura.</p>
                <div className="grid gap-3 md:grid-cols-3">
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
              </div>

              <div className="border border-foreground/15 bg-foreground/[0.03] p-4">
                <SectionTitle>Enigma do Medo</SectionTitle>
                <p className="mb-3 mt-0.5 text-xs text-muted-foreground">Condição, segredo ou método necessário para entender ou enfrentar a criatura.</p>
                <Textarea
                  value={form.enigma_medo ?? ""}
                  onChange={(e) => set("enigma_medo", e.target.value || null)}
                  rows={4}
                  placeholder="Ex: só pode ser ferida depois que alguém descobre o nome verdadeiro..."
                />
              </div>
            </div>
          )}
        </EditorCard>

        <EditorCard
          title="Perícias e defesas especiais"
          icon={<Shield className="h-4 w-4" />}
          description="Use para testes, resistências a dano e vulnerabilidades importantes."
          collapsible
          defaultOpen={form.pericias.length > 0 || form.resistencias.length > 0 || form.vulnerabilidades.length > 0}
          meta={`${form.pericias.length + form.resistencias.length + form.vulnerabilidades.length} itens`}
        >
          <div>
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
          </div>

          <div className="mt-6">
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
          </div>

          <div className="mt-6">
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
          </div>
        </EditorCard>

        <EditorCard
          title="Habilidades especiais"
          icon={<Sparkles className="h-4 w-4" />}
          description="Poderes, auras, reações e efeitos especiais do sujeito."
          collapsible
          defaultOpen={form.habilidades.length > 0}
          meta={pluralize(form.habilidades.length, "habilidade", "habilidades")}
        >
          <div className="flex items-center justify-between mb-3">
            <SectionTitle>Habilidades Especiais</SectionTitle>
            <AddButton onClick={addHabilidade} />
          </div>
          <div className="space-y-4">
            {form.habilidades.map((h, i) => (
              <div key={i} className="space-y-3 border border-border bg-background p-4">
                <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_180px_36px] lg:items-center">
                  <Input placeholder="Nome da habilidade" value={h.nome} onChange={(e) => updateHabilidade(i, "nome", e.target.value)} className="min-w-0" />
                  <Select value={h.acao || "__none__"} onValueChange={(v) => updateHabilidade(i, "acao", v === "__none__" ? "" : v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Ação" /></SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="__none__" className="text-muted-foreground">— sem ação —</SelectItem>
                      {ACOES_HABILIDADE.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end">
                    <RemoveButton onClick={() => removeHabilidade(i)} />
                  </div>
                </div>
                <Textarea placeholder="Descrição" rows={2} value={h.descricao} onChange={(e) => updateHabilidade(i, "descricao", e.target.value)} />
                <div className="grid gap-2 lg:grid-cols-[90px_minmax(0,1fr)_170px] lg:items-center">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Evita com</span>
                  <Select value={h.resistencia || "__none__"} onValueChange={(v) => updateHabilidade(i, "resistencia", v === "__none__" ? "" : v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Teste / perícia" /></SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="__none__" className="text-muted-foreground">— nenhum —</SelectItem>
                      {TESTES_RESISTENCIA.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input placeholder="DT (ex: 20)" value={h.resistencia_dt ?? ""} onChange={(e) => updateHabilidade(i, "resistencia_dt", e.target.value)} />
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
        </EditorCard>

        <EditorCard
          title="Ações"
          icon={<Swords className="h-4 w-4" />}
          description="Ataques e ações prontas para usar em cena. Você pode puxar armas cadastradas em Itens."
          collapsible
          defaultOpen={form.acoes.length > 0}
          meta={pluralize(form.acoes.length, "ação", "ações")}
        >
          <div className="flex items-center justify-between mb-3 gap-2">
            <SectionTitle>Ações</SectionTitle>
            <AddButton onClick={addAcao} />
          </div>
          {armas.length > 0 && (
            <div className="mb-5 space-y-3 border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Armas da biblioteca</p>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={buscaAcao}
                  onChange={(e) => setBuscaAcao(e.target.value)}
                  placeholder="Buscar arma, dano, teste ou efeito..."
                  className="h-10 pl-9"
                />
                {buscaAcao && (
                  <button type="button" onClick={() => setBuscaAcao("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid max-h-64 gap-2 overflow-y-auto pr-1 md:grid-cols-2">
                {armasFiltradas.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => addAcaoItem(item)}
                    className="group border border-border bg-background p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/[0.03]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{item.nome}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {[item.dano, item.teste, item.critico].filter(Boolean).join(" · ") || "Adicionar como ação"}
                        </p>
                      </div>
                      <PlusIcon className="h-4 w-4 shrink-0 text-primary opacity-60 transition-opacity group-hover:opacity-100" />
                    </div>
                    {item.especial && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.especial}</p>}
                  </button>
                ))}
              </div>
              {armasFiltradas.length === 0 && <Empty>Nenhuma arma encontrada.</Empty>}
            </div>
          )}
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
        </EditorCard>

        <EditorCard
          title="Rituais"
          icon={<Sparkles className="h-4 w-4" />}
          description="Rituais conhecidos ou efeitos paranormais que funcionam como ritual."
          collapsible
          defaultOpen={form.rituais.length > 0}
          meta={pluralize(form.rituais.length, "ritual", "rituais")}
        >
          <div className="flex items-center justify-between mb-3 gap-2">
            <SectionTitle>Rituais</SectionTitle>
            <AddButton onClick={addRitual} />
          </div>
          {rituaisBiblioteca.length > 0 && (
            <div className="mb-5 space-y-3 border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-2">
                <BookOpenCheck className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Biblioteca de rituais</p>
                {ritualAdicionado && (
                  <span className="inline-flex items-center gap-1 border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary" aria-live="polite">
                    <CheckCircle2 className="h-3 w-3" />
                    Adicionado
                  </span>
                )}
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={buscaRitual}
                  onChange={(e) => setBuscaRitual(e.target.value)}
                  placeholder="Buscar ritual, efeito, alvo ou resistência..."
                  className="h-10 pl-9"
                />
                {buscaRitual && (
                  <button type="button" onClick={() => setBuscaRitual("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <FilterButton active={filtroElemento === "todos"} onClick={() => setFiltroElemento("todos")}>
                  Todos
                </FilterButton>
                {ELEMENTOS.map((elemento) => (
                  <FilterButton
                    key={elemento}
                    active={filtroElemento === elemento}
                    className={filtroElemento === elemento ? `${ELEMENTO_BG[elemento]} ${ELEMENTO_BADGE[elemento]} border-current` : undefined}
                    onClick={() => setFiltroElemento(filtroElemento === elemento ? "todos" : elemento)}
                  >
                    {ELEMENTO_LABELS[elemento]}
                  </FilterButton>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <FilterButton active={filtroCirculo === "todos"} onClick={() => setFiltroCirculo("todos")}>
                  Todos os círculos
                </FilterButton>
                {CIRCULOS.map((circulo) => (
                  <FilterButton key={circulo} active={filtroCirculo === circulo} onClick={() => setFiltroCirculo(filtroCirculo === circulo ? "todos" : circulo)}>
                    {circulo}° Círculo
                  </FilterButton>
                ))}
              </div>
              {rituaisFiltrados.length === 0 ? (
                <Empty>Nenhum ritual encontrado.</Empty>
              ) : (
                <div className="grid max-h-[28rem] gap-3 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
                  {rituaisFiltrados.map((ritual: Ritual) => {
                    const foiAdicionado = ritualAdicionado === ritual.id;
                    return (
                      <button
                        key={ritual.id}
                        type="button"
                        onClick={() => addRitualFromBiblioteca(ritual.id)}
                        className={cn(
                          "group border bg-background p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/[0.03]",
                          foiAdicionado ? "border-primary bg-primary/[0.08] ring-1 ring-primary/30" : "border-border",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold leading-tight">{ritual.nome}</p>
                            <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                              {ritual.circulo}° Círculo · {(ritual.custo_pe ?? CUSTO_PE[ritual.circulo])} PE
                            </p>
                          </div>
                          {foiAdicionado ? (
                            <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                              <CheckCircle2 className="h-4 w-4" />
                              Adicionado
                            </span>
                          ) : (
                            <PlusIcon className="h-4 w-4 shrink-0 text-primary opacity-60 transition-opacity group-hover:opacity-100" />
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <Badge variant="outline" className={cn("rounded-none px-1.5 py-0 text-[10px]", ELEMENTO_BADGE[ritual.elemento])}>
                            {ELEMENTO_LABELS[ritual.elemento]}
                          </Badge>
                          {ritual.execucao && <Badge variant="outline" className="rounded-none px-1.5 py-0 text-[10px]">{ritual.execucao}</Badge>}
                          {ritual.alvo && <Badge variant="outline" className="rounded-none px-1.5 py-0 text-[10px]">{ritual.alvo}</Badge>}
                          {ritual.dt && <Badge variant="outline" className="rounded-none px-1.5 py-0 text-[10px]">DT {ritual.dt}</Badge>}
                        </div>
                        {ritual.descricao && <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{parseDescricaoRitual(ritual.descricao)}</p>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
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
        </EditorCard>

        <EditorCard
          title="Dossiê narrativo"
          icon={<BookOpenCheck className="h-4 w-4" />}
          description="História, motivações, segredos e anotações do mestre."
          collapsible
          defaultOpen={!!form.backstory}
          meta={form.backstory ? "com notas" : "opcional"}
        >
          <Field label="Backstory">
            <Textarea
              value={form.backstory ?? ""}
              onChange={(e) => set("backstory", e.target.value || null)}
              rows={7}
              placeholder="História, motivações, segredos..."
            />
          </Field>
        </EditorCard>
      </div>

      <aside className="space-y-4">
        <div className="sticky top-6 space-y-4">
          <EditorCard title="Resumo" icon={<Eye className="h-4 w-4" />}>
            <div className="space-y-3">
              <Summary label="Nome" value={form.name || "Sem nome"} />
              <Summary label="Tipo" value={form.tipo ?? "Não definido"} />
              <Summary label="Círculo" value={circulos.find((circulo) => circulo.id === form.circle_id)?.nome ?? "Nenhum"} />
              <Summary label="VD" value={form.vd ?? "—"} danger={form.vd != null} />
              <Summary label="Defesa" value={form.defesa ?? "—"} />
              <Summary label="PV" value={form.pv ?? "—"} />
              <Summary label="Ações" value={form.acoes.length} />
              <Summary label="Rituais" value={form.rituais.length} />
            </div>
          </EditorCard>

          <div className="border border-primary/30 bg-primary/[0.04] p-4">
            <p className="text-sm font-semibold">{initial ? "Alterar registro" : "Novo registro"}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Salve para atualizar o arquivo usado na listagem e no dossiê do sujeito.
            </p>
            <Button type="submit" className="mt-3 w-full" disabled={isLoading}>
              {isLoading ? "Salvando..." : initial ? "Salvar alterações" : "Registrar sujeito"}
            </Button>
          </div>
        </div>
      </aside>
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

function EditorCard({
  title,
  description,
  icon,
  children,
  collapsible,
  defaultOpen = true,
  meta,
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  meta?: string;
}) {
  if (collapsible) {
    return (
      <details className="group border border-border bg-card" open={defaultOpen}>
        <summary className="flex cursor-pointer list-none items-start justify-between gap-4 border-b border-border px-5 py-4 transition-colors hover:bg-muted/20 [&::-webkit-details-marker]:hidden">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-primary">{icon}</span>
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em]">{title}</h2>
            </div>
            {description && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {meta && <span className="border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{meta}</span>}
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary group-open:hidden">Abrir</span>
            <span className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground group-open:inline">Fechar</span>
          </div>
        </summary>
        <div className="p-5">{children}</div>
      </details>
    );
  }

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

function Summary({ label, value, danger }: { label: string; value: React.ReactNode; danger?: boolean }) {
  return (
    <div className="border border-border bg-background p-3">
      <p className={danger ? "text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-500" : "text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"}>{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{children}</p>;
}

function FilterButton({
  active,
  className,
  onClick,
  children,
}: {
  active: boolean;
  className?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border px-2.5 py-1 text-[11px] font-medium transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
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
    <button type="button" onClick={onClick} className="grid h-9 w-9 shrink-0 place-items-center border border-transparent text-muted-foreground transition-colors hover:border-destructive/30 hover:text-destructive">
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

function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

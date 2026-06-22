"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { Textarea } from "@/shared/components/ui/textarea";
import { useLugares } from "@/features/lugares/hooks/useLugares";
import { useSujeitos } from "@/features/sujeitos/hooks/useSujeitos";
import { MentionTextarea } from "@/features/campanhas/components/MentionTextarea";
import { CenaBloco, CenaPayload, SceneTipo } from "@/shared/types/campaign";
import { Npc } from "@/shared/types/npc";
import { BookOpen, ChevronDown, ChevronUp, Clock, FileText, MapPin, MessageSquare, PlusIcon, ScrollText, Settings2, Text, Trash2, UserRound, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const NENHUM_LUGAR = "__none__";

const TIPOS: { value: SceneTipo; label: string; hint: string }[] = [
  { value: "narrativa", label: "Narrativa", hint: "descrição, descoberta ou transição" },
  { value: "investigacao", label: "Investigação", hint: "pistas, testes e pressão de tempo" },
  { value: "combate", label: "Combate", hint: "ameaças, mapa mental e consequência" },
  { value: "social", label: "Social", hint: "diálogo, tensão e negociação" },
  { value: "interludio", label: "Interlúdio", hint: "respiro, descanso ou virada emocional" },
];

interface CenaFormProps {
  missionId: string;
  defaultValues?: Partial<CenaPayload>;
  onSubmit: (payload: CenaPayload) => void;
  isPending?: boolean;
}

export function CenaForm({ missionId, defaultValues, onSubmit, isPending }: CenaFormProps) {
  const { data: lugares = [] } = useLugares();
  const { data: sujeitos = [] } = useSujeitos();
  const [form, setForm] = useState<CenaPayload>({
    mission_id: missionId,
    titulo: defaultValues?.titulo ?? "",
    parte: defaultValues?.parte ?? null,
    tipo: defaultValues?.tipo ?? "narrativa",
    texto_descritivo: defaultValues?.texto_descritivo ?? null,
    notas_mestre: defaultValues?.notas_mestre ?? null,
    ordem: defaultValues?.ordem ?? 0,
    urgencia: defaultValues?.urgencia ?? false,
    urgencia_rodadas: defaultValues?.urgencia_rodadas ?? [],
    lugar_id: defaultValues?.lugar_id ?? null,
    roteiro: defaultValues?.roteiro ?? [],
  });

  function set(field: keyof CenaPayload, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const isInvestigacao = form.tipo === "investigacao";

  // ── Roteiro (blocos) ──────────────────────────────────────
  function addBloco(tipo: CenaBloco["tipo"]) {
    set("roteiro", [...form.roteiro, { tipo, texto: "", sujeito_id: null, mencoes: [] }]);
  }
  function updateBloco(i: number, patch: Partial<CenaBloco>) {
    set("roteiro", form.roteiro.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  }
  function removeBloco(i: number) {
    set("roteiro", form.roteiro.filter((_, idx) => idx !== i));
  }
  function moveBloco(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= form.roteiro.length) return;
    const arr = [...form.roteiro];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    set("roteiro", arr);
  }
  // Ao mencionar: registra no mapa de menções e, em fala sem falante, define o falante.
  function onMention(i: number, s: Npc) {
    const b = form.roteiro[i];
    const mencoes = b.mencoes ?? [];
    const jaTem = mencoes.some((m) => m.nome === s.name && m.sujeito_id === s.id);
    const patch: Partial<CenaBloco> = {
      mencoes: jaTem ? mencoes : [...mencoes, { nome: s.name, sujeito_id: s.id }],
    };
    if (b.tipo === "fala" && !b.sujeito_id && !b.falante_nome) patch.sujeito_id = s.id;
    updateBloco(i, patch);
  }
  function onMentionAvulso(i: number, nome: string) {
    const b = form.roteiro[i];
    const mencoes = b.mencoes ?? [];
    const jaTem = mencoes.some((m) => m.nome === nome && m.sujeito_id === "");
    const patch: Partial<CenaBloco> = {
      mencoes: jaTem ? mencoes : [...mencoes, { nome, sujeito_id: "" }],
    };
    if (b.tipo === "fala" && !b.sujeito_id && !b.falante_nome) patch.falante_nome = nome;
    updateBloco(i, patch);
  }

  function addRodada() {
    set("urgencia_rodadas", [...form.urgencia_rodadas, ""]);
  }
  function updateRodada(i: number, v: string) {
    const arr = [...form.urgencia_rodadas];
    arr[i] = v;
    set("urgencia_rodadas", arr);
  }
  function removeRodada(i: number) {
    set("urgencia_rodadas", form.urgencia_rodadas.filter((_, idx) => idx !== i));
  }

  const tipoAtual = TIPOS.find((tipo) => tipo.value === form.tipo);
  const selectedLugar = form.lugar_id ? lugares.find((lugar) => lugar.id === form.lugar_id) : undefined;
  const roteiroPreenchido = form.roteiro.filter((bloco) => bloco.texto.trim()).length;

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="border border-border bg-card p-5">
          <SectionTitle
            icon={<ScrollText className="h-4 w-4" />}
            title="Ficha da cena"
            description="Defina onde a cena entra na sessão, o tipo de desafio e como ela aparece no roteiro."
          />
          <div className="mt-5 space-y-5">
            <Field label="Título da cena">
              <Input
                value={form.titulo}
                onChange={(e) => set("titulo", e.target.value)}
                required
                placeholder="Ex: A chegada na delegacia"
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-[1fr_180px_120px]">
              <Field label="Parte ou ato">
                <Input
                  value={form.parte ?? ""}
                  onChange={(e) => set("parte", e.target.value || null)}
                  placeholder="Ex: Parte 1 - Investigação"
                />
              </Field>
              <Field label="Tipo">
                <Select value={form.tipo} onValueChange={(v) => set("tipo", v as SceneTipo)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {TIPOS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Ordem">
                <Input
                  type="number" min={0}
                  value={form.ordem}
                  onChange={(e) => set("ordem", Number(e.target.value))}
                />
              </Field>
            </div>

            {tipoAtual && (
              <div className="border border-border bg-muted/25 px-3 py-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{tipoAtual.label}:</span> {tipoAtual.hint}.
              </div>
            )}
          </div>
        </section>

        <section className="border border-border bg-card p-5">
          <SectionTitle
            icon={<BookOpen className="h-4 w-4" />}
            title="Texto para os jogadores"
            description="Este é o bloco narrável da cena: leia, adapte ou use como abertura do momento."
          />
          <div className="mt-5">
            <Field label="Descrição narrável">
              <Textarea
                value={form.texto_descritivo ?? ""}
                onChange={(e) => set("texto_descritivo", e.target.value || null)}
                placeholder="Texto lido em voz alta. Descreva o que os agentes veem, ouvem, sentem e qual tensão está no ar..."
                rows={8}
              />
            </Field>
          </div>
        </section>

        <section className="border border-border bg-card p-5">
          <SectionTitle
            icon={<MessageSquare className="h-4 w-4" />}
            title="Roteiro da cena"
            description="Monte narrações e falas em ordem. Digite @ para mencionar sujeitos e atribuir falantes."
          />

          <div className="mt-5 space-y-4">
            {form.roteiro.length === 0 ? (
              <div className="border border-dashed border-border py-10 text-center">
                <p className="text-sm font-medium">Nenhum bloco de roteiro.</p>
                <p className="mt-1 text-xs text-muted-foreground">Adicione narração ou fala para conduzir esta cena na mesa.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {form.roteiro.map((b, i) => {
                  const falante = b.sujeito_id ? sujeitos.find((s) => s.id === b.sujeito_id) : undefined;
                  return (
                    <div key={i} className="space-y-3 border border-border bg-background p-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center border border-border bg-muted font-mono text-[10px] text-muted-foreground">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium uppercase tracking-wider ${b.tipo === "fala" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {b.tipo === "fala" ? <MessageSquare className="h-3 w-3" /> : <Text className="h-3 w-3" />}
                          {b.tipo === "fala" ? "Fala" : "Narração"}
                        </span>
                        {b.tipo === "fala" && (
                          falante || b.falante_nome ? (
                            <span className="flex items-center gap-1.5 text-xs">
                              <span className="flex h-6 w-6 items-center justify-center overflow-hidden border border-border bg-muted">
                                {falante?.image_url ? (
                                  <Image src={falante.image_url} alt="" width={24} height={24} className="h-full w-full object-cover" unoptimized />
                                ) : (
                                  <UserRound className="h-3 w-3 text-muted-foreground/50" />
                                )}
                              </span>
                              <span className="font-medium">{falante?.name ?? b.falante_nome}</span>
                              {!falante && <span className="text-[10px] text-muted-foreground">(avulso)</span>}
                              <button type="button" onClick={() => updateBloco(i, { sujeito_id: null, falante_nome: null })} className="text-muted-foreground hover:text-destructive">
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">Falante: use @ no texto</span>
                          )
                        )}
                        <div className="ml-auto flex items-center gap-0.5">
                          <button type="button" onClick={() => moveBloco(i, -1)} disabled={i === 0} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
                          <button type="button" onClick={() => moveBloco(i, 1)} disabled={i === form.roteiro.length - 1} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
                          <button type="button" onClick={() => removeBloco(i)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                      <MentionTextarea
                        value={b.texto}
                        onChange={(v) => updateBloco(i, { texto: v })}
                        onMention={(s) => onMention(i, s)}
                        onMentionAvulso={(nome) => onMentionAvulso(i, nome)}
                        sujeitos={sujeitos}
                        rows={b.tipo === "fala" ? 2 : 3}
                        placeholder={b.tipo === "fala" ? "A fala do personagem... (@ menciona)" : "O que acontece / descrição... (@ menciona)"}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => addBloco("narracao")}>
                <Text className="mr-1 h-3.5 w-3.5" /> Narração
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => addBloco("fala")}>
                <MessageSquare className="mr-1 h-3.5 w-3.5" /> Fala
              </Button>
            </div>
          </div>
        </section>

        <section className="border border-border bg-card p-5">
          <SectionTitle
            icon={<Settings2 className="h-4 w-4" />}
            title="Mecânicas da cena"
            description="Vincule lugares, pistas, testes e pressão de tempo para conduzir a cena durante a sessão."
          />

          <div className="mt-5 space-y-5">
            <Field label="Lugar vinculado">
              <Select
                value={form.lugar_id ?? NENHUM_LUGAR}
                onValueChange={(v) => set("lugar_id", v === NENHUM_LUGAR ? null : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value={NENHUM_LUGAR} className="text-muted-foreground">Nenhum</SelectItem>
                  {lugares.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="h-3 w-3" />
                Pontos de interesse e testes do lugar aparecem dentro da cena.
              </p>
            </Field>

            {isInvestigacao && (
              <div className="space-y-3 border border-amber-500/30 bg-amber-500/[0.04] p-4">
                <label className="flex cursor-pointer select-none items-center justify-between gap-4">
                  <span>
                    <span className="flex items-center gap-2 text-sm font-medium text-amber-700">
                      <Clock className="h-4 w-4" />
                      Investigação com urgência
                    </span>
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      Use quando a situação piora a cada rodada, turno ou cena.
                    </span>
                  </span>
                  <Switch checked={form.urgencia} onCheckedChange={(v) => set("urgencia", v)} />
                </label>

                {form.urgencia && (
                  <div className="space-y-2">
                    {form.urgencia_rodadas.map((r, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="mt-2 w-8 shrink-0 font-mono text-[10px] font-semibold text-amber-700">R{i + 1}</span>
                        <Textarea
                          className="text-sm"
                          rows={2}
                          placeholder={`O que acontece na rodada ${i + 1}...`}
                          value={r}
                          onChange={(e) => updateRodada(i, e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => removeRodada(i)}
                          className="mt-2 shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addRodada}>
                      <PlusIcon className="mr-1 h-3.5 w-3.5" /> Rodada
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="border border-border bg-card p-5">
          <SectionTitle
            icon={<FileText className="h-4 w-4" />}
            title="Notas do mestre"
            description="Segredos, consequências, alternativas, gatilhos de NPCs e lembretes internos."
          />
          <div className="mt-5">
            <Field label="Notas internas">
              <Textarea
                value={form.notas_mestre ?? ""}
                onChange={(e) => set("notas_mestre", e.target.value || null)}
                placeholder="Informações para o narrador: alternativas, gatilhos, mecânicas, NPCs presentes..."
                rows={6}
              />
            </Field>
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <div className="sticky top-6 space-y-4">
          <div className="border border-primary/30 bg-primary/5 p-4">
            <BookOpen className="mb-3 h-5 w-5 text-primary" />
            <p className="text-sm font-semibold">Cena pronta para mesa</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Uma boa cena deixa claro: onde acontece, o que os jogadores percebem, quais falas ou eventos conduzem o momento e o que o mestre precisa lembrar.
            </p>
          </div>

          <div className="border border-border bg-card p-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Resumo</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Tipo</span>
                <span className="font-medium">{tipoAtual?.label ?? "Cena"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Roteiro</span>
                <span className="font-medium">{roteiroPreenchido}/{form.roteiro.length}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Lugar</span>
                <span className="max-w-36 truncate font-medium">{selectedLugar?.name ?? "Nenhum"}</span>
              </div>
            </div>
          </div>

          <div className="border border-border bg-card p-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Checklist</p>
            <div className="mt-3 space-y-2 text-sm">
              <Check done={Boolean(form.titulo)} label="Título definido" />
              <Check done={Boolean(form.texto_descritivo)} label="Texto narrável" />
              <Check done={form.roteiro.length > 0} label="Roteiro em blocos" />
              <Check done={!isInvestigacao || !form.urgencia || form.urgencia_rodadas.length > 0} label="Urgência resolvida" />
              <Check done={Boolean(form.notas_mestre)} label="Notas internas" />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar cena"}
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

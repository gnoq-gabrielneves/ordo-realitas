"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { useLugares } from "@/features/lugares/hooks/useLugares";
import { useSujeitos } from "@/features/sujeitos/hooks/useSujeitos";
import { MentionTextarea } from "@/features/campanhas/components/MentionTextarea";
import { CenaBloco, CenaPayload, SceneTipo } from "@/shared/types/campaign";
import { Npc } from "@/shared/types/npc";
import { ChevronDown, ChevronUp, Clock, MapPin, MessageSquare, PlusIcon, Text, Trash2, UserRound, X } from "lucide-react";
import { useState } from "react";

const NENHUM_LUGAR = "__none__";

const TIPOS: { value: SceneTipo; label: string }[] = [
  { value: "narrativa", label: "Narrativa" },
  { value: "investigacao", label: "Investigação" },
  { value: "combate", label: "Combate" },
  { value: "social", label: "Social" },
  { value: "interludio", label: "Interlúdio" },
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
    if (b.tipo === "fala" && !b.sujeito_id) patch.sujeito_id = s.id;
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

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Field label="Título da Cena">
            <Input
              value={form.titulo}
              onChange={(e) => set("titulo", e.target.value)}
              required
              placeholder="Ex: A Chegada na Delegacia"
            />
          </Field>
        </div>
        <Field label="Parte">
          <Input
            value={form.parte ?? ""}
            onChange={(e) => set("parte", e.target.value || null)}
            placeholder="Ex: Parte 1 – Investigação"
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

      <Field label="Texto Descritivo">
        <Textarea
          value={form.texto_descritivo ?? ""}
          onChange={(e) => set("texto_descritivo", e.target.value || null)}
          placeholder="Texto lido em voz alta para os jogadores. Descreva o que os agentes veem, ouvem e sentem..."
          rows={8}
        />
      </Field>

      {/* Roteiro — blocos de narração e fala com menção @ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Roteiro <span className="text-muted-foreground font-normal">· narração e diálogos · digite @ para mencionar um sujeito</span></Label>
        </div>

        {form.roteiro.length > 0 && (
          <div className="space-y-2">
            {form.roteiro.map((b, i) => {
              const falante = b.sujeito_id ? sujeitos.find((s) => s.id === b.sujeito_id) : undefined;
              return (
                <div key={i} className="rounded-md border border-border p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded ${b.tipo === "fala" ? "text-primary bg-primary/10" : "text-muted-foreground bg-muted"}`}>
                      {b.tipo === "fala" ? <MessageSquare className="h-3 w-3" /> : <Text className="h-3 w-3" />}
                      {b.tipo === "fala" ? "Fala" : "Narração"}
                    </span>
                    {b.tipo === "fala" && (
                      falante ? (
                        <span className="flex items-center gap-1.5 text-xs">
                          <span className="h-5 w-5 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center">
                            {falante.image_url ? <img src={falante.image_url} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-3 w-3 text-muted-foreground/50" />}
                          </span>
                          <span className="font-medium">{falante.name}</span>
                          <button type="button" onClick={() => updateBloco(i, { sujeito_id: null })} className="text-muted-foreground hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Falante: digite <strong>@</strong> no texto</span>
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
                    sujeitos={sujeitos}
                    rows={b.tipo === "fala" ? 2 : 3}
                    placeholder={b.tipo === "fala" ? "A fala do personagem... (@ menciona)" : "O que acontece / descrição... (@ menciona)"}
                  />
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => addBloco("narracao")}>
            <Text className="h-3.5 w-3.5 mr-1" /> Narração
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => addBloco("fala")}>
            <MessageSquare className="h-3.5 w-3.5 mr-1" /> Fala
          </Button>
        </div>
      </div>

      {/* Lugar vinculado */}
      <Field label="Lugar vinculado">
        <Select
          value={form.lugar_id ?? NENHUM_LUGAR}
          onValueChange={(v) => set("lugar_id", v === NENHUM_LUGAR ? null : v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Nenhum" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value={NENHUM_LUGAR} className="text-muted-foreground">— Nenhum —</SelectItem>
            {lugares.map((l) => (
              <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          Os pontos de interesse e testes do lugar aparecem dentro da cena.
        </p>
      </Field>

      {/* Urgência — só para investigação */}
      {isInvestigacao && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/[0.04] p-4 space-y-3">
          <label className="flex items-center justify-between cursor-pointer select-none">
            <span className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
              Investigação com urgência
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={form.urgencia}
              onClick={() => set("urgencia", !form.urgencia)}
              className={`relative h-5 w-9 rounded-full transition-colors ${form.urgencia ? "bg-amber-500" : "bg-muted"}`}
            >
              <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.urgencia ? "translate-x-4" : "translate-x-0"}`} />
            </button>
          </label>

          {form.urgencia && (
            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground">
                Descreva o que acontece a cada rodada que passa enquanto os agentes investigam.
              </p>
              {form.urgencia_rodadas.map((r, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="shrink-0 mt-2 text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-400 w-8">R{i + 1}</span>
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
                    className="shrink-0 mt-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addRodada}>
                <PlusIcon className="h-3.5 w-3.5 mr-1" /> Rodada
              </Button>
            </div>
          )}
        </div>
      )}

      <Field label="Notas do Mestre">
        <Textarea
          value={form.notas_mestre ?? ""}
          onChange={(e) => set("notas_mestre", e.target.value || null)}
          placeholder="Informações para o narrador: alternativas, gatilhos, mecânicas, NPCs presentes..."
          rows={5}
        />
      </Field>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar Cena"}
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

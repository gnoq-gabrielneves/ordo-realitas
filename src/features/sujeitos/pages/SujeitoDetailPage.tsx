"use client";

import { useDeleteSujeito, useSujeito, useUpdateSujeito } from "@/features/sujeitos/hooks/useSujeitos";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { NpcAcaoTipo } from "@/shared/types/npc";
import { cn } from "@/shared/lib/utils";
import {
  ArrowDown, ArrowLeft, ArrowUp, Eye, Gauge, Heart, Pencil, RotateCcw, Shield, Skull, Sparkles, Trash2, Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const origemLabel: Record<string, string> = {
  sangue: "Sangue", morte: "Morte", medo: "Medo",
  conhecimento: "Conhecimento", energia: "Energia",
};

const acaoTipoLabel: Record<NpcAcaoTipo, string> = {
  padrao: "Padrão", movimento: "Movimento", livre: "Livre",
  completa: "Completa", reacao: "Reação",
};

interface SujeitoDetailPageProps {
  id: string;
}

export function SujeitoDetailPage({ id }: SujeitoDetailPageProps) {
  const router = useRouter();
  const { data: sujeito, isLoading, isError } = useSujeito(id);
  const { mutate: deletar, isPending: deleting } = useDeleteSujeito();
  const update = useUpdateSujeito(id);
  const [pvOpt, setPvOpt] = useState<number | null>(null);
  useEffect(() => setPvOpt(null), [id]);

  function handleDelete() {
    deletar(id, { onSuccess: () => router.push("/sujeitos") });
  }

  if (isLoading) return (
    <>
      <AppHeader title="Sujeito" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-5 w-64 bg-muted animate-pulse rounded-sm" />
          ))}
        </div>
      </main>
    </>
  );

  if (isError || !sujeito) return (
    <>
      <AppHeader title="Sujeito" />
      <main className="flex-1 overflow-y-auto p-6">
        <p className="text-sm text-destructive">Sujeito não encontrado nos arquivos.</p>
      </main>
    </>
  );

  const machucado = sujeito.pv ? Math.floor(sujeito.pv / 2) : null;
  const temSaves = sujeito.fortitude || sujeito.reflexos || sujeito.vontade || sujeito.deslocamento;

  const pvMax = sujeito.pv;
  const pvAtual = pvOpt ?? sujeito.pv_atual ?? sujeito.pv ?? 0;

  const adjustPv = (delta: number) => {
    if (pvMax == null) return;
    const cur = pvOpt ?? sujeito.pv_atual ?? pvMax;
    const next = Math.max(0, Math.min(pvMax, cur + delta));
    if (next === cur) return;
    setPvOpt(next);
    update.mutate({ pv_atual: next });
    toast(`PV  ${cur} → ${next}`, {
      description: delta > 0 ? `Recuperou +${delta} PV` : `Perdeu ${Math.abs(delta)} PV`,
      icon: delta > 0 ? <ArrowUp className="size-4 text-emerald-500" /> : <ArrowDown className="size-4 text-red-500" />,
    });
  };

  const resetPv = () => {
    if (pvMax == null) return;
    setPvOpt(pvMax);
    update.mutate({ pv_atual: pvMax });
    toast.success("PV restaurado", { description: `PV ${pvMax} / ${pvMax}` });
  };

  return (
    <>
      <AppHeader title={sujeito.name} />
      <main className="flex-1 overflow-y-auto p-6">

        {/* navegação */}
        <Link
          href="/sujeitos"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para Sujeitos
        </Link>

        {/* cabeçalho do sujeito */}
        <div className="flex items-start justify-between gap-4 mb-8 pb-6 border-b border-border">
          <div className="flex items-start gap-4">
            {sujeito.image_url && (
              <div className="relative h-24 w-24 shrink-0 rounded-md border-2 border-border overflow-hidden shadow-sm">
                <Image src={sujeito.image_url} alt={sujeito.name} fill className="object-cover" />
              </div>
            )}
            <div className="pt-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">{sujeito.name}</h1>
                {sujeito.vd != null && (
                  <span className="text-xs font-semibold text-amber-500 border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 rounded">
                    VD {sujeito.vd}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                {sujeito.tipo && (
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                    {sujeito.tipo}
                  </Badge>
                )}
                {sujeito.tamanho && (
                  <span className="text-[11px] text-muted-foreground capitalize px-2 py-0.5 border border-border rounded">{sujeito.tamanho}</span>
                )}
                {sujeito.origem && (
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-primary border-primary/30">
                    {origemLabel[sujeito.origem]}
                  </Badge>
                )}
                {sujeito.percepcao_as_cegas && (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Eye className="h-3 w-3" /> Percepção às Cegas
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button asChild variant="outline" size="sm">
              <Link href={`/sujeitos/${id}/editar`}>
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Link>
            </Button>
            <ConfirmDialog
              title="Remover sujeito"
              description="Este sujeito será removido permanentemente dos arquivos da Ordo. Esta ação não pode ser desfeita."
              onConfirm={handleDelete}
              disabled={deleting}
            >
              <Button variant="outline" size="sm"
                className="text-destructive hover:text-destructive hover:border-destructive/40">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </ConfirmDialog>
          </div>
        </div>

        <Tabs defaultValue="ficha">
          <TabsList className="mb-6">
            <TabsTrigger value="ficha">Ficha</TabsTrigger>
            {(sujeito.habilidades.length > 0 || sujeito.acoes.length > 0) && (
              <TabsTrigger value="combate">Combate</TabsTrigger>
            )}
            {sujeito.rituais.length > 0 && (
              <TabsTrigger value="rituais">Rituais</TabsTrigger>
            )}
            {(sujeito.descricao || sujeito.backstory) && (
              <TabsTrigger value="backstory">Backstory</TabsTrigger>
            )}
          </TabsList>

          {/* FICHA */}
          <TabsContent value="ficha" className="space-y-7">

            {/* Stats de destaque: Defesa + PV */}
            {(sujeito.defesa != null || sujeito.pv != null) && (
              <div className="grid grid-cols-2 gap-4">
                <KeyStat
                  icon={<Shield className="h-5 w-5" />}
                  label="Defesa"
                  value={sujeito.defesa != null ? String(sujeito.defesa) : "—"}
                  accent="blue"
                />
                {pvMax != null ? (
                  <KeyStat
                    icon={<Heart className="h-5 w-5" />}
                    label="Pontos de Vida"
                    value={`${pvAtual} / ${pvMax}`}
                    hint={machucado != null ? `Machucado ${machucado}` : undefined}
                    accent="red"
                    bar={{ atual: pvAtual, max: pvMax, color: "bg-red-500" }}
                    onAdjust={adjustPv}
                    onReset={pvAtual !== pvMax ? resetPv : undefined}
                  />
                ) : (
                  <KeyStat icon={<Heart className="h-5 w-5" />} label="Pontos de Vida" value="—" accent="red" />
                )}
              </div>
            )}

            {/* Presença Perturbadora — criaturas */}
            {(sujeito.pp_dt || sujeito.pp_dano || sujeito.pp_imune_nex) && (
              <div className="rounded-md border border-purple-500/30 bg-purple-500/[0.06] p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-purple-400 mb-2">
                  <Skull className="h-3.5 w-3.5" /> Presença Perturbadora
                </p>
                <div className="flex items-center gap-4 flex-wrap text-sm">
                  {sujeito.pp_dt && <span className="text-muted-foreground">DT <strong className="text-foreground font-semibold">{sujeito.pp_dt}</strong></span>}
                  {sujeito.pp_dano && <span className="font-semibold text-foreground">{sujeito.pp_dano}</span>}
                  {sujeito.pp_imune_nex && <span className="text-muted-foreground">NEX <strong className="text-foreground font-semibold">{sujeito.pp_imune_nex}</strong> é imune</span>}
                </div>
              </div>
            )}

            {/* Sentidos + Deslocamento + Saves em uma faixa de mini-stats */}
            {(sujeito.percepcao || sujeito.iniciativa || temSaves) && (
              <Section title="Testes & Sentidos" icon={<Eye className="h-3.5 w-3.5" />}>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {sujeito.percepcao && <MiniStat label="Percepção" value={sujeito.percepcao} />}
                  {sujeito.iniciativa && <MiniStat label="Iniciativa" value={sujeito.iniciativa} />}
                  {sujeito.fortitude && <MiniStat label="Fortitude" value={sujeito.fortitude} />}
                  {sujeito.reflexos && <MiniStat label="Reflexos" value={sujeito.reflexos} />}
                  {sujeito.vontade && <MiniStat label="Vontade" value={sujeito.vontade} />}
                  {sujeito.deslocamento && <MiniStat label="Deslocamento" value={sujeito.deslocamento} icon={<Gauge className="h-3 w-3" />} />}
                </div>
              </Section>
            )}

            {/* atributos */}
            {(sujeito.agi != null || sujeito.atrib_for != null || sujeito.atrib_int != null || sujeito.pre != null || sujeito.vig != null) && (
              <Section title="Atributos" icon={<Zap className="h-3.5 w-3.5" />}>
                <div className="grid grid-cols-5 gap-2 sm:gap-3 sm:flex sm:flex-wrap">
                  {sujeito.agi != null && <AttrBox label="AGI" value={sujeito.agi} />}
                  {sujeito.atrib_for != null && <AttrBox label="FOR" value={sujeito.atrib_for} />}
                  {sujeito.atrib_int != null && <AttrBox label="INT" value={sujeito.atrib_int} />}
                  {sujeito.pre != null && <AttrBox label="PRE" value={sujeito.pre} />}
                  {sujeito.vig != null && <AttrBox label="VIG" value={sujeito.vig} />}
                </div>
              </Section>
            )}

            {/* perícias */}
            {sujeito.pericias.length > 0 && (
              <Section title="Perícias" icon={<Sparkles className="h-3.5 w-3.5" />}>
                <div className="flex flex-wrap gap-2">
                  {sujeito.pericias.map((p, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 text-xs border border-border rounded-md px-2.5 py-1 bg-muted/30">
                      <span className="text-foreground">{p.nome}</span>
                      <span className="font-mono font-semibold text-primary">{p.bonus}</span>
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* resistências e vulnerabilidades */}
            {(sujeito.resistencias.length > 0 || sujeito.vulnerabilidades.length > 0) && (
              <Section title="Resistências & Vulnerabilidades" icon={<Shield className="h-3.5 w-3.5" />}>
                <div className="space-y-3">
                  {sujeito.resistencias.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Resistências</p>
                      <div className="flex flex-wrap gap-2">
                        {sujeito.resistencias.map((r, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 text-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 rounded-md px-2.5 py-1">
                            {r.tipo} <span className="font-mono font-semibold">{r.valor}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {sujeito.vulnerabilidades.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Vulnerabilidades</p>
                      <div className="flex flex-wrap gap-2">
                        {sujeito.vulnerabilidades.map((v, i) => (
                          <span key={i} className="text-xs border border-red-500/30 bg-red-500/10 text-red-400 rounded-md px-2.5 py-1">
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            )}
          </TabsContent>

          {/* COMBATE */}
          <TabsContent value="combate" className="space-y-7">
            {sujeito.habilidades.length > 0 && (
              <Section title="Habilidades Especiais" icon={<Sparkles className="h-3.5 w-3.5" />}>
                <div className="divide-y divide-border/60">
                  {sujeito.habilidades.map((h, i) => (
                    <div key={i} className={cn(i === 0 ? "pb-3" : "py-3", i === sujeito.habilidades.length - 1 && "pb-0")}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold uppercase tracking-wider text-foreground">{h.nome}</p>
                        {h.acao && (
                          <span className="text-[10px] font-medium uppercase tracking-widest text-primary border border-primary/30 rounded px-1.5 py-0.5">{h.acao}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{h.descricao}</p>
                      {h.resistencia && (
                        <p className="text-[11px] text-muted-foreground mt-1.5">
                          <span className="uppercase tracking-wider text-muted-foreground/70 mr-1.5">Evita</span>
                          <span className="text-foreground font-medium">{h.resistencia}{h.resistencia_dt ? ` DT ${h.resistencia_dt}` : ""}</span>
                        </p>
                      )}
                      {(h.opcoes ?? []).length > 0 && (
                        <div className="mt-2 space-y-1.5">
                          {(h.opcoes ?? []).map((o, oi) => (
                            <div key={oi} className="rounded border border-border/60 bg-muted/20 px-2.5 py-1.5">
                              {o.titulo && <span className="text-xs font-semibold text-primary/90">{o.titulo}</span>}
                              {o.texto && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{o.texto}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {sujeito.acoes.length > 0 && (
              <Section title="Ações" icon={<Zap className="h-3.5 w-3.5" />}>
                <div className="space-y-3">
                  {sujeito.acoes.map((a, i) => (
                    <div key={i} className="border-l-2 border-primary/40 pl-3 py-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-medium uppercase tracking-widest text-primary border border-primary/30 rounded px-1.5 py-0.5">
                          {acaoTipoLabel[a.tipo]}
                        </span>
                        <span className="text-sm font-semibold text-foreground">{a.nome}</span>
                        {a.quantidade != null && a.quantidade > 1 && (
                          <span className="text-[11px] font-semibold text-primary border border-primary/30 bg-primary/10 rounded px-1.5 py-0.5">×{a.quantidade} ataques</span>
                        )}
                      </div>
                      {a.descricao && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{a.descricao}</p>}
                      {(a.teste || a.dano || a.critico) && (
                        <div className="flex gap-4 mt-1.5 flex-wrap">
                          {a.teste && <span className="text-xs text-muted-foreground">Teste <strong className="text-foreground font-medium">{a.teste}</strong></span>}
                          {a.dano && <span className="text-xs text-muted-foreground">Dano <strong className="text-foreground font-medium">{a.dano}</strong></span>}
                          {a.critico && <span className="text-xs text-muted-foreground">Crítico <strong className="text-foreground font-medium">{a.critico}</strong></span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

          </TabsContent>

          {/* RITUAIS */}
          <TabsContent value="rituais" className="space-y-3">
            {sujeito.rituais.map((r, i) => (
              <div key={i} className="rounded-md border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-2 flex-wrap border-b border-border bg-muted/30 px-4 py-2.5">
                  <span className="text-sm font-semibold text-foreground">{r.nome}</span>
                  {r.elemento && (
                    <span className={cn("text-[10px] uppercase tracking-wider border rounded px-1.5 py-0.5", ELEMENTO_COR[r.elemento.toLowerCase()] ?? "border-primary/30 text-primary")}>
                      {r.elemento}
                    </span>
                  )}
                  <span className="ml-auto flex items-center gap-2.5 text-[11px] text-muted-foreground">
                    {r.grau && <span>{r.grau}</span>}
                    {r.custo_pe != null && <span className="font-medium text-foreground/70">{r.custo_pe} PE</span>}
                    {r.dt && <span>DT {r.dt}</span>}
                  </span>
                </div>
                {r.descricao && (
                  <div className="px-4 py-3">
                    <RitualDescricao descricao={r.descricao} />
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          {/* BACKSTORY */}
          <TabsContent value="backstory" className="space-y-7">
            {sujeito.descricao && (
              <Section title="Descrição / Aparência">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{sujeito.descricao}</p>
              </Section>
            )}
            {sujeito.backstory && (
              <Section title="Backstory">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{sujeito.backstory}</p>
              </Section>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}

const ELEMENTO_COR: Record<string, string> = {
  conhecimento: "border-blue-500/40 text-blue-400",
  energia: "border-yellow-500/40 text-yellow-400",
  morte: "border-purple-500/40 text-purple-400",
  sangue: "border-red-500/40 text-red-400",
  medo: "border-orange-500/40 text-orange-400",
};

function RitualDescricao({ descricao }: { descricao: string }) {
  const parts = descricao.split(/(?=↑\s)/);
  const base = parts[0].trim();
  const upgrades = parts.slice(1).map((p) => {
    const m = p.match(/^↑\s*(.+?):\s*([\s\S]+)$/);
    return m ? { titulo: m[1].trim(), texto: m[2].trim() } : { titulo: "", texto: p.replace(/^↑\s*/, "").trim() };
  });
  const cor = (t: string) =>
    t.toLowerCase().startsWith("verdadeiro") ? "border-primary/40 text-primary/90" : "border-border/60 text-muted-foreground";
  return (
    <div className="space-y-2">
      {base && <p className="text-sm text-foreground/80 leading-relaxed">{base}</p>}
      {upgrades.map((u, i) => (
        <div key={i} className={cn("border-l-2 pl-3 py-0.5", cor(u.titulo))}>
          <span className="text-[11px] font-semibold uppercase tracking-wide mr-2">↑ {u.titulo}</span>
          <span className="text-sm leading-relaxed">{u.texto}</span>
        </div>
      ))}
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
        {icon}{title}
      </p>
      <div className="border border-border bg-card rounded-md p-4">{children}</div>
    </div>
  );
}

const ACCENTS = {
  blue: "border-blue-500/30 text-blue-400",
  red: "border-red-500/30 text-red-400",
};

const QUICK_STEPS = [-5, -1, 1, 5];

function KeyStat({ icon, label, value, hint, accent, bar, onAdjust, onReset }: {
  icon: React.ReactNode; label: string; value: string; hint?: string; accent: keyof typeof ACCENTS;
  bar?: { atual: number; max: number; color: string }; onAdjust?: (delta: number) => void; onReset?: () => void;
}) {
  const pct = bar && bar.max > 0 ? Math.min(100, (bar.atual / bar.max) * 100) : 0;
  return (
    <div className={cn("rounded-md border bg-card p-4", ACCENTS[accent])}>
      <div className="flex items-center gap-4">
        <div className="shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            {label}
            {onReset && (
              <button type="button" onClick={onReset} title="Restaurar PV" className="text-muted-foreground hover:text-foreground transition-colors">
                <RotateCcw className="h-3 w-3" />
              </button>
            )}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold leading-none text-foreground tabular-nums">{value}</p>
            {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
          </div>
        </div>
      </div>
      {bar && (
        <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all", bar.color)} style={{ width: `${pct}%` }} />
        </div>
      )}
      {onAdjust && (
        <div className="mt-2.5 grid grid-cols-4 gap-1">
          {QUICK_STEPS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onAdjust(d)}
              className={cn(
                "h-7 rounded text-xs font-medium tabular-nums border transition-colors",
                d < 0
                  ? "border-border text-muted-foreground hover:border-destructive/50 hover:text-destructive hover:bg-destructive/5"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-primary/5"
              )}
            >
              {d > 0 ? `+${d}` : d}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-muted/20 px-3 py-2">
      <p className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-muted-foreground">{icon}{label}</p>
      <p className="text-sm font-semibold text-foreground mt-0.5 font-mono">{value}</p>
    </div>
  );
}

function AttrBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center justify-center border border-border rounded-md bg-muted/20 py-2.5 sm:w-16">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground leading-none mt-1">{value}</p>
    </div>
  );
}

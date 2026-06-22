"use client";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useAgente, useDeleteAgente, useUpdateAgente } from "@/features/agentes/hooks/useAgentes";
import { useItens } from "@/features/itens/hooks/useItens";
import { useRituais } from "@/features/rituais/hooks/useRituais";
import { ELEMENTO_BADGE, ELEMENTO_LABELS } from "@/shared/constants/elements";
import { DESERTOR_REGRAS, FORMA_SUPREMA, getEstigmas } from "@/shared/constants/hexatombe";
import { PERICIAS } from "@/shared/constants/pericias";
import { cn } from "@/shared/lib/utils";
import { AgentPericiaEntry, AgentSheet, GrauPericia } from "@/shared/types/agent";
import { Item } from "@/shared/types/item";
import { RitualElemento } from "@/shared/types/ritual";
import { deriveFormaSuprema, shouldDeriveFormaSuprema } from "@/shared/utils/agentCalc";
import {
  ArrowLeft,
  BookOpenCheck,
  Gauge,
  Heart,
  NotebookText,
  Package,
  Pencil,
  Shield,
  Skull,
  Sparkles,
  Swords,
  Trash2,
  UserRound,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useMemo, useState } from "react";
import { toast } from "sonner";

const RESOURCE_STEPS = [-5, -1, 1, 5];
const GRAU_BONUS = [0, 5, 10, 15] as const;
const GRAU_LABELS = ["Leigo", "Treinado", "Veterano", "Expert"] as const;

function Section({ title, description, icon, children }: { title: string; description?: string; icon: ReactNode; children: ReactNode }) {
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

function Tag({ children, danger }: { children: ReactNode; danger?: boolean }) {
  return (
    <span className={cn(
      "border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
      danger ? "border-red-500/35 bg-red-500/10 text-red-500" : "border-border bg-background text-muted-foreground",
    )}>
      {children}
    </span>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon,
  tone = "default",
  onAdjust,
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon: ReactNode;
  tone?: "default" | "red" | "amber" | "cyan";
  onAdjust?: (delta: number) => void;
}) {
  return (
    <div className={cn(
      "border bg-background p-4",
      tone === "red" && "border-red-500/30 bg-red-500/[0.03]",
      tone === "amber" && "border-amber-500/35 bg-amber-500/[0.04]",
      tone === "cyan" && "border-cyan-500/35 bg-cyan-500/[0.04]",
      tone === "default" && "border-border",
    )}>
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{icon}{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
      {onAdjust && (
        <div className="mt-4 grid grid-cols-4 gap-1">
          {RESOURCE_STEPS.map((delta) => (
            <button
              key={delta}
              type="button"
              onClick={() => onAdjust(delta)}
              className="h-7 border border-border text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              {delta > 0 ? `+${delta}` : delta}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function getGrau(entry?: AgentPericiaEntry): GrauPericia {
  if (!entry) return 0;
  if (entry.grau !== undefined) return entry.grau;
  return entry.treinado ? 1 : 0;
}

function dicePool(attribute: number): string {
  return attribute <= 0 ? "2d20 pior" : `${attribute}d20`;
}

function itemDescription(item?: Item): string | null {
  if (!item) return null;
  if (item.categoria === "arma") {
    return [
      item.dano && `${item.dano} dano`,
      item.critico && `crítico ${item.critico}`,
      item.alcance && item.alcance !== "—" && `alcance ${item.alcance}`,
      item.especial && item.especial !== "—" && item.especial,
    ].filter(Boolean).join(" · ");
  }
  if (item.categoria === "protecao") {
    return [item.protecao_valor && `Defesa ${item.protecao_valor}`, item.penalidade].filter(Boolean).join(" · ");
  }
  return item.descricao ?? null;
}

interface AgentViewPageProps {
  agenteId: string;
}

export function AgentViewPage({ agenteId }: AgentViewPageProps) {
  const router = useRouter();
  const { data: agente, isLoading } = useAgente(agenteId);
  const { data: allItens = [] } = useItens();
  const { data: allRituais = [] } = useRituais();
  const update = useUpdateAgente();
  const del = useDeleteAgente();
  const [resourceDraft, setResourceDraft] = useState<Record<string, number>>({});

  const view = useMemo<AgentSheet | null>(() => {
    if (!agente) return null;
    if (agente.tipo === "hexatombe" && agente.forma_ativa) {
      const forma = shouldDeriveFormaSuprema(agente) ? deriveFormaSuprema(agente) : agente.forma_suprema;
      return forma ? { ...agente, ...forma } : agente;
    }
    return agente;
  }, [agente]);

  if (isLoading || !agente || !view) {
    return (
      <div className="grid h-full place-items-center">
        <p className="text-sm text-muted-foreground">Carregando ficha...</p>
      </div>
    );
  }

  const isHexa = agente.tipo === "hexatombe";
  const activeSuprema = isHexa && agente.forma_ativa;
  const estigmas = getEstigmas(agente.estigmas);
  const portraitUrl = activeSuprema && agente.intent_image_url ? agente.intent_image_url : agente.image_url;
  const defesa = 10 + view.agi + view.defesa_bonus + view.defesa_equip;
  const resourceKey = view.usa_pd ? "pd" : "pe";
  const resourceLabel = view.usa_pd ? "PD" : "PE";
  const resourceMax = view.usa_pd ? view.pd_max : view.pe_max;
  const resourceCurrent = resourceDraft[`${resourceKey}_atual`] ?? (view.usa_pd ? view.pd_atual : view.pe_atual);

  const updateResource = (key: "pv" | "pe" | "san" | "pd", delta: number) => {
    const currentKey = `${key}_atual`;
    const maxKey = `${key}_max`;
    const max = view[maxKey as keyof AgentSheet] as number;
    const current = resourceDraft[currentKey] ?? (view[currentKey as keyof AgentSheet] as number);
    const next = Math.max(0, Math.min(max || current + delta, current + delta));
    if (next === current) return;
    setResourceDraft((draft) => ({ ...draft, [currentKey]: next }));
    const currentForma = shouldDeriveFormaSuprema(agente) ? deriveFormaSuprema(agente) : agente.forma_suprema;
    const payload = activeSuprema && currentForma
      ? { forma_suprema: { ...currentForma, [currentKey]: next } }
      : { [currentKey]: next };
    update.mutate({ id: agente.id, payload });
    toast(`${key.toUpperCase()} ${current} -> ${next}`);
  };

  const spendCost = (cost?: number | null, name?: string) => {
    if (!cost) return;
    const current = resourceDraft[`${resourceKey}_atual`] ?? resourceCurrent;
    if (current < cost) {
      toast.error(`${resourceLabel} insuficiente`, { description: `${name ?? "Uso"} custa ${cost} ${resourceLabel}.` });
      return;
    }
    updateResource(resourceKey, -cost);
  };

  const importantSkills = PERICIAS
    .map((skill) => {
      const entry = view.pericias?.[skill.key];
      const grau = getGrau(entry);
      const fixedBonus = (GRAU_BONUS[grau] ?? 0) + (entry?.outros ?? 0);
      return { ...skill, grau, fixedBonus, roll: dicePool(view[skill.atributo.toLowerCase() === "for" ? "forca" : skill.atributo.toLowerCase() as keyof AgentSheet] as number) };
    })
    .filter((skill) => skill.grau > 0 || skill.fixedBonus !== 0)
    .slice(0, 12);

  return (
    <main className="h-full overflow-y-auto bg-background">
      <div className={cn("border-b border-border px-6 py-5", activeSuprema && "border-red-500/30 bg-red-500/[0.04]")}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link href="/agentes" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Voltar para agentes
          </Link>
          <div className="flex flex-wrap gap-2">
            {isHexa && (
              <Button
                variant={agente.forma_ativa ? "default" : "outline"}
                onClick={() => {
                  const activating = !agente.forma_ativa;
                  update.mutate({
                    id: agente.id,
                    payload: activating
                      ? {
                          forma_ativa: true,
                          forma_suprema: shouldDeriveFormaSuprema(agente) ? deriveFormaSuprema(agente) : agente.forma_suprema,
                        }
                      : { forma_ativa: false },
                  });
                }}
              >
                <Skull className="h-4 w-4" />
                {agente.forma_ativa ? "Intenção ativa" : "Ativar intenção"}
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href={`/agentes/${agente.id}/editar`}>
                <Pencil className="h-4 w-4" />
                Editar ficha
              </Link>
            </Button>
            <ConfirmDialog
              title="Excluir ficha"
              description={`Tem certeza que deseja excluir "${agente.nome || "esta ficha"}"?`}
              onConfirm={() => del.mutate(agente.id, { onSuccess: () => router.push("/agentes") })}
            >
              <Button variant="outline" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </ConfirmDialog>
          </div>
        </div>

        <section className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)_430px]">
          <div className={cn("relative aspect-square overflow-hidden border bg-muted", activeSuprema ? "border-red-500/40" : "border-border")}>
            {portraitUrl ? (
              <Image src={portraitUrl} alt={activeSuprema ? agente.codinome ?? agente.nome ?? "" : agente.nome ?? ""} fill className="object-cover" unoptimized />
            ) : (
              <div className="grid h-full place-items-center">
                {isHexa ? <Skull className="h-14 w-14 text-red-500/40" /> : <UserRound className="h-14 w-14 text-muted-foreground/35" />}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <Tag danger={isHexa}>{isHexa ? "Ficha Hexatombe" : "Ficha da Ordem"}</Tag>
              {activeSuprema && <Tag danger>Intenção Assassina</Tag>}
              {view.usa_pd && <Tag>Usa PD</Tag>}
              {estigmas.map((estigma) => <Tag key={estigma.id} danger>{estigma.nome}</Tag>)}
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">
              {activeSuprema && agente.codinome ? agente.codinome : agente.nome || "Agente sem nome"}
            </h1>
            {isHexa && agente.codinome && (
              <p className="mt-2 text-sm text-muted-foreground">
                {activeSuprema ? `Identidade civil: ${agente.nome || "não informada"}` : `Máscara: ${agente.codinome}`}
              </p>
            )}
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <Info label="Origem" value={agente.origem ?? "Não definida"} />
              <Info label="Classe" value={agente.classe ?? "Não definida"} />
              <Info label={agente.classe === "Sobrevivente" ? "Estágio" : "NEX"} value={agente.classe === "Sobrevivente" ? agente.nex : `${agente.nex}%`} />
              <Info label="Trilha" value={agente.trilha ?? "A definir"} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <StatCard icon={<Shield className="h-4 w-4" />} label="Defesa" value={defesa} detail="10 + AGI + bônus + equipamento" />
            <StatCard icon={<Heart className="h-4 w-4" />} label="Pontos de Vida" value={`${resourceDraft.pv_atual ?? view.pv_atual} / ${view.pv_max}`} tone="red" onAdjust={(delta) => updateResource("pv", delta)} />
            <StatCard icon={view.usa_pd ? <Sparkles className="h-4 w-4" /> : <Zap className="h-4 w-4" />} label={view.usa_pd ? "Determinação" : "Esforço"} value={`${resourceCurrent} / ${resourceMax}`} tone={view.usa_pd ? "amber" : "cyan"} onAdjust={(delta) => updateResource(resourceKey, delta)} />
            {!view.usa_pd && <StatCard icon={<Sparkles className="h-4 w-4" />} label="Sanidade" value={`${resourceDraft.san_atual ?? view.san_atual} / ${view.san_max}`} onAdjust={(delta) => updateResource("san", delta)} />}
          </div>
        </section>
      </div>

      <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          {activeSuprema && (
            <Section title="Intenção Assassina" icon={<Skull className="h-4 w-4" />} description="A ficha está usando os valores da Forma Suprema. Os efeitos abaixo ficam em destaque para uso rápido na mesa.">
              <div className="grid gap-2 md:grid-cols-2">
                {FORMA_SUPREMA.passivos.map((rule) => (
                  <p key={rule} className="border border-red-500/20 bg-red-500/[0.03] p-3 text-sm leading-relaxed text-muted-foreground">{rule}</p>
                ))}
              </div>
            </Section>
          )}

          <Section title="Rolagens principais" icon={<BookOpenCheck className="h-4 w-4" />} description="O atributo indica quantos d20 rolar. O bônus fixo vem de treinamento e modificadores.">
            {importantSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma perícia treinada ou modificada ainda.</p>
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {importantSkills.map((skill) => (
                  <div key={skill.key} className="flex items-center justify-between border border-border bg-background p-3">
                    <div>
                      <p className="font-semibold">{skill.nome}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{skill.atributo} · {skill.roll} · {GRAU_LABELS[skill.grau]}</p>
                    </div>
                    <p className="text-xl font-semibold tabular-nums">{skill.fixedBonus >= 0 ? `+${skill.fixedBonus}` : skill.fixedBonus}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Combate" icon={<Swords className="h-4 w-4" />}>
            <div className="grid gap-3 md:grid-cols-3">
              <Info label="Deslocamento" value={view.deslocamento} />
              <Info label={`${resourceLabel} por rodada`} value={agente.pe_por_rodada} />
              <Info label="Resistências" value={agente.resistencias ?? "Nenhuma"} />
            </div>
            {view.ataques.length > 0 && (
              <div className="mt-5 space-y-2">
                {view.ataques.map((attack, index) => (
                  <div key={`${attack.nome}-${index}`} className="border border-border bg-background p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{attack.nome}</p>
                      <span className="text-xs text-muted-foreground">{attack.teste}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {attack.dano && <span>Dano <strong className="text-foreground">{attack.dano}</strong>. </span>}
                      {attack.critico && <span>Crítico <strong className="text-foreground">{attack.critico}</strong>. </span>}
                      {attack.alcance && <span>Alcance <strong className="text-foreground">{attack.alcance}</strong>. </span>}
                      {attack.especial}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Poderes e habilidades" icon={<Zap className="h-4 w-4" />}>
            {view.habilidades.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma habilidade cadastrada.</p>
            ) : (
              <div className="space-y-3">
                {view.habilidades.map((skill, index) => (
                  <div key={`${skill.nome}-${index}`} className="border border-border bg-background p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{skill.nome}</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {skill.acao && <Badge variant="outline" className="rounded-none">{skill.acao}</Badge>}
                          {!!skill.custo_pe && <Badge variant="outline" className="rounded-none">{skill.custo_pe} {resourceLabel}</Badge>}
                        </div>
                      </div>
                      {!!skill.custo_pe && (
                        <Button variant="outline" size="sm" onClick={() => spendCost(skill.custo_pe, skill.nome)}>
                          Usar
                        </Button>
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{skill.descricao}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Rituais" icon={<Sparkles className="h-4 w-4" />}>
            {view.rituais.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum ritual aprendido.</p>
            ) : (
              <div className="space-y-3">
                {view.rituais.map((ritual) => {
                  const full = allRituais.find((item) => item.id === ritual.ritual_id);
                  const element = ritual.elemento as RitualElemento;
                  return (
                    <div key={ritual.ritual_id} className="border border-border bg-background p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{ritual.nome}</p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            <Badge variant="outline" className={cn("rounded-none", ELEMENTO_BADGE[element])}>{ELEMENTO_LABELS[element]}</Badge>
                            <Badge variant="outline" className="rounded-none">{ritual.circulo}° círculo</Badge>
                            <Badge variant="outline" className="rounded-none">{ritual.custo_pe} {resourceLabel}</Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => spendCost(ritual.custo_pe, ritual.nome)}>
                          Conjurar
                        </Button>
                      </div>
                      {full?.descricao && <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{full.descricao}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </Section>
        </div>

        <aside className="space-y-6">
          <Section title="Atributos" icon={<Gauge className="h-4 w-4" />}>
            <div className="grid grid-cols-5 gap-2">
              <Attribute label="AGI" value={view.agi} />
              <Attribute label="FOR" value={view.forca} />
              <Attribute label="INT" value={view.intelecto} />
              <Attribute label="PRE" value={view.presenca} />
              <Attribute label="VIG" value={view.vigor} />
            </div>
          </Section>

          {agente.desertor && (
            <Section title="Desertor" icon={<Skull className="h-4 w-4" />}>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {DESERTOR_REGRAS.pvMetade}. {DESERTOR_REGRAS.fortitude}
              </p>
              {agente.desertor_acumulo > 0 && (
                <p className="mt-3 border border-destructive/30 bg-destructive/[0.04] p-3 text-sm text-destructive">
                  Acúmulo atual: -{agente.desertor_acumulo}d10 PV máximo e -{agente.desertor_acumulo} em testes.
                </p>
              )}
            </Section>
          )}

          <Section title="Inventário" icon={<Package className="h-4 w-4" />}>
            {agente.inventario.length === 0 ? (
              <p className="text-sm text-muted-foreground">Inventário vazio.</p>
            ) : (
              <div className="space-y-2">
                {agente.inventario.map((entry, index) => {
                  const item = allItens.find((candidate) => candidate.id === entry.item_id);
                  return (
                    <div key={`${entry.nome}-${index}`} className="border border-border bg-background p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold">{entry.nome}</p>
                        <span className="text-xs text-muted-foreground">{entry.espacos} esp.</span>
                      </div>
                      {itemDescription(item) && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{itemDescription(item)}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          <Section title="Dossiê" icon={<NotebookText className="h-4 w-4" />}>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <TextBlock label="Aparência" value={agente.aparencia} />
              <TextBlock label="Personalidade" value={agente.personalidade} />
              <TextBlock label="Histórico" value={agente.historico} />
              <TextBlock label="Objetivo" value={agente.objetivo} />
            </div>
          </Section>
        </aside>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border border-border bg-background p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function Attribute({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border bg-background p-3 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-[10px] text-muted-foreground">{dicePool(value)}</p>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

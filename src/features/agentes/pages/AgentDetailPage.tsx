"use client";

import { CombateTab } from "@/features/agentes/components/tabs/CombateTab";
import { DescricaoTab } from "@/features/agentes/components/tabs/DescricaoTab";
import { HabilidadesTab } from "@/features/agentes/components/tabs/HabilidadesTab";
import { HexatombeTab } from "@/features/agentes/components/tabs/HexatombeTab";
import { InventarioTab } from "@/features/agentes/components/tabs/InventarioTab";
import { RituaisTab } from "@/features/agentes/components/tabs/RituaisTab";
import { useAgente, useUpdateAgente } from "@/features/agentes/hooks/useAgentes";
import { emptyFormaSuprema } from "@/features/agentes/services/agentes";
import { ImageUpload } from "@/shared/components/ImageUpload/ImageUpload";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { ORIGIN_POWER_CATALOG, powerToHabilidade } from "@/shared/constants/agentPowers";
import { CLASS_RULES, ORIGENS, findOriginRule } from "@/shared/constants/agentRules";
import { TRAIL_SOURCE_MARK, buildTrailHabilidades, findTrailRule, getTrailsForClass } from "@/shared/constants/agentTrails";
import { getEstigmas } from "@/shared/constants/hexatombe";
import { PERICIAS } from "@/shared/constants/pericias";
import { createClient } from "@/shared/lib/supabase/client";
import { cn } from "@/shared/lib/utils";
import { AgentFormaSuprema, AgentPericiaEntry, AgentSheet, GrauPericia } from "@/shared/types/agent";
import {
  buildProficienciesPatch,
  calcularCargaMax,
  calcularLimitePE,
  calcularRecursos,
  calcularRecursosPD,
  deriveFormaSuprema,
  shouldDeriveFormaSuprema,
  getClassRule,
  treinarPericias,
} from "@/shared/utils/agentCalc";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpenCheck, Gauge, Heart, ImageIcon, Save, Shield, Skull, Sparkles, Swords, UserRound, Zap } from "lucide-react";
import Link from "next/link";
import { ReactNode, useCallback, useMemo, useState } from "react";

const CLASSES = Object.keys(CLASS_RULES) as (keyof typeof CLASS_RULES)[];
const FORMA_KEYS: (keyof AgentFormaSuprema)[] = [
  "pv_max", "pv_atual", "pe_max", "pe_atual", "san_max", "san_atual",
  "usa_pd", "pd_max", "pd_atual", "defesa_bonus", "defesa_equip",
  "deslocamento", "pericias", "ataques", "habilidades", "rituais",
];
const FORMA_KEY_SET = new Set<keyof AgentSheet>(FORMA_KEYS);
const GRAUS: { label: string; bonus: number; short: string }[] = [
  { label: "Leigo", bonus: 0, short: "-" },
  { label: "Treinado", bonus: 5, short: "T" },
  { label: "Veterano", bonus: 10, short: "V" },
  { label: "Expert", bonus: 15, short: "E" },
];

interface AgentDetailPageProps {
  agenteId: string;
  backHref?: string;
}

interface PlayerProfile {
  id: string;
  name: string | null;
}

export function AgentDetailPage({ agenteId, backHref = "/agentes" }: AgentDetailPageProps) {
  const supabase = createClient();
  const { data: agente, isLoading } = useAgente(agenteId);
  const update = useUpdateAgente();
  const [localPatch, setLocalPatch] = useState<Partial<AgentSheet> | null>(null);
  const [dirty, setDirty] = useState(false);
  const local = useMemo(() => agente ? { ...agente, ...localPatch } : null, [agente, localPatch]);
  const { data: jogadores = [] } = useQuery({
    queryKey: ["profiles", "jogadores"],
    queryFn: async (): Promise<PlayerProfile[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("role", "jogador")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const onChange = useCallback((patch: Partial<AgentSheet>) => {
    setLocalPatch((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  }, []);

  const save = async () => {
    if (!local) return;
    const payload: AgentSheet = {
      ...local,
      pe_por_rodada: calcularLimitePE(local.nex, local.classe),
    };
    if (local.profile_id) {
      const { error } = await supabase
        .from("agent_sheets")
        .update({ profile_id: null })
        .eq("profile_id", local.profile_id)
        .neq("id", local.id);
      if (error) throw error;
    }
    await update.mutateAsync({ id: local.id, payload });
    setLocalPatch(null);
    setDirty(false);
  };

  if (isLoading || !local) {
    return (
      <div className="grid h-full place-items-center">
        <p className="text-sm text-muted-foreground">Carregando editor...</p>
      </div>
    );
  }

  const isHexa = local.tipo === "hexatombe";
  const editingSuprema = isHexa && local.forma_ativa;
  const forma = local.forma_suprema ?? emptyFormaSuprema(local.usa_pd);
  const data: AgentSheet = editingSuprema ? { ...local, ...forma } : local;
  const origemRule = findOriginRule(local.origem);
  const classeRule = getClassRule(local.classe);
  const trilhasDisponiveis = getTrailsForClass(local.classe);
  const trilhaRule = findTrailRule(local.trilha);
  const estigmas = getEstigmas(local.estigmas);
  const jogadorAtual = jogadores.find((jogador) => jogador.id === local.profile_id);
  const limiteCalculado = calcularLimitePE(data.nex, data.classe);
  const defesaCalculada = 10 + data.agi + data.defesa_bonus + data.defesa_equip;
  const withAutomaticRules = (base: AgentSheet, patch: Partial<AgentSheet>): Partial<AgentSheet> => {
    const next = { ...base, ...patch };
    const auto: Partial<AgentSheet> = { ...patch };
    const originChanged = Object.prototype.hasOwnProperty.call(patch, "origem");
    const classChanged = Object.prototype.hasOwnProperty.call(patch, "classe");
    const resourcesChanged = ["classe", "trilha", "nex", "vigor", "presenca", "usa_pd"].some((key) =>
      Object.prototype.hasOwnProperty.call(patch, key),
    );
    const loadChanged = ["forca", "intelecto", "trilha", "nex"].some((key) => Object.prototype.hasOwnProperty.call(patch, key));
    const trailChanged = ["classe", "trilha", "nex"].some((key) =>
      Object.prototype.hasOwnProperty.call(patch, key),
    );
    const classForLimitChanged = ["classe", "nex"].some((key) => Object.prototype.hasOwnProperty.call(patch, key));

    if (originChanged) {
      const nextOrigin = findOriginRule(next.origem);
      if (nextOrigin) {
        const originPower = ORIGIN_POWER_CATALOG.find((power) => power.origem === nextOrigin.label);
        auto.pericias = treinarPericias(auto.pericias ?? next.pericias, nextOrigin.trainedSkills);
        if (originPower && !next.habilidades.some((item) => item.nome === originPower.nome)) {
          auto.habilidades = [...next.habilidades, powerToHabilidade(originPower)];
        }
      }
    }

    if (classChanged) {
      const nextClass = getClassRule(next.classe);
      if (nextClass) {
        auto.pericias = treinarPericias(auto.pericias ?? next.pericias, nextClass.trainedSkills);
        Object.assign(auto, buildProficienciesPatch(nextClass.proficiencies));
      }
      if (!getTrailsForClass(next.classe).some((trail) => trail.nome === next.trilha)) {
        auto.trilha = null;
      }
    }

    if (classForLimitChanged) {
      auto.pe_por_rodada = calcularLimitePE(next.nex, next.classe);
    }

    if (loadChanged) {
      auto.carga_max = calcularCargaMax(next.forca);
    }

    if (resourcesChanged) {
      if (next.usa_pd) {
        const calculated = calcularRecursosPD(next.classe, next.nex, next.vigor, next.presenca);
        if (calculated) {
          Object.assign(auto, {
            pv_max: calculated.pv_max,
            pv_atual: calculated.pv_max,
            pd_max: calculated.pd_max,
            pd_atual: calculated.pd_max,
            pe_max: 0,
            pe_atual: 0,
            san_max: 0,
            san_atual: 0,
          });
        }
      } else {
        const calculated = calcularRecursos(next.classe, next.nex, next.vigor, next.presenca);
        if (calculated) {
          Object.assign(auto, {
            pv_max: calculated.pv_max,
            pv_atual: calculated.pv_max,
            pe_max: calculated.pe_max,
            pe_atual: calculated.pe_max,
            san_max: calculated.san_max,
            san_atual: calculated.san_max,
            pd_max: 0,
            pd_atual: 0,
          });
        }
      }
    }

    if (trailChanged) {
      const trailName = auto.trilha !== undefined ? auto.trilha : next.trilha;
      const trailAbilities = buildTrailHabilidades(trailName, next.nex);
      const manualAbilities = next.habilidades.filter((habilidade) => !habilidade.descricao.includes(TRAIL_SOURCE_MARK));
      const byName = new Set(manualAbilities.map((habilidade) => habilidade.nome.trim().toLowerCase()));
      auto.habilidades = [
        ...manualAbilities,
        ...trailAbilities.filter((habilidade) => !byName.has(habilidade.nome.trim().toLowerCase())),
      ];

      if (trailName === "Tropa de Choque" && next.nex >= 10) {
        const extraPv = Math.floor(next.nex / 5);
        const currentMax = auto.pv_max ?? next.pv_max;
        auto.pv_max = currentMax + extraPv;
        auto.pv_atual = Math.min(auto.pv_max, (auto.pv_atual ?? next.pv_atual) + extraPv);
      }

      if (trailName === "Técnico" && next.nex >= 10) {
        auto.carga_max = calcularCargaMax(next.forca + next.intelecto);
      }
    }

    if (isHexa && (resourcesChanged || classChanged)) {
      auto.forma_ativa = false;
      auto.forma_suprema = emptyFormaSuprema(next.usa_pd);
    }

    return auto;
  };

  const baseChange = (patch: Partial<AgentSheet>) => onChange(withAutomaticRules(local, patch));

  const scopedChange = (patch: Partial<AgentSheet>) => {
    if (!editingSuprema) return baseChange(patch);
    const fsPatch: Partial<AgentFormaSuprema> = {};
    const basePatch: Partial<AgentSheet> = {};
    (Object.keys(patch) as (keyof AgentSheet)[]).forEach((key) => {
      if (FORMA_KEY_SET.has(key)) Object.assign(fsPatch, { [key]: patch[key] });
      else Object.assign(basePatch, { [key]: patch[key] });
    });
    const next: Partial<AgentSheet> = { ...basePatch };
    if (Object.keys(fsPatch).length) next.forma_suprema = { ...forma, ...fsPatch };
    onChange(next);
  };

  return (
    <main className="h-full overflow-y-auto">
      <header className={cn("sticky top-0 z-20 border-b border-border bg-background/95 px-6 py-4 backdrop-blur", editingSuprema && "border-red-500/30 bg-red-500/[0.04]")}>
        <div className="flex flex-wrap items-center gap-3">
          <Link href={backHref} className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Editor de ficha</p>
            <h1 className="truncate text-xl font-semibold">{editingSuprema && local.codinome ? local.codinome : local.nome || "Agente sem nome"}</h1>
          </div>
          {isHexa && (
            <Button
              variant={local.forma_ativa ? "default" : "outline"}
              onClick={() => {
                const activating = !local.forma_ativa;
                onChange(activating
                  ? {
                      forma_ativa: true,
                      forma_suprema: shouldDeriveFormaSuprema(local) ? deriveFormaSuprema(local) : local.forma_suprema,
                    }
                  : { forma_ativa: false });
              }}
            >
              <Skull className="h-4 w-4" />
              {local.forma_ativa ? "Intenção Assassina ativa" : "Ativar Intenção Assassina"}
            </Button>
          )}
          <Button onClick={save} disabled={!dirty || update.isPending}>
            <Save className="h-4 w-4" />
            {update.isPending ? "Salvando..." : "Salvar ficha"}
          </Button>
        </div>
      </header>

      <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {editingSuprema && (
            <EditorCard
              title="Intenção Assassina ativa"
              icon={<Skull className="h-4 w-4" />}
              description="Você está editando os valores despertos. Eles foram calculados automaticamente a partir da ficha base ao ativar a intenção."
            >
              <p className="text-sm leading-relaxed text-muted-foreground">
                Para voltar a editar a base, desative a Intenção Assassina no cabeçalho. A ficha base permanece preservada.
              </p>
            </EditorCard>
          )}

          <EditorCard title="Identidade" icon={<UserRound className="h-4 w-4" />} description="Retrato, origem, classe, trilha e jogador ficam juntos para a ficha não parecer quebrada em campos soltos.">
            <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
              <div className="grid grid-cols-2 gap-3">
                <ImageUpload bucket="agentes" value={local.image_url} onChange={(url) => baseChange({ image_url: url })} className="aspect-square h-auto w-full" label="Retrato" />
                {isHexa && (
                  <ImageUpload
                    bucket="agentes"
                    value={local.intent_image_url}
                    onChange={(url) => baseChange({ intent_image_url: url })}
                    className="aspect-square h-auto w-full border-red-500/30"
                    label="Intenção"
                  />
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="Nome do personagem">
                  <Input value={local.nome ?? ""} onChange={(event) => baseChange({ nome: event.target.value || null })} placeholder="Nome civil ou nome público" />
                </Field>
                {isHexa && (
                  <Field label="Codinome / máscara">
                    <Input value={local.codinome ?? ""} onChange={(event) => baseChange({ codinome: event.target.value || null })} placeholder="Nome da máscara" />
                  </Field>
                )}
                <Field label="Origem">
                  <Select value={local.origem ?? ""} onValueChange={(value) => baseChange({ origem: value || null })}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Escolha uma origem" /></SelectTrigger>
                    <SelectContent position="popper">
                      {ORIGENS.map((origin) => <SelectItem key={origin.key} value={origin.label}>{origin.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Classe">
                  <Select value={local.classe ?? ""} onValueChange={(value) => baseChange({ classe: value || null })}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Escolha uma classe" /></SelectTrigger>
                    <SelectContent position="popper">
                      {CLASSES.map((classe) => <SelectItem key={classe} value={classe}>{classe}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Trilha">
                  <Select
                    value={local.trilha ?? "__none__"}
                    onValueChange={(value) => baseChange({ trilha: value === "__none__" ? null : value })}
                    disabled={!local.classe || trilhasDisponiveis.length === 0}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={local.classe ? "Escolha uma trilha" : "Escolha a classe primeiro"} />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="__none__">Sem trilha</SelectItem>
                      {trilhasDisponiveis.map((trail) => (
                        <SelectItem key={trail.id} value={trail.nome}>{trail.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Jogador">
                  <Select
                    value={local.profile_id ?? "__none__"}
                    onValueChange={(value) => baseChange({ profile_id: value === "__none__" ? null : value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Nenhum jogador" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="__none__">Nenhum jogador</SelectItem>
                      {jogadores.map((jogador) => (
                        <SelectItem key={jogador.id} value={jogador.id}>
                          {jogador.name || "Jogador sem nome"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <div className="md:col-span-2 xl:col-span-3">
                  <div className="border border-border bg-muted/20 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {trilhaRule ? `${trilhaRule.nome} · poderes liberados` : "Trilha ainda não definida"}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {trilhaRule
                        ? `${trilhaRule.resumo} ${trilhaRule.requisito ? `Requisito: ${trilhaRule.requisito}` : ""}`
                        : "Ao escolher uma trilha, os poderes correspondentes ao NEX atual entram automaticamente na ficha."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </EditorCard>

          <EditorCard title="Regras automáticas" icon={<BookOpenCheck className="h-4 w-4" />} description="Origem, classe, NEX, atributos, carga e recursos são recalculados automaticamente quando você altera os campos da ficha.">
            <div className="grid gap-3 md:grid-cols-3">
              <RuleSummary label="Origem" value={origemRule ? `${origemRule.power}` : "Escolha uma origem"} />
              <RuleSummary label="Classe" value={classeRule ? classeRule.note : "Escolha uma classe"} />
              <RuleSummary label="Recursos" value={local.usa_pd ? "PV + PD" : "PV + PE + SAN"} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const nextUsaPd = !local.usa_pd;
                  baseChange({
                    usa_pd: nextUsaPd,
                    forma_ativa: false,
                    forma_suprema: isHexa ? emptyFormaSuprema(nextUsaPd) : null,
                  });
                }}
              >
                {local.usa_pd ? "Usar PE + SAN" : "Usar PD"}
              </Button>
            </div>
          </EditorCard>

          <EditorCard title="Recursos e atributos" icon={<Gauge className="h-4 w-4" />} description="NEX e atributos recalculam recursos, carga, trilha e limite por rodada automaticamente. Ajuste manualmente apenas os valores atuais quando precisar.">
            <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
              <ProgressionBox
                label={local.classe === "Sobrevivente" ? "Estágio" : "NEX"}
                value={data.nex}
                suffix={local.classe === "Sobrevivente" ? "" : "%"}
                onChange={(value) => scopedChange({ nex: value })}
                detail={trilhaRule ? `${trilhaRule.nome}: ${buildTrailHabilidades(data.trilha, data.nex).length} poderes liberados` : "Escolha uma trilha para liberar poderes"}
              />
              <DerivedBox label="Limite por rodada" value={limiteCalculado} suffix={data.usa_pd ? "PD" : "PE"} detail="Calculado pelo NEX atual" />
              <DerivedBox label="Defesa" value={defesaCalculada} suffix="" detail="10 + AGI + bônus + equipamento" />
              <TextField label="Deslocamento" value={data.deslocamento} onChange={(value) => scopedChange({ deslocamento: value })} />
            </div>

            <div className="mt-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Atributos</p>
              <div className="grid gap-3 md:grid-cols-5">
                <AttributeBox label="AGI" hint="Agilidade" value={data.agi} onChange={(value) => scopedChange({ agi: value })} />
                <AttributeBox label="FOR" hint="Força" value={data.forca} onChange={(value) => scopedChange({ forca: value })} />
                <AttributeBox label="INT" hint="Intelecto" value={data.intelecto} onChange={(value) => scopedChange({ intelecto: value })} />
                <AttributeBox label="PRE" hint="Presença" value={data.presenca} onChange={(value) => scopedChange({ presenca: value })} />
                <AttributeBox label="VIG" hint="Vigor" value={data.vigor} onChange={(value) => scopedChange({ vigor: value })} />
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Recursos</p>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <ResourceBox label="Pontos de Vida" short="PV" atual={data.pv_atual} max={data.pv_max} onAtual={(value) => scopedChange({ pv_atual: value })} onMax={(value) => scopedChange({ pv_max: value })} tone="red" />
                {data.usa_pd ? (
                  <ResourceBox label="Determinação" short="PD" atual={data.pd_atual} max={data.pd_max} onAtual={(value) => scopedChange({ pd_atual: value })} onMax={(value) => scopedChange({ pd_max: value })} tone="amber" />
                ) : (
                  <>
                    <ResourceBox label="Esforço" short="PE" atual={data.pe_atual} max={data.pe_max} onAtual={(value) => scopedChange({ pe_atual: value })} onMax={(value) => scopedChange({ pe_max: value })} tone="cyan" />
                    <ResourceBox label="Sanidade" short="SAN" atual={data.san_atual} max={data.san_max} onAtual={(value) => scopedChange({ san_atual: value })} onMax={(value) => scopedChange({ san_max: value })} />
                  </>
                )}
              </div>
            </div>
          </EditorCard>

          <EditorCard title="Perícias" icon={<BookOpenCheck className="h-4 w-4" />} description="O bônus não soma o atributo. O atributo define os d20; o bônus fixo vem de treinamento e modificadores.">
            <SkillEditor data={data} onChange={scopedChange} />
          </EditorCard>

          <EditorCard title="Combate" icon={<Swords className="h-4 w-4" />}>
            <CombateTab data={data} onChange={scopedChange} />
          </EditorCard>

          <EditorCard title="Poderes e habilidades" icon={<Zap className="h-4 w-4" />}>
            <HabilidadesTab data={data} onChange={scopedChange} />
          </EditorCard>

          <EditorCard title="Rituais" icon={<Sparkles className="h-4 w-4" />}>
            <RituaisTab data={data} onChange={scopedChange} />
          </EditorCard>

          <EditorCard title="Inventário" icon={<Shield className="h-4 w-4" />}>
            <InventarioTab data={local} onChange={onChange} />
          </EditorCard>

          <EditorCard title="Descrição e história" icon={<ImageIcon className="h-4 w-4" />}>
            <DescricaoTab data={local} onChange={onChange} />
          </EditorCard>

          {isHexa && (
            <EditorCard title="Hexatombe" icon={<Skull className="h-4 w-4" />}>
              <HexatombeTab data={local} onChange={onChange} />
            </EditorCard>
          )}
        </div>

        <aside className="space-y-4">
          <div className="sticky top-24 space-y-4">
            <EditorCard title="Resumo" icon={<Heart className="h-4 w-4" />}>
              <div className="space-y-3">
                <Summary label="Tipo" value={isHexa ? "Ficha Hexatombe" : "Ficha da Ordem"} danger={isHexa} />
                <Summary label="Classe" value={local.classe ?? "A definir"} />
                <Summary label="Origem" value={local.origem ?? "A definir"} />
                <Summary label="Jogador" value={jogadorAtual?.name ?? "Sem vínculo"} />
                <Summary label="Defesa" value={defesaCalculada} />
                <Summary label="Recursos" value={data.usa_pd ? `${data.pd_atual}/${data.pd_max} PD` : `${data.pe_atual}/${data.pe_max} PE · ${data.san_atual}/${data.san_max} SAN`} />
                {estigmas.length > 0 && <Summary label="Estigmas" value={estigmas.map((item) => item.nome).join(", ")} danger />}
              </div>
            </EditorCard>
            {dirty && (
              <div className="border border-primary/30 bg-primary/[0.04] p-4">
                <p className="text-sm font-semibold">Alterações pendentes</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Salve para atualizar a ficha usada pelos jogadores e pela mesa.</p>
                <Button className="mt-3 w-full" onClick={save} disabled={update.isPending}>
                  <Save className="h-4 w-4" />
                  Salvar agora
                </Button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

function EditorCard({ title, description, icon, children }: { title: string; description?: string; icon: ReactNode; children: ReactNode }) {
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </Field>
  );
}

function ProgressionBox({ label, value, suffix, detail, onChange }: { label: string; value: number; suffix?: string; detail: string; onChange: (value: number) => void }) {
  return (
    <div className="border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</p>
        </div>
        <div className="flex items-baseline gap-1">
          <Input
            type="number"
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
            className="h-12 w-24 border-0 bg-muted/40 text-center text-2xl font-semibold shadow-none focus-visible:ring-1"
          />
          {suffix && <span className="text-sm font-semibold text-muted-foreground">{suffix}</span>}
        </div>
      </div>
    </div>
  );
}

function DerivedBox({ label, value, suffix, detail }: { label: string; value: number; suffix: string; detail: string }) {
  return (
    <div className="border border-primary/25 bg-primary/[0.04] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tabular-nums">{value}</span>
        <span className="text-sm font-semibold text-muted-foreground">{suffix}</span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function AttributeBox({ label, hint, value, onChange }: { label: string; hint: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className="border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
        </div>
        <Input
          type="number"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-10 w-16 border-0 bg-muted/40 text-center text-xl font-semibold shadow-none focus-visible:ring-1"
        />
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">{value <= 0 ? "2d20 pior" : `${value}d20`}</p>
    </div>
  );
}

function ResourceBox({
  label,
  short,
  atual,
  max,
  tone = "default",
  onAtual,
  onMax,
}: {
  label: string;
  short: string;
  atual: number;
  max: number;
  tone?: "default" | "red" | "amber" | "cyan";
  onAtual: (value: number) => void;
  onMax: (value: number) => void;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (atual / max) * 100)) : 0;
  return (
    <div className={cn(
      "border bg-background p-4",
      tone === "red" && "border-red-500/25 bg-red-500/[0.03]",
      tone === "amber" && "border-amber-500/30 bg-amber-500/[0.03]",
      tone === "cyan" && "border-cyan-500/30 bg-cyan-500/[0.03]",
      tone === "default" && "border-border",
    )}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{short}</p>
          <p className="mt-0.5 text-sm font-semibold">{label}</p>
        </div>
        <p className="text-2xl font-semibold tabular-nums">{atual}<span className="text-muted-foreground">/{max}</span></p>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden bg-muted">
        <div
          className={cn(
            "h-full",
            tone === "red" && "bg-red-500",
            tone === "amber" && "bg-amber-500",
            tone === "cyan" && "bg-cyan-500",
            tone === "default" && "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Field label="Atual">
          <Input type="number" value={atual} onChange={(event) => onAtual(Number(event.target.value))} />
        </Field>
        <Field label="Máximo">
          <Input type="number" value={max} onChange={(event) => onMax(Number(event.target.value))} />
        </Field>
      </div>
    </div>
  );
}

function RuleSummary({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-background p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm leading-relaxed">{value}</p>
    </div>
  );
}

function Summary({ label, value, danger }: { label: string; value: ReactNode; danger?: boolean }) {
  return (
    <div className="border border-border bg-background p-3">
      <p className={cn("text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground", danger && "text-red-500")}>{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function getGrau(entry?: AgentPericiaEntry): GrauPericia {
  if (!entry) return 0;
  if (entry.grau !== undefined) return entry.grau;
  return entry.treinado ? 1 : 0;
}

function SkillEditor({ data, onChange }: { data: AgentSheet; onChange: (patch: Partial<AgentSheet>) => void }) {
  const setSkill = (key: string, patch: Partial<AgentPericiaEntry>) => {
    const current = data.pericias[key] ?? { treinado: false, grau: 0, outros: 0 };
    onChange({ pericias: { ...data.pericias, [key]: { ...current, ...patch } } });
  };

  return (
    <div className="grid gap-2 md:grid-cols-2">
      {PERICIAS.map((skill) => {
        const entry = data.pericias[skill.key] ?? { treinado: false, grau: 0, outros: 0 };
        const grau = getGrau(entry);
        const bonus = GRAUS[grau].bonus + (entry.outros ?? 0);
        const attrValue = skill.atributo === "FOR" ? data.forca : skill.atributo === "AGI" ? data.agi : skill.atributo === "INT" ? data.intelecto : skill.atributo === "PRE" ? data.presenca : data.vigor;
        return (
          <div key={skill.key} className="grid grid-cols-[minmax(0,1fr)_120px_80px] items-center gap-2 border border-border bg-background p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{skill.nome}</p>
              <p className="text-xs text-muted-foreground">{skill.atributo} · {attrValue <= 0 ? "2d20 pior" : `${attrValue}d20`} · bônus {bonus >= 0 ? `+${bonus}` : bonus}</p>
            </div>
            <Select value={String(grau)} onValueChange={(value) => setSkill(skill.key, { grau: Number(value) as GrauPericia, treinado: Number(value) >= 1 })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent position="popper">
                {GRAUS.map((item, index) => <SelectItem key={item.label} value={String(index)}>{item.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="number" value={entry.outros ?? 0} onChange={(event) => setSkill(skill.key, { outros: Number(event.target.value) })} />
          </div>
        );
      })}
    </div>
  );
}

import { emptyFormaSuprema } from "@/features/agentes/services/agentes";
import { ORIGIN_POWER_CATALOG, powerToHabilidade } from "@/shared/constants/agentPowers";
import { CLASS_RULES, findOriginRule } from "@/shared/constants/agentRules";
import { estigmaHabilidade, getEstigmas } from "@/shared/constants/hexatombe";
import { AgentHabilidade, AgentSheetPayload, TipoFicha } from "@/shared/types/agent";
import {
  buildProficienciesPatch,
  calcularCargaMax,
  calcularLimitePE,
  calcularRecursos,
  calcularRecursosPD,
  treinarPericias,
} from "@/shared/utils/agentCalc";

export interface BuildAgentPayloadInput {
  tipo: TipoFicha;
  nome: string;
  origem: string;
  classe: keyof typeof CLASS_RULES;
  usarPd: boolean;
  codinome?: string;
  estigmas?: string[];
}

export function buildAgentPayload(input: BuildAgentPayloadInput): Partial<AgentSheetPayload> {
  const origemRule = findOriginRule(input.origem);
  const classeRule = CLASS_RULES[input.classe];
  const nexInicial = input.classe === "Sobrevivente" ? 1 : 5;
  const recursos = calcularRecursos(input.classe, nexInicial, 1, 1);
  const recursosPD = calcularRecursosPD(input.classe, nexInicial, 1, 1);
  const originPower = origemRule
    ? ORIGIN_POWER_CATALOG.find((power) => power.origem === origemRule.label)
    : null;
  const habilidadesOrigem: AgentHabilidade[] = originPower ? [powerToHabilidade(originPower)] : [];
  const habilidadesHexa = input.tipo === "hexatombe" ? getEstigmas(input.estigmas).map(estigmaHabilidade) : [];
  const pericias = treinarPericias({}, [...(origemRule?.trainedSkills ?? []), ...classeRule.trainedSkills]);

  const payload: Partial<AgentSheetPayload> = {
    nome: input.nome.trim() || null,
    origem: origemRule?.label ?? null,
    classe: input.classe,
    nex: nexInicial,
    agi: 1,
    forca: 1,
    intelecto: 1,
    presenca: 1,
    vigor: 1,
    pe_por_rodada: calcularLimitePE(nexInicial, input.classe),
    carga_max: calcularCargaMax(1),
    pericias,
    habilidades: [...habilidadesOrigem, ...habilidadesHexa],
    ...buildProficienciesPatch(classeRule.proficiencies),
    tipo: input.tipo,
    codinome: input.tipo === "hexatombe" ? input.codinome?.trim() || null : null,
    estigmas: input.tipo === "hexatombe" ? input.estigmas ?? [] : [],
    forma_suprema: input.tipo === "hexatombe" ? emptyFormaSuprema(input.usarPd) : null,
  };

  if (input.usarPd && recursosPD) {
    Object.assign(payload, {
      usa_pd: true,
      pv_max: recursosPD.pv_max,
      pv_atual: recursosPD.pv_max,
      pe_max: 0,
      pe_atual: 0,
      san_max: 0,
      san_atual: 0,
      pd_max: recursosPD.pd_max,
      pd_atual: recursosPD.pd_max,
    });
  }

  if (!input.usarPd && recursos) {
    Object.assign(payload, {
      usa_pd: false,
      pv_max: recursos.pv_max,
      pv_atual: recursos.pv_max,
      pe_max: recursos.pe_max,
      pe_atual: recursos.pe_max,
      san_max: recursos.san_max,
      san_atual: recursos.san_max,
      pd_max: 0,
      pd_atual: 0,
    });
  }

  return payload;
}

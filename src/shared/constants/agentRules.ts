import { AgentPericiaEntry } from "@/shared/types/agent";

export type ProficiencyKey =
  | "prof_arma_simples"
  | "prof_arma_tatica"
  | "prof_arma_pesada"
  | "prof_prot_leve"
  | "prof_prot_pesada";

export interface OriginRule {
  key: string;
  label: string;
  trainedSkills: string[];
  skillChoiceCount?: number;
  power: string;
  note?: string;
}

export interface ClassRule {
  label: "Combatente" | "Especialista" | "Ocultista" | "Sobrevivente";
  resourceLabel: string;
  pdResourceLabel: string;
  trainedSkills: string[];
  choiceGroups?: string[][];
  skillChoiceBase: number;
  proficiencies: ProficiencyKey[];
  note: string;
}

export const ORIGENS: OriginRule[] = [
  { key: "academico", label: "Acadêmico", trainedSkills: ["ciencias", "investigacao"], power: "Saber é Poder" },
  { key: "agente-saude", label: "Agente de Saúde", trainedSkills: ["intuicao", "medicina"], power: "Técnica Medicinal" },
  { key: "amnesico", label: "Amnésico", trainedSkills: [], skillChoiceCount: 2, power: "Vislumbres do Passado", note: "Duas perícias à escolha do mestre." },
  { key: "artista", label: "Artista", trainedSkills: ["artes", "enganacao"], power: "Magnum Opus" },
  { key: "atleta", label: "Atleta", trainedSkills: ["acrobacia", "atletismo"], power: "110%" },
  { key: "chef", label: "Chef", trainedSkills: ["fortitude", "profissao1"], power: "Ingrediente Secreto" },
  { key: "criminoso", label: "Criminoso", trainedSkills: ["crime", "furtividade"], power: "O Crime Compensa" },
  { key: "cultista-arrependido", label: "Cultista Arrependido", trainedSkills: ["ocultismo", "religiao"], power: "Traços do Outro Lado" },
  { key: "desgarrado", label: "Desgarrado", trainedSkills: ["fortitude", "sobrevivencia"], power: "Calejado" },
  { key: "engenheiro", label: "Engenheiro", trainedSkills: ["profissao1", "tecnologia"], power: "Ferramenta Favorita" },
  { key: "executivo", label: "Executivo", trainedSkills: ["diplomacia", "profissao1"], power: "Processo Otimizado" },
  { key: "investigador", label: "Investigador", trainedSkills: ["investigacao", "percepcao"], power: "Faro para Pistas" },
  { key: "lutador", label: "Lutador", trainedSkills: ["luta", "reflexos"], power: "Mão Pesada" },
  { key: "magnata", label: "Magnata", trainedSkills: ["diplomacia", "pilotagem"], power: "Patrocinador da Ordem" },
  { key: "mercenario", label: "Mercenário", trainedSkills: ["iniciativa", "intimidacao"], power: "Posição de Combate" },
  { key: "militar", label: "Militar", trainedSkills: ["pontaria", "tatica"], power: "Para Bellum" },
  { key: "operario", label: "Operário", trainedSkills: ["fortitude", "profissao1"], power: "Ferramenta de Trabalho" },
  { key: "policial", label: "Policial", trainedSkills: ["percepcao", "pontaria"], power: "Patrulha" },
  { key: "religioso", label: "Religioso", trainedSkills: ["religiao", "vontade"], power: "Acalentar" },
  { key: "servidor-publico", label: "Servidor Público", trainedSkills: ["intuicao", "vontade"], power: "Espírito Cívico" },
  { key: "teorico-conspiracao", label: "Teórico da Conspiração", trainedSkills: ["investigacao", "ocultismo"], power: "Eu Já Sabia" },
  { key: "ti", label: "T.I.", trainedSkills: ["investigacao", "tecnologia"], power: "Motor de Busca" },
  { key: "trabalhador-rural", label: "Trabalhador Rural", trainedSkills: ["adestramento", "sobrevivencia"], power: "Desbravador" },
  { key: "trambiqueiro", label: "Trambiqueiro", trainedSkills: ["crime", "enganacao"], power: "Impostor" },
  { key: "universitario", label: "Universitário", trainedSkills: ["atualidades", "investigacao"], power: "Dedicação" },
  { key: "vitima", label: "Vítima", trainedSkills: ["reflexos", "vontade"], power: "Cicatrizes Psicológicas" },
];

export const CLASS_RULES: Record<ClassRule["label"], ClassRule> = {
  Combatente: {
    label: "Combatente",
    resourceLabel: "20 + VIG PV, 2 + PRE PE, 12 SAN; a cada NEX: +4 + VIG PV, +2 + PRE PE, +3 SAN.",
    pdResourceLabel: "20 + VIG PV, 6 + PRE PD; a cada NEX: +4 + VIG PV, +3 + PRE PD.",
    trainedSkills: [],
    choiceGroups: [["luta", "pontaria"], ["fortitude", "reflexos"]],
    skillChoiceBase: 1,
    proficiencies: ["prof_arma_simples", "prof_arma_tatica", "prof_prot_leve"],
    note: "Escolha Luta ou Pontaria, Fortitude ou Reflexos, e 1 + Intelecto perícias adicionais.",
  },
  Especialista: {
    label: "Especialista",
    resourceLabel: "16 + VIG PV, 3 + PRE PE, 16 SAN; a cada NEX: +3 + VIG PV, +3 + PRE PE, +4 SAN.",
    pdResourceLabel: "16 + VIG PV, 8 + PRE PD; a cada NEX: +3 + VIG PV, +4 + PRE PD.",
    trainedSkills: [],
    skillChoiceBase: 7,
    proficiencies: ["prof_arma_simples", "prof_prot_leve"],
    note: "Escolha 7 + Intelecto perícias.",
  },
  Ocultista: {
    label: "Ocultista",
    resourceLabel: "12 + VIG PV, 4 + PRE PE, 20 SAN; a cada NEX: +2 + VIG PV, +4 + PRE PE, +5 SAN.",
    pdResourceLabel: "12 + VIG PV, 10 + PRE PD; a cada NEX: +2 + VIG PV, +5 + PRE PD.",
    trainedSkills: ["ocultismo", "vontade"],
    skillChoiceBase: 3,
    proficiencies: ["prof_arma_simples"],
    note: "Recebe Ocultismo e Vontade, mais 3 + Intelecto perícias.",
  },
  Sobrevivente: {
    label: "Sobrevivente",
    resourceLabel: "8 + VIG PV, 2 + PRE PE, 8 SAN; a cada estágio: +2 PV, +1 PE, +2 SAN.",
    pdResourceLabel: "8 + VIG PV, 4 + PRE PD; a cada estágio: +2 PV, +2 PD.",
    trainedSkills: [],
    skillChoiceBase: 1,
    proficiencies: ["prof_arma_simples"],
    note: "Use estágio 1-5 no campo NEX. Escolha 1 + Intelecto perícias.",
  },
};

export function findOriginRule(value?: string | null): OriginRule | null {
  if (!value) return null;
  return ORIGENS.find((origin) => origin.label === value || origin.key === value) ?? null;
}

export function getSkillEntryAsTrained(entry?: AgentPericiaEntry): AgentPericiaEntry {
  const current = entry ?? { treinado: false, grau: 0 as const, outros: 0 };
  const grau = current.grau ?? (current.treinado ? 1 : 0);
  return {
    ...current,
    treinado: true,
    grau: grau >= 1 ? grau : 1,
    outros: current.outros ?? 0,
  };
}

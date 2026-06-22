import { ORIGENS } from "@/shared/constants/agentRules";
import { ESTIGMAS } from "@/shared/constants/hexatombe";
import { AgentHabilidade } from "@/shared/types/agent";
import { RitualElemento } from "@/shared/types/ritual";

export type AgentPowerKind = "origem" | "classe" | "paranormal" | "hexatombe";

export interface AgentPowerCatalogEntry {
  id: string;
  nome: string;
  tipo: AgentPowerKind;
  origem?: string;
  classe?: string;
  elemento?: RitualElemento;
  requisito?: string;
  acao?: string;
  custo_pe?: number;
  resumo: string;
  fonte: string;
}

const ORIGIN_POWER_SUMMARIES: Record<string, string> = {
  "Saber é Poder": "Ao fazer um teste usando Intelecto, pode gastar PE para receber bônus no teste.",
  "Técnica Medicinal": "Melhora o uso de Medicina para cuidar de aliados durante cenas e interlúdios.",
  "Vislumbres do Passado": "O mestre escolhe pistas ou lembranças úteis ligadas ao passado apagado do personagem.",
  "Magnum Opus": "Uma vez por missão, alguém pode reconhecer sua obra, ajudando interações sociais.",
  "110%": "Ao se esforçar em testes físicos, pode gastar PE para melhorar o resultado.",
  "Ingrediente Secreto": "Usa culinária e improviso para preparar algo útil em cenas apropriadas.",
  "O Crime Compensa": "Ao fim de missão, pode preservar um item encontrado sem contar no limite comum da próxima missão.",
  "Traços do Outro Lado": "Começa com um poder paranormal à escolha, mas carrega consequências do contato.",
  "Calejado": "Recebe PV adicional conforme avança, representando resistência de quem sobreviveu sozinho.",
  "Ferramenta Favorita": "Escolhe uma ferramenta ou item de ofício que recebe utilidade especial.",
  "Processo Otimizado": "Usa método e organização para tornar certas tarefas mais eficientes.",
  "Faro para Pistas": "Uma vez por cena, pode gastar PE para melhorar um teste para procurar pistas.",
  "Mão Pesada": "Recebe bônus em rolagens de dano com ataques corpo a corpo.",
  "Patrocinador da Ordem": "Seu limite de crédito é considerado um nível acima.",
  "Posição de Combate": "No primeiro turno de uma cena de ação, pode gastar PE para ganhar mobilidade extra.",
  "Para Bellum": "Recebe bônus em rolagens de dano com armas de fogo.",
  "Ferramenta de Trabalho": "Escolhe uma arma ligada ao ofício e a usa melhor em combate.",
  "Patrulha": "Recebe bônus fixo de Defesa.",
  "Acalentar": "Melhora testes de Religião para acalmar e pode restaurar Sanidade.",
  "Espírito Cívico": "Ao ajudar alguém, pode gastar PE para aumentar o bônus concedido.",
  "Eu Já Sabia": "Recebe resistência a dano mental baseada no Intelecto.",
  "Motor de Busca": "Com acesso à internet, pode substituir certos testes por Tecnologia a critério do mestre.",
  "Desbravador": "Melhora Adestramento ou Sobrevivência e ignora penalidades de terreno difícil.",
  "Impostor": "Uma vez por cena, pode gastar PE para substituir um teste por Enganação.",
  "Dedicação": "Recebe PE adicional e aumenta o limite de gasto por turno.",
  "Cicatrizes Psicológicas": "Recebe Sanidade adicional conforme NEX; com PD, melhora resistência a medo.",
};

export const ORIGIN_POWER_CATALOG: AgentPowerCatalogEntry[] = ORIGENS.map((origem) => ({
  id: `origem:${origem.key}`,
  nome: origem.power,
  tipo: "origem",
  origem: origem.label,
  resumo: ORIGIN_POWER_SUMMARIES[origem.power] ?? `Poder de origem de ${origem.label}. Complete detalhes conforme a mesa.`,
  fonte: "Ordem Paranormal RPG - Origens",
}));

export const HEXATOMBE_POWER_CATALOG: AgentPowerCatalogEntry[] = ESTIGMAS.map((estigma) => ({
  id: `hexatombe:${estigma.id}`,
  nome: estigma.poder,
  tipo: "hexatombe",
  requisito: `Sacrifício do ${estigma.nome}`,
  acao: estigma.poderAcao,
  custo_pe: estigma.poderCustoPe,
  resumo: estigma.poderDesc,
  fonte: "Arquivos Secretos - Hexatombe",
}));

export const PARANORMAL_POWER_CATALOG: AgentPowerCatalogEntry[] = [
  {
    id: "paranormal:aprender-ritual",
    nome: "Aprender Ritual",
    tipo: "paranormal",
    resumo: "Você aprende um ritual à escolha e pode trocar um ritual conhecido, respeitando NEX e limite de rituais.",
    fonte: "Ordem Paranormal RPG - Poderes Paranormais",
  },
  {
    id: "paranormal:resistir-elemento",
    nome: "Resistir a <Elemento>",
    tipo: "paranormal",
    resumo: "Escolha Conhecimento, Energia, Morte ou Sangue; você recebe resistência contra o elemento escolhido.",
    fonte: "Ordem Paranormal RPG - Poderes Paranormais",
  },
  {
    id: "paranormal:afinidade-elemental",
    nome: "Afinidade Elemental",
    tipo: "paranormal",
    requisito: "NEX 50%",
    resumo: "Você desenvolve afinidade com um elemento, dispensando componentes daquele elemento e liberando afinidades.",
    fonte: "Ordem Paranormal RPG - Poderes Paranormais",
  },
  {
    id: "paranormal:sangue-ferro",
    nome: "Sangue de Ferro",
    tipo: "paranormal",
    elemento: "sangue",
    resumo: "Seu corpo se torna mais resistente, aumentando sua capacidade de suportar dano.",
    fonte: "Ordem Paranormal RPG - Poderes Paranormais",
  },
  {
    id: "paranormal:anatomia-insana",
    nome: "Anatomia Insana",
    tipo: "paranormal",
    elemento: "sangue",
    requisito: "Sangue 2",
    resumo: "Seu corpo transfigurado pode ignorar dano adicional de críticos e ataques furtivos.",
    fonte: "Ordem Paranormal RPG - Poderes Paranormais",
  },
  {
    id: "paranormal:arma-sangue",
    nome: "Arma de Sangue",
    tipo: "paranormal",
    elemento: "sangue",
    acao: "Movimento",
    custo_pe: 2,
    resumo: "Permite manifestar uma arma orgânica de Sangue ligada ao próprio corpo.",
    fonte: "Ordem Paranormal RPG - Poderes Paranormais",
  },
  {
    id: "paranormal:sangue-fervente",
    nome: "Sangue Fervente",
    tipo: "paranormal",
    elemento: "sangue",
    requisito: "Sangue 2",
    resumo: "Enquanto machucado, a dor desperta força bestial e concede bônus em Agilidade ou Força.",
    fonte: "Ordem Paranormal RPG - Poderes Paranormais",
  },
  {
    id: "paranormal:sangue-vivo",
    nome: "Sangue Vivo",
    tipo: "paranormal",
    elemento: "sangue",
    requisito: "Sangue 1",
    resumo: "Na primeira vez que fica machucado na cena, recebe cura acelerada limitada pela metade dos PV máximos.",
    fonte: "Ordem Paranormal RPG - Poderes Paranormais",
  },
  {
    id: "paranormal:expansao-conhecimento",
    nome: "Expansão de Conhecimento",
    tipo: "paranormal",
    elemento: "conhecimento",
    requisito: "Conhecimento 1",
    resumo: "Você absorve fragmentos de saber impossível para acessar uma habilidade fora do comum.",
    fonte: "Ordem Paranormal RPG - Poderes Paranormais",
  },
  {
    id: "paranormal:percepcao-paranormal",
    nome: "Percepção Paranormal",
    tipo: "paranormal",
    elemento: "conhecimento",
    resumo: "Em cenas de investigação, pode repetir um dado baixo ao procurar pistas, aceitando o novo resultado.",
    fonte: "Ordem Paranormal RPG - Poderes Paranormais",
  },
  {
    id: "paranormal:precognicao",
    nome: "Precognição",
    tipo: "paranormal",
    elemento: "conhecimento",
    requisito: "Conhecimento 1",
    resumo: "Vislumbres do futuro ajudam a reagir melhor contra ameaças e perigos.",
    fonte: "Ordem Paranormal RPG - Poderes Paranormais",
  },
  {
    id: "paranormal:sensitivo",
    nome: "Sensitivo",
    tipo: "paranormal",
    elemento: "conhecimento",
    resumo: "Você sente emoções e intenções, recebendo apoio em interações sociais e leitura de pessoas.",
    fonte: "Ordem Paranormal RPG - Poderes Paranormais",
  },
  {
    id: "paranormal:visao-oculto",
    nome: "Visão do Oculto",
    tipo: "paranormal",
    elemento: "conhecimento",
    resumo: "Sua percepção paranormal melhora testes de Percepção e permite enxergar no escuro.",
    fonte: "Ordem Paranormal RPG - Poderes Paranormais",
  },
  {
    id: "paranormal:potencial-aprimorado",
    nome: "Potencial Aprimorado",
    tipo: "paranormal",
    elemento: "morte",
    resumo: "A Morte distorce seus limites, ampliando sua reserva para usar habilidades.",
    fonte: "Ordem Paranormal RPG - Poderes Paranormais",
  },
  {
    id: "paranormal:encarar-morte",
    nome: "Encarar a Morte",
    tipo: "paranormal",
    elemento: "morte",
    resumo: "Durante cenas de ação, aumenta seu limite de gasto de PE sem alterar a DT dos efeitos.",
    fonte: "Ordem Paranormal RPG - Poderes Paranormais",
  },
  {
    id: "paranormal:escapar-morte",
    nome: "Escapar da Morte",
    tipo: "paranormal",
    elemento: "morte",
    requisito: "Morte 1",
    resumo: "Uma vez por cena, evita cair a 0 PV por dano comum e permanece de pé por pouco.",
    fonte: "Ordem Paranormal RPG - Poderes Paranormais",
  },
  {
    id: "paranormal:potencial-reaproveitado",
    nome: "Potencial Reaproveitado",
    tipo: "paranormal",
    elemento: "morte",
    resumo: "Ao passar em testes de resistência, absorve momentos desperdiçados e ganha PE temporários.",
    fonte: "Ordem Paranormal RPG - Poderes Paranormais",
  },
  {
    id: "paranormal:surto-temporal",
    nome: "Surto Temporal",
    tipo: "paranormal",
    elemento: "morte",
    requisito: "Morte 2",
    acao: "Livre",
    custo_pe: 3,
    resumo: "Manipula brevemente o fluxo do tempo para agir em um ritmo anormal.",
    fonte: "Ordem Paranormal RPG - Poderes Paranormais",
  },
  {
    id: "paranormal:afortunado",
    nome: "Afortunado",
    tipo: "paranormal",
    elemento: "energia",
    resumo: "A Energia distorce a sorte, permitindo resultados improváveis em momentos críticos.",
    fonte: "Ordem Paranormal RPG - Poderes Paranormais",
  },
  {
    id: "paranormal:campo-protetor",
    nome: "Campo Protetor",
    tipo: "paranormal",
    elemento: "energia",
    requisito: "Energia 1",
    acao: "Reação",
    custo_pe: 1,
    resumo: "Cria uma proteção instável de Energia para reduzir ou evitar ameaças imediatas.",
    fonte: "Ordem Paranormal RPG - Poderes Paranormais",
  },
  {
    id: "paranormal:causalidade-fortuita",
    nome: "Causalidade Fortuita",
    tipo: "paranormal",
    elemento: "energia",
    resumo: "Em investigação, a Energia conduz descobertas e reduz a DT para procurar pistas.",
    fonte: "Ordem Paranormal RPG - Poderes Paranormais",
  },
  {
    id: "paranormal:golpe-sorte",
    nome: "Golpe de Sorte",
    tipo: "paranormal",
    elemento: "energia",
    requisito: "Energia 1",
    resumo: "Seus ataques recebem aumento na margem de ameaça, tornando críticos mais prováveis.",
    fonte: "Ordem Paranormal RPG - Poderes Paranormais",
  },
  {
    id: "paranormal:manipular-entropia",
    nome: "Manipular Entropia",
    tipo: "paranormal",
    elemento: "energia",
    requisito: "Energia 1",
    acao: "Reação",
    custo_pe: 2,
    resumo: "Quando outro ser em alcance curto faz um teste, pode forçar a rerrolagem de um dado.",
    fonte: "Ordem Paranormal RPG - Poderes Paranormais",
  },
];

export const AGENT_POWER_CATALOG: AgentPowerCatalogEntry[] = [
  ...ORIGIN_POWER_CATALOG,
  ...PARANORMAL_POWER_CATALOG,
  ...HEXATOMBE_POWER_CATALOG,
];

export function powerToHabilidade(power: AgentPowerCatalogEntry): AgentHabilidade {
  return {
    nome: power.nome,
    descricao: power.resumo,
    acao: power.acao ?? "",
    custo_pe: power.custo_pe ?? 0,
  };
}

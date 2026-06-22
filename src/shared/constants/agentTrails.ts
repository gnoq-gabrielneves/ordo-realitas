import { AgentHabilidade } from "@/shared/types/agent";

export type TrailClass = "Combatente" | "Especialista" | "Ocultista" | "Sobrevivente";

export interface AgentTrailAbility {
  nex: number;
  nome: string;
  descricao: string;
  acao?: string;
  custo_pe?: number;
}

export interface AgentTrailRule {
  id: string;
  classe: TrailClass;
  nome: string;
  resumo: string;
  requisito?: string;
  habilidades: AgentTrailAbility[];
}

export const TRAIL_SOURCE_MARK = "Fonte: Trilha";

export const AGENT_TRAILS: AgentTrailRule[] = [
  {
    id: "combatente-aniquilador",
    classe: "Combatente",
    nome: "Aniquilador",
    resumo: "Especialista em abater alvos com uma arma favorita, reduzindo categoria e destravando técnicas de ataque.",
    habilidades: [
      { nex: 10, nome: "A Favorita", descricao: "Escolha uma arma favorita. A categoria da arma escolhida é reduzida em I." },
      { nex: 40, nome: "Técnica Secreta", descricao: "A categoria da arma favorita passa a ser reduzida em II. Ao atacar com ela, pode gastar 2 PE para adicionar efeitos como Amplo ou Destruidor.", custo_pe: 2 },
      { nex: 65, nome: "Técnica Sublime", descricao: "Adiciona efeitos à Técnica Secreta, como Letal e Perfurante." },
      { nex: 99, nome: "Máquina de Matar", descricao: "A categoria da arma favorita passa a ser reduzida em III, recebe +2 na margem de ameaça e o dano aumenta em um dado do mesmo tipo." },
    ],
  },
  {
    id: "combatente-comandante",
    classe: "Combatente",
    nome: "Comandante de Campo",
    resumo: "Coordena aliados em combate, concedendo rerrolagens e ações extras em momentos decisivos.",
    habilidades: [
      { nex: 10, nome: "Inspirar Confiança", descricao: "Gaste uma reação e 2 PE para fazer um aliado em alcance curto rolar novamente um teste recém realizado.", acao: "Reação", custo_pe: 2 },
      { nex: 40, nome: "Estrategista", descricao: "Gaste uma ação padrão e 1 PE por aliado em alcance curto, limitado pelo Intelecto. No próximo turno, cada aliado afetado ganha uma ação de movimento adicional.", acao: "Padrão", custo_pe: 1 },
      { nex: 65, nome: "Brecha na Guarda", descricao: "Uma vez por rodada, quando um aliado causar dano em alcance curto, gaste reação e 2 PE para permitir um ataque adicional contra o mesmo inimigo.", acao: "Reação", custo_pe: 2 },
      { nex: 99, nome: "Oficial Comandante", descricao: "Gaste uma ação padrão e 5 PE para que cada aliado visível em alcance médio receba uma ação padrão adicional no próximo turno.", acao: "Padrão", custo_pe: 5 },
    ],
  },
  {
    id: "combatente-guerreiro",
    classe: "Combatente",
    nome: "Guerreiro",
    resumo: "Foca em ataques corpo a corpo, manobras e contra-ataques.",
    habilidades: [
      { nex: 10, nome: "Técnica Letal", descricao: "Recebe +2 na margem de ameaça com todos os ataques corpo a corpo." },
      { nex: 40, nome: "Revidar", descricao: "Sempre que bloquear um ataque, pode gastar uma reação e 2 PE para fazer um ataque corpo a corpo contra quem atacou.", acao: "Reação", custo_pe: 2 },
      { nex: 65, nome: "Força Opressora", descricao: "Ao acertar um ataque corpo a corpo, pode gastar 1 PE para realizar uma manobra derrubar ou empurrar como ação livre.", acao: "Livre", custo_pe: 1 },
      { nex: 99, nome: "Potência Máxima", descricao: "Ao usar Ataque Especial com armas corpo a corpo, todos os bônus numéricos são dobrados." },
    ],
  },
  {
    id: "combatente-operacoes",
    classe: "Combatente",
    nome: "Operações Especiais",
    resumo: "Ações otimizadas, ataques extras e economia de ações.",
    habilidades: [
      { nex: 10, nome: "Iniciativa Aprimorada", descricao: "Recebe +5 em Iniciativa e uma ação de movimento adicional na primeira rodada." },
      { nex: 40, nome: "Ataque Extra", descricao: "Uma vez por rodada, quando faz um ataque, pode gastar 2 PE para fazer um ataque adicional.", custo_pe: 2 },
      { nex: 65, nome: "Surto de Adrenalina", descricao: "Uma vez por rodada, pode gastar 5 PE para realizar uma ação padrão ou de movimento adicional.", custo_pe: 5 },
      { nex: 99, nome: "Sempre Alerta", descricao: "Recebe uma ação padrão adicional no início de cada cena de combate." },
    ],
  },
  {
    id: "combatente-tropa",
    classe: "Combatente",
    nome: "Tropa de Choque",
    resumo: "Defesa corporal, proteção de aliados e resistência a dano.",
    habilidades: [
      { nex: 10, nome: "Casca Grossa", descricao: "Recebe +1 PV para cada 5% de NEX. Ao bloquear, soma Vigor na resistência a dano recebida." },
      { nex: 40, nome: "Cai Dentro", descricao: "Quando um oponente em alcance curto ataca um aliado, pode gastar reação e 1 PE para tentar forçá-lo a atacar você.", acao: "Reação", custo_pe: 1 },
      { nex: 65, nome: "Duro de Matar", descricao: "Ao sofrer dano não paranormal, pode gastar reação e 2 PE para reduzir esse dano à metade. Em NEX 85%, também funciona contra dano paranormal.", acao: "Reação", custo_pe: 2 },
      { nex: 99, nome: "Inquebrável", descricao: "Enquanto machucado, recebe +5 na Defesa e resistência a dano 5. Enquanto morrendo, não fica indefeso e ainda pode agir." },
    ],
  },
  {
    id: "especialista-atirador",
    classe: "Especialista",
    nome: "Atirador de Elite",
    resumo: "Precisão com armas de fogo, margem de ameaça e críticos devastadores.",
    habilidades: [
      { nex: 10, nome: "Mira de Elite", descricao: "Recebe proficiência com armas de fogo que usam balas longas e soma Intelecto em rolagens de dano com essas armas." },
      { nex: 40, nome: "Disparo Letal", descricao: "Ao mirar, pode gastar 1 PE para aumentar em +2 a margem de ameaça do próximo ataque até o fim do próximo turno.", custo_pe: 1 },
      { nex: 65, nome: "Disparo Impactante", descricao: "Ao atacar com arma de fogo, pode gastar 2 PE e trocar o dano por uma manobra derrubar, desarmar, empurrar ou quebrar.", custo_pe: 2 },
      { nex: 99, nome: "Atirar para Matar", descricao: "Ao fazer um acerto crítico com arma de fogo, causa dano máximo sem rolar dados." },
    ],
  },
  {
    id: "especialista-infiltrador",
    classe: "Especialista",
    nome: "Infiltrador",
    resumo: "Ataques furtivos, mobilidade escondida e execução de alvos vulneráveis.",
    habilidades: [
      { nex: 10, nome: "Ataque Furtivo", descricao: "Uma vez por rodada, ao atingir alvo desprevenido, flanqueado ou em alcance curto, gaste 1 PE para causar dano extra. O dado aumenta conforme o NEX.", custo_pe: 1 },
      { nex: 40, nome: "Gatuno", descricao: "Recebe +5 em Atletismo e Crime e pode se esconder percorrendo deslocamento normal sem penalidade." },
      { nex: 65, nome: "Assassinar", descricao: "Gaste uma ação de movimento e 3 PE para analisar um alvo em alcance curto. O próximo Ataque Furtivo contra ele dobra dados extras e pode deixá-lo inconsciente ou morrendo.", acao: "Movimento", custo_pe: 3 },
      { nex: 99, nome: "Sombra Fugaz", descricao: "Ao fazer Furtividade após atacar ou executar ação chamativa, pode gastar 3 PE para não sofrer a penalidade.", custo_pe: 3 },
    ],
  },
  {
    id: "especialista-medico",
    classe: "Especialista",
    nome: "Médico de Campo",
    resumo: "Cura, remoção de condições e resgate em combate.",
    requisito: "Treinado em Medicina e kit de medicina para usar as habilidades.",
    habilidades: [
      { nex: 10, nome: "Paramédico", descricao: "Use uma ação padrão e 2 PE para curar 2d10 PV de si ou de um aliado adjacente. A cura aumenta em NEX 40%, 65% e 99%.", acao: "Padrão", custo_pe: 2 },
      { nex: 40, nome: "Equipe de Trauma", descricao: "Use uma ação padrão e 2 PE para remover uma condição negativa de um aliado adjacente, exceto morrendo.", acao: "Padrão", custo_pe: 2 },
      { nex: 65, nome: "Resgate", descricao: "Uma vez por rodada, pode se aproximar de aliado machucado ou morrendo em alcance curto como ação livre. Curar ou remover condição concede +5 Defesa a ambos até seu próximo turno." },
      { nex: 99, nome: "Reanimação", descricao: "Uma vez por cena, gaste uma ação completa e 10 PE para trazer de volta à vida alguém que morreu na mesma cena, exceto por dano massivo.", acao: "Completa", custo_pe: 10 },
    ],
  },
  {
    id: "especialista-negociador",
    classe: "Especialista",
    nome: "Negociador",
    resumo: "Controle social, inspiração e contatos narrativos.",
    habilidades: [
      { nex: 10, nome: "Eloquência", descricao: "Use uma ação completa e 1 PE por alvo em alcance curto para afetar pessoas com Diplomacia, Enganação ou Intimidação contra Vontade.", acao: "Completa", custo_pe: 1 },
      { nex: 40, nome: "Discurso Motivador", descricao: "Gaste uma ação padrão e 4 PE para inspirar aliados em alcance curto, concedendo bônus em testes de perícia até o fim da cena.", acao: "Padrão", custo_pe: 4 },
      { nex: 65, nome: "Eu Conheço um Cara", descricao: "Uma vez por missão, ativa uma rede de contatos para pedir um favor relevante, a critério do mestre." },
      { nex: 99, nome: "Truque de Mestre", descricao: "Gaste 5 PE para simular uma habilidade vista de um aliado durante a cena, pagando custos e usando seus parâmetros.", custo_pe: 5 },
    ],
  },
  {
    id: "especialista-tecnico",
    classe: "Especialista",
    nome: "Técnico",
    resumo: "Carga ampliada, manutenção de equipamento e improviso.",
    habilidades: [
      { nex: 10, nome: "Inventário Otimizado", descricao: "Soma Intelecto à Força para calcular capacidade de carga." },
      { nex: 40, nome: "Remendão", descricao: "Gaste ação completa e 1 PE para remover a condição quebrado de equipamento adjacente até o fim da cena. Equipamentos gerais têm categoria reduzida em I para você.", acao: "Completa", custo_pe: 1 },
      { nex: 65, nome: "Improvisar", descricao: "Gaste ação completa e PE conforme a categoria para improvisar equipamento geral funcional até o fim da cena.", acao: "Completa" },
      { nex: 99, nome: "Preparado para Tudo", descricao: "Sempre que precisar de um item qualquer, exceto armas, pode gastar ação de movimento e 3 PE por categoria para lembrar que trouxe o item.", acao: "Movimento", custo_pe: 3 },
    ],
  },
  {
    id: "ocultista-conduite",
    classe: "Ocultista",
    nome: "Conduíte",
    resumo: "Alcance, velocidade e interferência de rituais.",
    habilidades: [
      { nex: 10, nome: "Ampliar Ritual", descricao: "Ao lançar um ritual, pode gastar +2 PE para aumentar alcance em um passo ou dobrar área de efeito.", custo_pe: 2 },
      { nex: 40, nome: "Acelerar Ritual", descricao: "Uma vez por rodada, pode aumentar o custo de um ritual em 4 PE para conjurá-lo como ação livre.", custo_pe: 4 },
      { nex: 65, nome: "Anular Ritual", descricao: "Quando for alvo de um ritual, pode gastar PE igual ao custo pago e fazer teste oposto de Ocultismo para anulá-lo." },
      { nex: 99, nome: "Canalizar o Medo", descricao: "Aprende o ritual Canalizar o Medo." },
    ],
  },
  {
    id: "ocultista-flagelador",
    classe: "Ocultista",
    nome: "Flagelador",
    resumo: "Usa dor e PV como combustível paranormal.",
    habilidades: [
      { nex: 10, nome: "Poder do Flagelo", descricao: "Ao conjurar ritual, pode gastar PV para pagar PE, à taxa de 2 PV por PE. PV gastos assim só voltam com descanso." },
      { nex: 40, nome: "Abraçar a Dor", descricao: "Ao sofrer dano não paranormal, pode gastar reação e 2 PE para reduzir esse dano à metade.", acao: "Reação", custo_pe: 2 },
      { nex: 65, nome: "Absorver Agonia", descricao: "Ao reduzir inimigos a 0 PV com ritual, recebe PE temporários igual ao círculo do ritual usado." },
      { nex: 99, nome: "Medo Tangível", descricao: "Aprende o ritual Medo Tangível." },
    ],
  },
  {
    id: "ocultista-graduado",
    classe: "Ocultista",
    nome: "Graduado",
    resumo: "Mais rituais, grimório e DT ritualística elevada.",
    habilidades: [
      { nex: 10, nome: "Saber Ampliado", descricao: "Aprende um ritual de 1º círculo. Sempre que ganha acesso a novo círculo, aprende um ritual adicional daquele círculo." },
      { nex: 40, nome: "Grimório Ritualístico", descricao: "Cria um grimório que armazena rituais extras iguais ao Intelecto. O grimório ocupa 1 espaço e exige ação completa para relembrar ritual." },
      { nex: 65, nome: "Rituais Eficientes", descricao: "A DT para resistir a todos os seus rituais aumenta em +5." },
      { nex: 99, nome: "Conhecendo o Medo", descricao: "Aprende o ritual Conhecendo o Medo." },
    ],
  },
  {
    id: "ocultista-intuitivo",
    classe: "Ocultista",
    nome: "Intuitivo",
    resumo: "Resistência mental e paranormal para sustentar contato com o Outro Lado.",
    habilidades: [
      { nex: 10, nome: "Mente Sã", descricao: "Recebe resistência paranormal +5, aplicada a testes de resistência contra efeitos paranormais." },
      { nex: 40, nome: "Presença Poderosa", descricao: "Adiciona Presença ao limite de PE por turno apenas para conjurar rituais." },
      { nex: 65, nome: "Inabalável", descricao: "Recebe resistência a dano mental e paranormal 10. Em efeitos paranormais com Vontade para reduzir dano à metade, não sofre dano se passar." },
      { nex: 99, nome: "Presença do Medo", descricao: "Aprende o ritual Presença do Medo." },
    ],
  },
  {
    id: "ocultista-lamina",
    classe: "Ocultista",
    nome: "Lâmina Paranormal",
    resumo: "Mistura rituais e ataques corpo a corpo.",
    habilidades: [
      { nex: 10, nome: "Lâmina Maldita", descricao: "Aprende Amaldiçoar Arma. Se já conhece, pode gastar +1 PE para reduzir conjuração para movimento. Pode usar Ocultismo em ataques com arma amaldiçoada.", custo_pe: 1 },
      { nex: 40, nome: "Gladiador Paranormal", descricao: "Ao acertar ataque corpo a corpo, recebe 2 PE temporários, limitado pelo seu limite de PE por cena." },
      { nex: 65, nome: "Conjuração Marcial", descricao: "Uma vez por rodada, ao lançar ritual de ação padrão, pode gastar 2 PE para fazer ataque corpo a corpo como ação livre.", custo_pe: 2 },
      { nex: 99, nome: "Lâmina do Medo", descricao: "Aprende o ritual Lâmina do Medo." },
    ],
  },
];

export function getTrailsForClass(classe?: string | null) {
  return AGENT_TRAILS.filter((trail) => trail.classe === classe);
}

export function findTrailRule(nome?: string | null) {
  if (!nome) return null;
  return AGENT_TRAILS.find((trail) => trail.nome === nome || trail.id === nome) ?? null;
}

export function trailAbilityToHabilidade(trail: AgentTrailRule, ability: AgentTrailAbility): AgentHabilidade {
  return {
    nome: ability.nome,
    descricao: `${ability.descricao}\n\n${TRAIL_SOURCE_MARK}: ${trail.nome} (${ability.nex}% NEX).`,
    acao: ability.acao ?? "",
    custo_pe: ability.custo_pe ?? 0,
  };
}

export function buildTrailHabilidades(trilha?: string | null, nex = 0): AgentHabilidade[] {
  const trail = findTrailRule(trilha);
  if (!trail) return [];
  return trail.habilidades
    .filter((ability) => nex >= ability.nex)
    .map((ability) => trailAbilityToHabilidade(trail, ability));
}

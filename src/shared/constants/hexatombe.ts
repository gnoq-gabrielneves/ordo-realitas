// Conteúdo derivado dos Arquivos Secretos #2 e #3 (Hexatombe) — Ordem Paranormal RPG

export type EstigmaId =
  | "desejo"
  | "rancor"
  | "obsessao"
  | "prazer"
  | "orgulho"
  | "culpa";

export interface Estigma {
  id: EstigmaId;
  nome: string;
  palavras: string[]; // sentimentos/temas associados
  clamor: string; // a frase ritualística da Coroa de Espinhos
  poder: string; // nome do poder de sacrifício
  poderDesc: string; // descrição resumida do poder de sacrifício
  poderAcao: string; // ação do poder (Padrão, Completa, Passiva...)
  poderCustoPe: number; // custo em PE do poder
  cor: string; // classes tailwind de acento (texto)
  corBorda: string;
  corBg: string;
}

export const ESTIGMAS: Estigma[] = [
  {
    id: "desejo",
    nome: "Desejo",
    palavras: ["Ambição", "Inveja"],
    clamor: "Encare o limiar e retorne à tua forma prístina.",
    poder: "Fruto da Ambição",
    poderDesc:
      "Escolha um poder ou ritual que conheça. Além do efeito padrão, a habilidade se torna um gatilho para assumir sua forma suprema (funciona como As Máscaras).",
    poderAcao: "Passiva",
    poderCustoPe: 0,
    cor: "text-emerald-400",
    corBorda: "border-emerald-500/40",
    corBg: "bg-emerald-500/10",
  },
  {
    id: "rancor",
    nome: "Rancor",
    palavras: ["Frustração", "Ansiedade", "Ira"],
    clamor: "Liberta tua cólera primordial e aniquila a díade.",
    poder: "Ódio Suprimido",
    poderDesc:
      "Ação completa + 3 PE: explode de raiva. Seres em alcance curto fazem Fortitude e Reflexos (DT Pre +5). Falha em Fortitude: espancado, caído e sofre seu dano corpo a corpo. Falha em Reflexos: sofre seu dano à distância. Depois você fica exausto até o fim da cena.",
    poderAcao: "Completa",
    poderCustoPe: 3,
    cor: "text-orange-400",
    corBorda: "border-orange-500/40",
    corBg: "bg-orange-500/10",
  },
  {
    id: "obsessao",
    nome: "Obsessão",
    palavras: ["Servidão", "Paixão"],
    clamor: "Testifica tua lealdade e sangra sob as mãos de teu vínculo.",
    poder: "Despertar Obsessão",
    poderDesc:
      "Ação padrão + 3 PE: encara um alvo em alcance curto. Desviar o olhar: o alvo fica desprevenido contra você e aliados por 1 rodada. Encarar de volta: Vontade (DT Pre +5); se falhar, fica obcecado por 1 rodada — gasta ações para se aproximar e adorar você, ou se automutila.",
    poderAcao: "Padrão",
    poderCustoPe: 3,
    cor: "text-pink-400",
    corBorda: "border-pink-500/40",
    corBg: "bg-pink-500/10",
  },
  {
    id: "prazer",
    nome: "Prazer",
    palavras: ["Euforia", "Luxúria", "Gula"],
    clamor:
      "Farta-te em um banquete superior à tua fome e sorva insaciável além da tua sede.",
    poder: "Estimular Hedonismo",
    poderDesc:
      "Ação padrão + 3 PE: um alvo em alcance curto é tomado por uma onda de prazer insana. Vontade (DT Pre +5) evita. Se falhar, perde qualquer senso de autopreservação e fica indefeso por 1 rodada.",
    poderAcao: "Padrão",
    poderCustoPe: 3,
    cor: "text-fuchsia-400",
    corBorda: "border-fuchsia-500/40",
    corBg: "bg-fuchsia-500/10",
  },
  {
    id: "orgulho",
    nome: "Orgulho",
    palavras: ["Desprezo", "Arrogância"],
    clamor: "Abata incólume o indigno que ousaria te flagelar.",
    poder: "Arrogância Diabólica",
    poderDesc:
      "Ação padrão + 3 PE: diz a um alvo em alcance médio que ele pode fazer tudo que quiser. Vontade (DT Pre +5); se falhar, faz uma ação imprudente no próximo turno. Se passar, sofre 2d6 de dano mental que não pode ser evitado nem resistido.",
    poderAcao: "Padrão",
    poderCustoPe: 3,
    cor: "text-amber-400",
    corBorda: "border-amber-500/40",
    corBg: "bg-amber-500/10",
  },
  {
    id: "culpa",
    nome: "Culpa",
    palavras: ["Vergonha", "Arrependimento", "Sofrimento"],
    clamor: "Carrega o fardo daquele sucumbido em teu amparo.",
    poder: "Causar Culpa",
    poderDesc:
      "Ação padrão + 3 PE: causa culpa terrível em um alvo em alcance curto até o fim da cena. Vontade (DT Pre +5) evita. Se falhar, revive vividamente as piores coisas que fez e se sente merecedor de todo sofrimento, ficando indefeso. Novo teste no início de cada turno para se libertar.",
    poderAcao: "Padrão",
    poderCustoPe: 3,
    cor: "text-sky-400",
    corBorda: "border-sky-500/40",
    corBg: "bg-sky-500/10",
  },
];

export function getEstigma(id?: string | null): Estigma | undefined {
  return ESTIGMAS.find((e) => e.id === id);
}

export function getEstigmas(ids?: string[] | null): Estigma[] {
  if (!ids?.length) return [];
  return ESTIGMAS.filter((e) => ids.includes(e.id));
}

// Habilidade (poder de sacrifício) correspondente a um estigma.
export function estigmaHabilidade(e: Estigma) {
  return {
    nome: e.poder,
    descricao: e.poderDesc,
    acao: e.poderAcao,
    custo_pe: e.poderCustoPe,
  };
}

// Regras da Forma Suprema / Intenção Assassina (AS#2, p.97 — "As Máscaras na Sua Mesa")
export const FORMA_SUPREMA = {
  custoSan: 6,
  custoSanRodadaExtra: 2,
  bonusPv: 20,
  bonusPe: 10,
  bonusDefesa: 10,
  bonusTeste: 5, // +5 em testes de qualquer tipo
  bonusDt: 5, // +5 na DT das habilidades
  bonusDadosDano: 2, // +2 dados do mesmo tipo em todo dano
  ativacao: "1 ação de movimento",
  // Efeitos passivos enquanto a forma está ativa
  passivos: [
    "Conjura rituais sem gastar PE por eles.",
    "Todos os seus danos aumentam em +2 dados do mesmo tipo.",
    "Você recebe +5 em testes de qualquer tipo.",
    "A DT das suas habilidades (poderes, rituais etc.) aumenta em +5.",
    "Até 3 habilidades novas ou 3 habilidades existentes recebem um efeito novo.",
  ],
  avisos: [
    "Ativar custa 1 ação de movimento e 6 SAN (+2 SAN por rodada adicional além da primeira).",
    "Desativar é uma ação livre. Ao perder os PV recebidos, se ficar com menos de 20 PV atuais, você vai a 0 PV e fica morrendo.",
    "Se ficar insano enquanto desperto, seu personagem se torna um NPC controlado pela intenção assassina.",
  ],
} as const;

// Penalidades de Desertor (AS#2, p.11) — quando a equipe perde seu sacrifício
export const DESERTOR_REGRAS = {
  testesBase: "-1 em todos os testes",
  pvMetade: "Pontos de vida máximos reduzidos pela metade",
  fortitude:
    "A cada novo sacrifício, faça Fortitude (DT 20) ou fica inconsciente até o amanhecer.",
  acumulo:
    "A cada sacrifício: perde 1d10 PV máx/atual e sofre -1 em testes, cumulativo até -6d10 PV e -6 em testes.",
  acumuloMax: 6,
} as const;

export const HEXATOMBE_RULE_CARDS = [
  {
    titulo: "Digno de Sacrifício",
    subtitulo: "Quem pode entrar na Hexatombe",
    texto:
      "Para ser sacrifício da Hexatombe, o personagem precisa ter carregado o Trono em algum momento, tornando-se portador do Diabo.",
  },
  {
    titulo: "Poderes de Sacrifício",
    subtitulo: "Um estigma, um poder",
    texto:
      "Cada estigma representa um desejo ou trauma explorado pela Coroa de Espinhos e adiciona seu poder correspondente à ficha.",
  },
  {
    titulo: "Batalha de Intenções",
    subtitulo: "Quando a obsessão vira confronto",
    texto:
      "Quando duas intenções entram em conflito direto, os lados envolvidos causam +1d10 de dano contra o alvo da intenção e reduzem pela metade danos vindos de fora desse conflito.",
  },
  {
    titulo: "Trocas de Recursos",
    subtitulo: "Informação e segredo",
    texto:
      "Em cenas de negociação, uma informação costuma custar 1 recurso. Um segredo relevante custa 3 recursos.",
  },
] as const;

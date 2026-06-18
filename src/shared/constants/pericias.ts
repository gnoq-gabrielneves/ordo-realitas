export type Atributo = "AGI" | "FOR" | "INT" | "PRE" | "VIG";

export interface PericiaDefinition {
  key: string;
  nome: string;
  atributo: Atributo;
  somentetreinada: boolean;
  penalidade?: boolean;
  custom?: boolean;
}

export const PERICIAS: PericiaDefinition[] = [
  { key: "acrobacia",    nome: "Acrobacia",    atributo: "AGI", somentetreinada: false, penalidade: true },
  { key: "adestramento", nome: "Adestramento", atributo: "PRE", somentetreinada: true },
  { key: "artes",        nome: "Artes",        atributo: "PRE", somentetreinada: true },
  { key: "atletismo",    nome: "Atletismo",    atributo: "FOR", somentetreinada: false },
  { key: "atualidades",  nome: "Atualidades",  atributo: "INT", somentetreinada: false },
  { key: "ciencias",     nome: "Ciências",     atributo: "INT", somentetreinada: true },
  { key: "crime",        nome: "Crime",        atributo: "AGI", somentetreinada: true, penalidade: true },
  { key: "diplomacia",   nome: "Diplomacia",   atributo: "PRE", somentetreinada: false },
  { key: "enganacao",    nome: "Enganação",    atributo: "PRE", somentetreinada: false },
  { key: "fortitude",    nome: "Fortitude",    atributo: "VIG", somentetreinada: false },
  { key: "furtividade",  nome: "Furtividade",  atributo: "AGI", somentetreinada: false, penalidade: true },
  { key: "iniciativa",   nome: "Iniciativa",   atributo: "AGI", somentetreinada: false },
  { key: "intimidacao",  nome: "Intimidação",  atributo: "PRE", somentetreinada: false },
  { key: "intuicao",     nome: "Intuição",     atributo: "PRE", somentetreinada: false },
  { key: "investigacao", nome: "Investigação", atributo: "INT", somentetreinada: false },
  { key: "luta",         nome: "Luta",         atributo: "FOR", somentetreinada: false },
  { key: "medicina",     nome: "Medicina",     atributo: "INT", somentetreinada: false },
  { key: "ocultismo",    nome: "Ocultismo",    atributo: "INT", somentetreinada: true },
  { key: "percepcao",    nome: "Percepção",    atributo: "PRE", somentetreinada: false },
  { key: "pilotagem",    nome: "Pilotagem",    atributo: "AGI", somentetreinada: true },
  { key: "pontaria",     nome: "Pontaria",     atributo: "AGI", somentetreinada: false },
  { key: "profissao1",   nome: "Profissão",    atributo: "INT", somentetreinada: true, custom: true },
  { key: "profissao2",   nome: "Profissão",    atributo: "INT", somentetreinada: true, custom: true },
  { key: "reflexos",     nome: "Reflexos",     atributo: "AGI", somentetreinada: false },
  { key: "religiao",     nome: "Religião",     atributo: "PRE", somentetreinada: true },
  { key: "sobrevivencia",nome: "Sobrevivência",atributo: "INT", somentetreinada: false },
  { key: "tatica",       nome: "Tática",       atributo: "INT", somentetreinada: true },
  { key: "tecnologia",   nome: "Tecnologia",   atributo: "INT", somentetreinada: true },
  { key: "vontade",      nome: "Vontade",      atributo: "PRE", somentetreinada: false },
];

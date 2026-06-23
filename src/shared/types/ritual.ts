export type RitualElemento = "conhecimento" | "energia" | "morte" | "sangue" | "medo";
export type RitualCirculo = 1 | 2 | 3 | 4;

export const CUSTO_PE: Record<RitualCirculo, number> = { 1: 1, 2: 3, 3: 6, 4: 10 };

export interface Ritual {
  id: string;
  user_id: string | null;
  nome: string;
  elemento: RitualElemento;
  circulo: RitualCirculo;
  execucao: string;
  alcance: string;
  alvo: string | null;
  duracao: string | null;
  resistencia: string | null;
  dt: number | null;
  custo_pe: number;
  dano: string | null;
  area: string | null;
  tipo: string | null;
  componentes: string | null;
  discente: string | null;
  discente_custo: number | null;
  verdadeiro: string | null;
  verdadeiro_custo: number | null;
  requisitos: string | null;
  descricao: string | null;
  image_url: string | null;
  tags: string[];
  fonte: string;
  oficial: boolean;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type RitualPayload = Omit<Ritual, "id" | "user_id" | "created_at" | "updated_at"> & { user_id?: string };

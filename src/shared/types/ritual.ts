export type RitualElemento = "conhecimento" | "energia" | "morte" | "sangue" | "medo";
export type RitualCirculo = 1 | 2 | 3 | 4;

export const CUSTO_PE: Record<RitualCirculo, number> = { 1: 1, 2: 3, 3: 6, 4: 10 };

export interface Ritual {
  id: string;
  user_id: string;
  nome: string;
  elemento: RitualElemento;
  circulo: RitualCirculo;
  execucao: string;
  alcance: string;
  alvo: string | null;
  duracao: string | null;
  resistencia: string | null;
  dt: number | null;
  descricao: string | null;
  created_at: string;
  updated_at: string;
}

export type RitualPayload = Omit<Ritual, "id" | "user_id" | "created_at" | "updated_at"> & { user_id?: string };

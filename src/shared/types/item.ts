export type ItemCategoria = "arma" | "protecao" | "geral";
export type ItemSubcategoriaArma = "simples" | "tatica" | "pesada";
export type ItemSubcategoriaProtecao = "leve" | "pesada";
export type CreditoTier = 1 | 2 | 3 | 4;

export interface Item {
  id: string;
  user_id: string;
  nome: string;
  categoria: ItemCategoria;
  subcategoria: string | null;
  espacos: number;
  // Armas
  dano: string | null;
  teste: string | null;
  critico: string | null;
  alcance: string | null;
  especial: string | null;
  // Proteções
  protecao_valor: string | null;
  penalidade: string | null;
  // Geral
  descricao: string | null;
  credito_tier: CreditoTier;
  created_at: string;
  updated_at: string;
}

export type ItemPayload = Omit<Item, "id" | "user_id" | "created_at" | "updated_at"> & { user_id?: string };

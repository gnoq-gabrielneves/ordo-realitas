export type ItemCategoria = "arma" | "protecao" | "geral" | "municao" | "modificacao";
export type ItemSubcategoriaArma = "simples" | "tatica" | "pesada";
export type ItemSubcategoriaProtecao = "leve" | "pesada" | "escudo";
export type ItemCategoriaValor = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type CreditoTier = ItemCategoriaValor;

export interface Item {
  id: string;
  user_id: string | null;
  nome: string;
  categoria: ItemCategoria;
  subcategoria: string | null;
  categoria_valor: ItemCategoriaValor;
  espacos: number;
  espacos_texto: string | null;
  proficiencia: string | null;
  tipo_arma: string | null;
  empunhadura: string | null;
  // Armas
  dano: string | null;
  teste: string | null;
  critico: string | null;
  alcance: string | null;
  tipo_dano: string | null;
  especial: string | null;
  // Proteções
  protecao_valor: string | null;
  defesa_bonus: number | null;
  rd: string | null;
  penalidade: string | null;
  // Geral
  descricao: string | null;
  image_url: string | null;
  bonus_pericia: string | null;
  acao_uso: string | null;
  custo_pe: number | null;
  dt: string | null;
  duracao: string | null;
  resistencia: string | null;
  requisitos: string | null;
  tags: string[];
  fonte: string;
  oficial: boolean;
  data: Record<string, unknown>;
  /** @deprecated use categoria_valor */
  credito_tier: CreditoTier;
  created_at: string;
  updated_at: string;
}

export type ItemPayload = Omit<Item, "id" | "user_id" | "created_at" | "updated_at"> & { user_id?: string };

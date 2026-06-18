export type GrauPericia = 0 | 1 | 2 | 3; // leigo, treinado, veterano, expert

export interface AgentPericiaEntry {
  treinado: boolean; // mantido para compatibilidade
  grau?: GrauPericia;
  outros: number;
}

export interface AgentAtaque {
  nome: string;
  teste: string;
  dano: string;
  critico: string;
  alcance: string;
  especial: string;
}

export interface AgentRitualRef {
  ritual_id: string;
  nome: string;
  elemento: string;
  circulo: number;
  custo_pe: number;
}

export interface AgentInventarioItem {
  item_id: string | null;
  nome: string;
  categoria: string;
  espacos: number;
}

export interface AgentHabilidade {
  nome: string;
  descricao: string;
  acao?: string;
  custo_pe?: number;
}

export type TipoFicha = "padrao" | "hexatombe";

// Bloco da Forma Suprema (Intenção Assassina) — a "ficha desperta".
// Compartilha com a base: atributos, classe, origem, NEX, inventário, perfil e lore.
// Sobrescreve apenas os campos de combate quando a forma está ativa.
export interface AgentFormaSuprema {
  pv_max: number;
  pv_atual: number;
  pe_max: number;
  pe_atual: number;
  san_max: number;
  san_atual: number;
  usa_pd: boolean;
  pd_max: number;
  pd_atual: number;
  defesa_bonus: number;
  defesa_equip: number;
  deslocamento: string;
  pericias: Record<string, AgentPericiaEntry>;
  ataques: AgentAtaque[];
  habilidades: AgentHabilidade[];
  rituais: AgentRitualRef[];
}

export interface AgentSheet {
  id: string;
  profile_id: string | null;
  user_id: string;
  nome: string | null;
  image_url: string | null;
  origem: string | null;
  classe: string | null;
  trilha: string | null;
  // Hexatombe
  tipo: TipoFicha;
  codinome: string | null; // nome do assassino / máscara (ex: "Mutilador Noturno")
  estigmas: string[]; // EstigmaId[] — adquiridos ao longo da campanha
  forma_ativa: boolean; // intenção assassina desperta?
  forma_suprema: AgentFormaSuprema | null;
  desertor: boolean;
  desertor_acumulo: number; // nº de sacrifícios sofridos (0-6)
  nex: number;
  agi: number;
  forca: number;
  intelecto: number;
  presenca: number;
  vigor: number;
  pv_max: number;
  pv_atual: number;
  pe_max: number;
  pe_atual: number;
  san_max: number;
  san_atual: number;
  usa_pd: boolean;
  pd_max: number;
  pd_atual: number;
  pe_por_rodada: number;
  deslocamento: string;
  defesa_bonus: number;
  defesa_equip: number;
  protecao: string | null;
  resistencias: string | null;
  prof_arma_simples: boolean;
  prof_arma_tatica: boolean;
  prof_arma_pesada: boolean;
  prof_prot_leve: boolean;
  prof_prot_pesada: boolean;
  pericias: Record<string, AgentPericiaEntry>;
  ataques: AgentAtaque[];
  habilidades: AgentHabilidade[];
  rituais: AgentRitualRef[];
  inventario: AgentInventarioItem[];
  limite_credito: number;
  carga_max: number;
  pontos_prestigio: number;
  patente: string | null;
  aparencia: string | null;
  personalidade: string | null;
  historico: string | null;
  objetivo: string | null;
  created_at: string;
  updated_at: string;
}

export type AgentSheetPayload = Omit<AgentSheet, "id" | "user_id" | "created_at" | "updated_at">;

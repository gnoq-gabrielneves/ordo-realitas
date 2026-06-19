export type NpcTipo = "pessoa" | "criatura";
export type NpcTamanho = "pequeno" | "medio" | "grande" | "enorme" | "colossal";
export type NpcOrigem = "sangue" | "morte" | "medo" | "conhecimento" | "energia";

export interface NpcPericia {
  nome: string;
  bonus: string;
}

export interface NpcResistencia {
  tipo: string;
  valor: string;
}

// Desfecho/ramificação (ex: "Partiu pra trocação" / "Tentou se defender").
export interface NpcOpcao {
  titulo: string;
  texto: string;
}

export interface NpcHabilidade {
  nome: string;
  descricao: string;
  acao?: string; // tipo de ação (Passiva, Livre, Reação, Movimento, Padrão, Completa)
  resistencia?: string; // perícia/teste que evita (ex: Reflexos, Vontade, Fortitude, Atletismo)
  resistencia_dt?: string; // DT do teste (ex: "20", "Pre +5")
  opcoes?: NpcOpcao[]; // desfechos condicionais
}

export type NpcAcaoTipo = "padrao" | "movimento" | "livre" | "completa" | "reacao";

export interface NpcAcao {
  tipo: NpcAcaoTipo;
  nome: string;
  descricao: string;
  teste?: string;
  dano?: string;
  critico?: string;
  quantidade?: number; // número de ataques (ex: 2 = ataca duas vezes)
}

export interface NpcRitual {
  nome: string;
  elemento: string;
  grau: string;
  dt?: string;
  custo_pe?: number; // PE da forma padrão (informativo)
  descricao: string;
}

export interface Npc {
  id: string;
  user_id: string;
  name: string;
  image_url: string | null;
  tipo: NpcTipo | null;
  tamanho: NpcTamanho | null;
  vd: number | null;
  origem: NpcOrigem | null;
  descricao: string | null;
  backstory: string | null;
  percepcao: string | null;
  iniciativa: string | null;
  percepcao_as_cegas: boolean;
  agi: number | null;
  atrib_for: number | null;
  atrib_int: number | null;
  pre: number | null;
  vig: number | null;
  defesa: number | null;
  fortitude: string | null;
  reflexos: string | null;
  vontade: string | null;
  pv: number | null;
  pv_atual: number | null; // PV atual durante a sessão (default = pv)
  deslocamento: string | null;
  // Presença Perturbadora (criaturas) — perda de Sanidade ao ver a criatura
  pp_dt: string | null; // DT do teste (ex: "20")
  pp_dano: string | null; // dano de Sanidade (ex: "3d8 mental")
  pp_imune_nex: string | null; // NEX que fica imune (ex: "40%")
  pericias: NpcPericia[];
  resistencias: NpcResistencia[];
  vulnerabilidades: string[];
  habilidades: NpcHabilidade[];
  acoes: NpcAcao[];
  rituais: NpcRitual[];
  created_at: string;
  updated_at: string;
}

export type NpcPayload = Omit<Npc, "id" | "user_id" | "created_at" | "updated_at">;

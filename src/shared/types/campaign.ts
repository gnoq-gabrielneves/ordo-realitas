export type SceneTipo = "narrativa" | "combate" | "investigacao" | "social" | "interludio";

export interface CampanhaHandout {
  titulo: string;
  conteudo: string;
  image_url: string | null;
}

export interface Campanha {
  id: string;
  user_id: string;
  name: string;
  image_url: string | null;
  synopsis: string | null;
  historico: string | null;
  vilao: string | null;
  nex_inicial: number;
  nex_final: number;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export type CampanhaPayload = Omit<Campanha, "id" | "user_id" | "created_at" | "updated_at">;

export interface Missao {
  id: string;
  campaign_id: string;
  user_id: string;
  titulo: string;
  numero: number;
  is_prologo: boolean;
  resumo: string | null;
  historico: string | null;
  prologo: string | null;
  epilogo: string | null;
  nex_inicial: number | null;
  nex_final: number | null;
  handouts: CampanhaHandout[];
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export type MissaoPayload = Omit<Missao, "id" | "user_id" | "created_at" | "updated_at">;

export type CenaBlocoTipo = "narracao" | "fala";

// Menção a um sujeito dentro do texto: o token "@<nome>" no texto é resolvido por sujeito_id.
export interface CenaMencao {
  nome: string;
  sujeito_id: string;
}

export interface CenaBloco {
  tipo: CenaBlocoTipo;
  texto: string;
  sujeito_id?: string | null; // quem fala (blocos de fala)
  mencoes?: CenaMencao[]; // sujeitos mencionados no texto via @
}

export interface Cena {
  id: string;
  mission_id: string;
  user_id: string;
  titulo: string;
  parte: string | null;
  tipo: SceneTipo;
  texto_descritivo: string | null;
  notas_mestre: string | null;
  ordem: number;
  roteiro: CenaBloco[];
  // Investigação com urgência (pressão de tempo): descrição do que acontece a cada rodada
  urgencia: boolean;
  urgencia_rodadas: string[];
  // Lugar vinculado — exibe os pontos de interesse dele dentro da cena
  lugar_id: string | null;
  created_at: string;
  updated_at: string;
}

export type CenaPayload = Omit<Cena, "id" | "user_id" | "created_at" | "updated_at">;

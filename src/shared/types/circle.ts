export type CircleTipo = "organizacao" | "familia" | "culto" | "faccao" | "grupo" | "outro";

export interface Circle {
  id: string;
  user_id: string;
  nome: string;
  tipo: CircleTipo;
  image_url: string | null;
  descricao: string | null;
  lideranca: string | null;
  sede: string | null;
  objetivo: string | null;
  reputacao: string | null;
  segredos: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export type CirclePayload = Omit<Circle, "id" | "user_id" | "created_at" | "updated_at">;

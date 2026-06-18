export type PlaceAtividade = "nenhuma" | "baixa" | "moderada" | "alta" | "critica";
export type PlaceOrigem = "sangue" | "morte" | "medo" | "conhecimento" | "energia";
export type PlaceMembrana = "integra" | "enfraquecida" | "rompida";

// "jogador": espontâneo, o jogador decide rolar (ex: investigar por conta própria)
// "mestre": solicitado, o mestre pede o teste (ex: Percepção ao entrar)
export type PlacePontoTesteTipo = "jogador" | "mestre";

export interface PlacePontoTeste {
  pericia: string; // nome da perícia (ex: "Investigação")
  dt: string; // DT do teste (ex: "15", "Vontade DT 20")
  descricao: string; // descrição / contexto geral do teste (opcional)
  sucesso?: string; // o que acontece se passar
  falha?: string; // o que acontece se falhar
  tipo?: PlacePontoTesteTipo;
}

export interface PlacePonto {
  nome: string;
  descricao: string;
  testes?: PlacePontoTeste[]; // possíveis testes de perícia neste ponto
}

export interface Place {
  id: string;
  user_id: string;
  parent_id: string | null;
  name: string;
  tipo: string | null;
  localizacao: string | null;
  image_url: string | null;
  descricao: string | null;
  atmosfera: string | null;
  backstory: string | null;
  atividade_paranormal: PlaceAtividade | null;
  origem: PlaceOrigem | null;
  membrana: PlaceMembrana | null;
  pontos_de_interesse: PlacePonto[];
  notas: string | null;
  segredos: string | null;
  created_at: string;
  updated_at: string;
}

export type PlacePayload = Omit<Place, "id" | "user_id" | "created_at" | "updated_at">;

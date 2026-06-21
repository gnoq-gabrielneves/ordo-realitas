export type Role = "mestre" | "jogador" | "tv";

export const ROLES = ["mestre", "jogador", "tv"] as const satisfies readonly Role[];

export const ROLE_LABELS: Record<Role, string> = {
  mestre: "Mestre",
  jogador: "Jogador",
  tv: "Tela",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  mestre: "Acesso total ao arquivo, usuarios, campanhas e notas do mestre.",
  jogador: "Acesso a ficha vinculada e documentacao.",
  tv: "Acesso a tela de exibicao para mostrar documentos, imagens e handouts aos jogadores.",
};

// Página inicial de cada papel após login.
export function homeDoRole(role: Role | null | undefined): string {
  if (role === "jogador") return "/agentes";
  if (role === "tv") return "/apresentacao";
  return "/home";
}

// Prefixos de rota que cada papel pode acessar. Mestre acessa tudo.
const ACESSO: Record<Role, string[] | "*"> = {
  mestre: "*",
  jogador: ["/agentes", "/documentacao"],
  tv: ["/apresentacao", "/documentacao"],
};

export function podeAcessar(role: Role | null | undefined, pathname: string): boolean {
  const regras = ACESSO[(role ?? "jogador") as Role];
  if (regras === "*") return true;
  return regras.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

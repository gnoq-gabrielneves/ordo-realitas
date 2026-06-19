export type Role = "mestre" | "jogador" | "tv";

export const ROLE_LABELS: Record<Role, string> = {
  mestre: "Mestre",
  jogador: "Jogador",
  tv: "TV",
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
  jogador: ["/agentes"],
  tv: ["/apresentacao"],
};

export function podeAcessar(role: Role | null | undefined, pathname: string): boolean {
  const regras = ACESSO[(role ?? "jogador") as Role];
  if (regras === "*") return true;
  return regras.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

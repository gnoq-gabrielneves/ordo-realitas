import { PERICIAS } from "@/shared/constants/pericias";
import { FORMA_SUPREMA } from "@/shared/constants/hexatombe";
import { AgentFormaSuprema, AgentSheet } from "@/shared/types/agent";

export type ClassePersonagem = "Combatente" | "Especialista" | "Ocultista" | "Sobrevivente";

export const CLASSES: ClassePersonagem[] = ["Combatente", "Especialista", "Ocultista", "Sobrevivente"];

// Aumenta os dados de cada termo "NdM" do dano em +X (mantém modificadores fixos).
export function aumentarDadosDano(dano: string, extra: number): string {
  return dano.replace(/(\d+)d(\d+)/g, (_, n, m) => `${parseInt(n, 10) + extra}d${m}`);
}

// Deriva o bloco da Forma Suprema a partir da ficha base, aplicando os bônus de
// Despertar (AS#2, p.97): +20 PV, +10 PE/PD, +10 Defesa, +5 em testes, +2 dados de dano.
export function deriveFormaSuprema(base: AgentSheet): AgentFormaSuprema {
  const { bonusPv, bonusPe, bonusDefesa, bonusTeste, bonusDadosDano } = FORMA_SUPREMA;

  // +5 em todos os testes → embute +5 no campo "outros" de cada perícia.
  const pericias = { ...(base.pericias ?? {}) };
  for (const p of PERICIAS) {
    const cur = pericias[p.key] ?? { treinado: false, grau: 0 as const, outros: 0 };
    pericias[p.key] = { ...cur, outros: (cur.outros ?? 0) + bonusTeste };
  }

  return {
    pv_max: base.pv_max + bonusPv,
    pv_atual: base.pv_atual + bonusPv,
    pe_max: base.usa_pd ? base.pe_max : base.pe_max + bonusPe,
    pe_atual: base.usa_pd ? base.pe_atual : base.pe_atual + bonusPe,
    san_max: base.san_max,
    san_atual: base.san_atual,
    usa_pd: base.usa_pd,
    pd_max: base.usa_pd ? base.pd_max + bonusPe : base.pd_max,
    pd_atual: base.usa_pd ? base.pd_atual + bonusPe : base.pd_atual,
    defesa_bonus: base.defesa_bonus + bonusDefesa,
    defesa_equip: base.defesa_equip,
    deslocamento: base.deslocamento,
    pericias,
    ataques: (base.ataques ?? []).map((a) => ({
      ...a,
      dano: a.dano ? aumentarDadosDano(a.dano, bonusDadosDano) : a.dano,
    })),
    habilidades: base.habilidades ?? [],
    rituais: base.rituais ?? [],
  };
}

// Limite de PE por turno baseado no NEX (Tabela 1.2)
// Para Sobrevivente: sempre 1, independente do estágio
export function calcularLimitePE(nex: number, classe?: string | null): number {
  if (classe === "Sobrevivente") return 1;
  if (nex >= 99) return 20;
  return Math.floor(nex / 5);
}

// Carga máxima baseada em Força
// Força 0 → 2 espaços; Força 1+ → Força × 5
export function calcularCargaMax(forca: number): number {
  return forca === 0 ? 2 : forca * 5;
}

interface RecursosCalculados {
  pv_max: number;
  pe_max: number;
  san_max: number;
}

interface RecursosPDCalculados {
  pv_max: number;
  pd_max: number;
}

// Calcula PV/PE/SAN máximos baseados em classe + NEX + atributos
// Para Sobrevivente, o campo NEX é usado como estágio (1-5)
export function calcularRecursos(
  classe: string | null,
  nex: number,
  vigor: number,
  presenca: number
): RecursosCalculados | null {
  if (!classe) return null;

  if (classe === "Combatente") {
    const extra = Math.floor((nex - 5) / 5);
    return {
      pv_max:  (20 + vigor)    + extra * (4 + vigor),
      pe_max:  (2  + presenca) + extra * (2 + presenca),
      san_max: 12              + extra * 3,
    };
  }

  if (classe === "Especialista") {
    const extra = Math.floor((nex - 5) / 5);
    return {
      pv_max:  (16 + vigor)    + extra * (3 + vigor),
      pe_max:  (3  + presenca) + extra * (3 + presenca),
      san_max: 16              + extra * 4,
    };
  }

  if (classe === "Ocultista") {
    const extra = Math.floor((nex - 5) / 5);
    return {
      pv_max:  (12 + vigor)    + extra * (2 + vigor),
      pe_max:  (4  + presenca) + extra * (4 + presenca),
      san_max: 20              + extra * 5,
    };
  }

  if (classe === "Sobrevivente") {
    const estagio = Math.max(1, Math.min(5, nex));
    const extra = estagio - 1;
    return {
      pv_max:  (8 + vigor)    + extra * 2,
      pe_max:  (2 + presenca) + extra * 1,
      san_max: 8              + extra * 2,
    };
  }

  return null;
}

// Calcula PV/PD máximos quando usando a regra de PD (Sobrevivendo ao Horror)
export function calcularRecursosPD(
  classe: string | null,
  nex: number,
  vigor: number,
  presenca: number
): RecursosPDCalculados | null {
  if (!classe) return null;

  if (classe === "Combatente") {
    const extra = Math.floor((nex - 5) / 5);
    return {
      pv_max: (20 + vigor)    + extra * (4 + vigor),
      pd_max: (6  + presenca) + extra * (3 + presenca),
    };
  }

  if (classe === "Especialista") {
    const extra = Math.floor((nex - 5) / 5);
    return {
      pv_max: (16 + vigor)    + extra * (3 + vigor),
      pd_max: (8  + presenca) + extra * (4 + presenca),
    };
  }

  if (classe === "Ocultista") {
    const extra = Math.floor((nex - 5) / 5);
    return {
      pv_max: (12 + vigor)    + extra * (2 + vigor),
      pd_max: (10 + presenca) + extra * (5 + presenca),
    };
  }

  if (classe === "Sobrevivente") {
    const estagio = Math.max(1, Math.min(5, nex));
    const extra = estagio - 1;
    return {
      pv_max: (8 + vigor)    + extra * 2,
      pd_max: (4 + presenca) + extra * 2,
    };
  }

  return null;
}

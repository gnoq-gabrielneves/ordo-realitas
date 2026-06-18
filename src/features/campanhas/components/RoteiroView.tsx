"use client";

import { CenaBloco, CenaMencao } from "@/shared/types/campaign";
import { Npc } from "@/shared/types/npc";
import { UserRound } from "lucide-react";
import Link from "next/link";
import React from "react";

function MentionChip({ nome, sujeito }: { nome: string; sujeito?: Npc }) {
  const inner = (
    <span className="inline-flex items-center gap-1 align-baseline rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[0.85em] font-medium">
      {sujeito?.image_url && (
        <span className="inline-block h-3.5 w-3.5 rounded-full overflow-hidden align-middle">
          <img src={sujeito.image_url} alt="" className="h-full w-full object-cover" />
        </span>
      )}
      {sujeito?.name ?? nome}
    </span>
  );
  return sujeito ? <Link href={`/sujeitos/${sujeito.id}`} className="hover:underline">{inner}</Link> : inner;
}

// Resolve "@<nome>" no texto para chips, usando o mapa de menções (por id).
function renderTexto(texto: string, mencoes: CenaMencao[] | undefined, byId: Record<string, Npc>): React.ReactNode {
  if (!mencoes?.length) return texto;
  const ordered = [...mencoes].sort((a, b) => b.nome.length - a.nome.length);
  const escaped = ordered.map((m) => m.nome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`@(${escaped.join("|")})`, "g");
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(texto)) !== null) {
    if (m.index > last) out.push(texto.slice(last, m.index));
    const men = ordered.find((x) => x.nome === m![1]);
    out.push(<MentionChip key={k++} nome={m[1]} sujeito={men ? byId[men.sujeito_id] : undefined} />);
    last = re.lastIndex;
  }
  if (last < texto.length) out.push(texto.slice(last));
  return out;
}

export function RoteiroView({ roteiro, sujeitos }: { roteiro: CenaBloco[]; sujeitos: Npc[] }) {
  const byId = Object.fromEntries(sujeitos.map((s) => [s.id, s])) as Record<string, Npc>;

  return (
    <div className="space-y-4">
      {roteiro.map((b, i) => {
        if (b.tipo === "fala") {
          const falante = b.sujeito_id ? byId[b.sujeito_id] : undefined;
          const iniciais = (falante?.name ?? "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
          return (
            <div key={i} className="flex gap-3">
              <div className="h-9 w-9 shrink-0 rounded-full border border-border overflow-hidden bg-muted flex items-center justify-center">
                {falante?.image_url
                  ? <img src={falante.image_url} alt="" className="h-full w-full object-cover" />
                  : <span className="text-[11px] font-medium text-muted-foreground">{iniciais}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {falante
                    ? <Link href={`/sujeitos/${falante.id}`} className="hover:underline">{falante.name}</Link>
                    : <span className="text-muted-foreground italic">Sem falante</span>}
                </p>
                <p className="text-[15px] leading-relaxed text-foreground mt-0.5">{renderTexto(b.texto, b.mencoes, byId)}</p>
              </div>
            </div>
          );
        }
        return (
          <p key={i} className="text-[15px] leading-relaxed text-muted-foreground border-l-2 border-border pl-3.5">
            {renderTexto(b.texto, b.mencoes, byId)}
          </p>
        );
      })}
    </div>
  );
}

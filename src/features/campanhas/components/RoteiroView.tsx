"use client";

import { CenaBloco, CenaMencao } from "@/shared/types/campaign";
import { Npc } from "@/shared/types/npc";
import { MessageSquare, TextQuote } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function MentionChip({ nome, sujeito }: { nome: string; sujeito?: Npc }) {
  const inner = (
    <span className="inline-flex items-center gap-1 border border-primary/20 bg-primary/5 px-1.5 py-0.5 align-baseline text-[0.85em] font-medium text-primary">
      {sujeito?.image_url && (
        <span className="relative inline-block h-3.5 w-3.5 overflow-hidden align-middle">
          <Image src={sujeito.image_url} alt="" fill className="object-cover" unoptimized />
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
  const blocosPreenchidos = roteiro.filter((bloco) => bloco.texto.trim());

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Script da cena</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Narrações para leitura e falas em ordem de execução.
          </p>
        </div>
        <span className="border border-border bg-background px-2 py-1 font-mono text-[10px] text-muted-foreground">
          {blocosPreenchidos.length}/{roteiro.length} blocos
        </span>
      </div>

      <div className="space-y-3">
      {roteiro.map((b, i) => {
        const empty = !b.texto.trim();
        if (b.tipo === "fala") {
          const falante = b.sujeito_id ? byId[b.sujeito_id] : undefined;
          const falanteNome = falante?.name ?? b.falante_nome ?? null;
          const iniciais = (falanteNome ?? "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
          return (
            <article key={i} className="grid gap-3 border border-border bg-background p-4 sm:grid-cols-[44px_1fr]">
              <div className="flex h-11 w-11 items-center justify-center border border-primary/25 bg-primary/5 text-primary">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  <span className="border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                    Fala
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    <span className="relative flex h-6 w-6 items-center justify-center overflow-hidden border border-border bg-muted text-[10px] text-muted-foreground">
                      {falante?.image_url ? (
                        <Image src={falante.image_url} alt="" fill className="object-cover" unoptimized />
                      ) : (
                        <span>{iniciais}</span>
                      )}
                    </span>
                    {falante ? (
                      <Link href={`/sujeitos/${falante.id}`} className="hover:text-primary">{falante.name}</Link>
                    ) : falanteNome ? (
                      <span>{falanteNome}</span>
                    ) : (
                      <span className="text-muted-foreground italic">Sem falante</span>
                    )}
                  </span>
                </div>
                <p className={empty
                  ? "text-sm italic leading-relaxed text-muted-foreground"
                  : "whitespace-pre-wrap text-[15px] leading-relaxed text-foreground"
                }>
                  {empty ? "Fala ainda não escrita." : renderTexto(b.texto, b.mencoes, byId)}
                </p>
              </div>
            </article>
          );
        }
        return (
          <article key={i} className="grid gap-3 border border-border bg-muted/20 p-4 sm:grid-cols-[44px_1fr]">
            <div className="flex h-11 w-11 items-center justify-center border border-border bg-card text-muted-foreground">
              <TextQuote className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <span className="border border-border bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Narração
                </span>
              </div>
              <p className={empty
                ? "text-sm italic leading-relaxed text-muted-foreground"
                : "whitespace-pre-wrap text-[15px] italic leading-relaxed text-foreground"
              }>
                {empty ? "Narração ainda não escrita." : renderTexto(b.texto, b.mencoes, byId)}
              </p>
            </div>
          </article>
        );
      })}
      </div>
    </div>
  );
}

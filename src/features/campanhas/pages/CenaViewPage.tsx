"use client";

import { useCena, useCenas, useMissao } from "@/features/campanhas/hooks/useCampanhas";
import { useLugar } from "@/features/lugares/hooks/useLugares";
import { useSujeitos } from "@/features/sujeitos/hooks/useSujeitos";
import { RoteiroView } from "@/features/campanhas/components/RoteiroView";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { SceneTipo } from "@/shared/types/campaign";
import { ArrowLeft, ArrowRight, BookOpen, ChevronLeft, Clock, MapPin, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const TIPO_LABEL: Record<SceneTipo, string> = {
  narrativa: "Narrativa",
  investigacao: "Investigação",
  combate: "Combate",
  social: "Social",
  interludio: "Interlúdio",
};

const TIPO_COLOR: Record<SceneTipo, string> = {
  narrativa: "text-muted-foreground border-border",
  investigacao: "text-amber-700 border-amber-300",
  combate: "text-destructive border-destructive/40",
  social: "text-blue-700 border-blue-300",
  interludio: "text-muted-foreground border-border",
};

interface CenaViewPageProps { campaignId: string; missaoId: string; cenaId: string }

export function CenaViewPage({ campaignId, missaoId, cenaId }: CenaViewPageProps) {
  const router = useRouter();
  const { data: cena, isLoading, isError } = useCena(cenaId);
  const { data: missao } = useMissao(missaoId);
  const { data: todasCenas = [] } = useCenas(missaoId);
  const { data: lugar } = useLugar(cena?.lugar_id ?? "");
  const { data: sujeitos = [] } = useSujeitos();

  const idx = todasCenas.findIndex((c) => c.id === cenaId);
  const prev = idx > 0 ? todasCenas[idx - 1] : null;
  const next = idx < todasCenas.length - 1 ? todasCenas[idx + 1] : null;

  if (isLoading) return (
    <>
      <AppHeader title="Cena" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-5 w-64 bg-muted animate-pulse rounded-sm" />)}</div>
      </main>
    </>
  );

  if (isError || !cena) return (
    <>
      <AppHeader title="Cena" />
      <main className="flex-1 overflow-y-auto p-6">
        <p className="text-sm text-destructive">Cena não encontrada nos arquivos.</p>
      </main>
    </>
  );

  return (
    <>
      <AppHeader title={cena.titulo} />
      <main className="flex-1 overflow-y-auto p-6">
        {/* Navegação topo */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/campanhas/${campaignId}/missoes/${missaoId}`}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {missao?.titulo ?? "Missão"}
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/campanhas/${campaignId}/missoes/${missaoId}/cenas/${cenaId}/editar`}>
              <Pencil className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* Cabeçalho da cena */}
        <div className="mb-6">
          {cena.parte && (
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">{cena.parte}</p>
          )}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-muted-foreground">
              Cena {String(idx + 1).padStart(2, "0")}/{String(todasCenas.length).padStart(2, "0")}
            </span>
            <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${TIPO_COLOR[cena.tipo]}`}>
              {TIPO_LABEL[cena.tipo]}
            </Badge>
          </div>
          <h1 className="text-xl font-semibold text-foreground">{cena.titulo}</h1>
        </div>

        {/* Texto descritivo — destacado visualmente */}
        {cena.texto_descritivo && (
          <div className="mb-6 border-l-4 border-primary/40 bg-primary/5 p-5">
            <p className="text-[10px] font-medium uppercase tracking-widest text-primary/60 mb-3">Texto para os agentes</p>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap italic">{cena.texto_descritivo}</p>
          </div>
        )}

        {/* Roteiro — narração e diálogos */}
        {cena.roteiro?.length > 0 && (
          <div className="mb-8 rounded-lg border border-border bg-card overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-5 py-2.5">
              <BookOpen className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground">Roteiro</p>
              <span className="text-[11px] text-muted-foreground">· narração e diálogos</span>
            </div>
            <div className="px-5 py-6 sm:px-8">
              <RoteiroView roteiro={cena.roteiro} sujeitos={sujeitos} />
            </div>
          </div>
        )}

        {/* Urgência — pressão de tempo da investigação */}
        {cena.urgencia && cena.urgencia_rodadas.length > 0 && (
          <div className="mb-6">
            <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">
              <Clock className="h-3.5 w-3.5" /> Urgência — a cada rodada
            </p>
            <div className="rounded-md border border-amber-500/30 bg-amber-500/[0.05] divide-y divide-amber-500/15">
              {cena.urgencia_rodadas.map((r, i) => (
                <div key={i} className="flex gap-3 p-3">
                  <span className="shrink-0 text-[11px] font-mono font-semibold text-amber-600 dark:text-amber-400 w-9">R{i + 1}</span>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{r}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pontos de interesse do lugar vinculado */}
        {lugar && lugar.pontos_de_interesse.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> Pontos de Interesse — {lugar.name}
              </p>
              <Link href={`/lugares/${lugar.id}`} className="text-[11px] text-primary/80 hover:text-primary transition-colors">
                Ver lugar →
              </Link>
            </div>
            <div className="border border-border bg-card divide-y divide-border/50">
              {lugar.pontos_de_interesse.map((p, i) => (
                <div key={i} className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">{p.nome}</p>
                  {p.descricao && <p className="text-sm text-muted-foreground mt-0.5">{p.descricao}</p>}
                  {(p.testes ?? []).length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {(p.testes ?? []).map((t, ti) => (
                        <div key={ti} className="rounded border border-border/60 bg-muted/20 px-2.5 py-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-semibold text-primary/90">{t.pericia || "Perícia"}</span>
                            {t.dt && <span className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">DT {t.dt}</span>}
                            {(t.tipo ?? "jogador") === "mestre" ? (
                              <span className="text-[10px] text-amber-400 border border-amber-500/40 bg-amber-500/10 rounded px-1.5 py-0.5">Mestre pede</span>
                            ) : (
                              <span className="text-[10px] text-sky-400 border border-sky-500/40 bg-sky-500/10 rounded px-1.5 py-0.5">Jogador escolhe</span>
                            )}
                          </div>
                          {t.descricao && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.descricao}</p>}
                          {(t.sucesso || t.falha) && (
                            <div className="mt-1.5 space-y-1">
                              {t.sucesso && (
                                <p className="text-xs leading-relaxed">
                                  <span className="font-semibold text-emerald-500">Passou: </span>
                                  <span className="text-foreground/80">{t.sucesso}</span>
                                </p>
                              )}
                              {t.falha && (
                                <p className="text-xs leading-relaxed">
                                  <span className="font-semibold text-red-500">Falhou: </span>
                                  <span className="text-foreground/80">{t.falha}</span>
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notas do mestre */}
        {cena.notas_mestre && (
          <div className="mb-6">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Notas do Narrador</p>
            <div className="border border-border bg-card p-4">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{cena.notas_mestre}</p>
            </div>
          </div>
        )}

        {/* Navegação entre cenas */}
        <div className="flex items-center justify-between pt-6 border-t border-border mt-8">
          {prev ? (
            <Button
              variant="outline" size="sm"
              onClick={() => router.push(`/campanhas/${campaignId}/missoes/${missaoId}/cenas/${prev.id}`)}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {prev.titulo}
            </Button>
          ) : <div />}
          {next ? (
            <Button
              variant="outline" size="sm"
              onClick={() => router.push(`/campanhas/${campaignId}/missoes/${missaoId}/cenas/${next.id}`)}
            >
              {next.titulo}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              variant="outline" size="sm"
              onClick={() => router.push(`/campanhas/${campaignId}/missoes/${missaoId}`)}
            >
              Fim da missão
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </main>
    </>
  );
}

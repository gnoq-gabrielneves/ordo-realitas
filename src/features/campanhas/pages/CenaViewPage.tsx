"use client";

import { useCena, useCenas, useMissao } from "@/features/campanhas/hooks/useCampanhas";
import { useLugar } from "@/features/lugares/hooks/useLugares";
import { useSujeitos } from "@/features/sujeitos/hooks/useSujeitos";
import { RoteiroView } from "@/features/campanhas/components/RoteiroView";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { SceneTipo } from "@/shared/types/campaign";
import { ArrowLeft, ArrowRight, BookOpen, ChevronLeft, Clock, FileText, MapPin, MessageSquare, Pencil, StickyNote } from "lucide-react";
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

  const cenasOrdenadas = [...todasCenas].sort((a, b) => a.ordem - b.ordem);
  const idx = cenasOrdenadas.findIndex((c) => c.id === cenaId);
  const prev = idx > 0 ? cenasOrdenadas[idx - 1] : null;
  const next = idx < cenasOrdenadas.length - 1 ? cenasOrdenadas[idx + 1] : null;

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
        <div className="mb-6 flex items-center justify-between">
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

        <section className="mb-6 border border-border bg-card p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              {cena.parte && (
                <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{cena.parte}</p>
              )}
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] text-muted-foreground">
                  Cena {String(idx + 1).padStart(2, "0")}/{String(cenasOrdenadas.length).padStart(2, "0")}
                </span>
                <Badge variant="outline" className={`rounded-sm text-[10px] uppercase tracking-wider ${TIPO_COLOR[cena.tipo]}`}>
                  {TIPO_LABEL[cena.tipo]}
                </Badge>
                {cena.urgencia && (
                  <Badge variant="secondary" className="rounded-sm text-[10px] uppercase tracking-wider">
                    <Clock className="h-3 w-3" /> Urgência
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-semibold text-foreground">{cena.titulo}</h1>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <SceneStat label="Roteiro" value={cena.roteiro.length} />
              <SceneStat label="Rodadas" value={cena.urgencia_rodadas.length} />
              <SceneStat label="Pontos" value={lugar?.pontos_de_interesse.length ?? 0} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {cena.texto_descritivo && (
              <Block title="Texto para os jogadores" icon={<BookOpen className="h-4 w-4" />}>
                <p className="whitespace-pre-wrap text-sm italic leading-relaxed text-foreground">{cena.texto_descritivo}</p>
              </Block>
            )}

            {cena.roteiro?.length > 0 && (
              <Block title="Roteiro" icon={<MessageSquare className="h-4 w-4" />}>
                <div className="px-1 py-2 sm:px-3">
                  <RoteiroView roteiro={cena.roteiro} sujeitos={sujeitos} />
                </div>
              </Block>
            )}

            {cena.urgencia && cena.urgencia_rodadas.length > 0 && (
              <Block title="Urgência - a cada rodada" icon={<Clock className="h-4 w-4" />}>
                <div className="divide-y divide-amber-500/15 border border-amber-500/30 bg-amber-500/[0.05]">
                  {cena.urgencia_rodadas.map((r, i) => (
                    <div key={i} className="flex gap-3 p-3">
                      <span className="w-9 shrink-0 font-mono text-[11px] font-semibold text-amber-600">R{i + 1}</span>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{r}</p>
                    </div>
                  ))}
                </div>
              </Block>
            )}

            {lugar && lugar.pontos_de_interesse.length > 0 && (
              <Block
                title={`Pontos de interesse - ${lugar.name}`}
                icon={<MapPin className="h-4 w-4" />}
                action={<Link href={`/lugares/${lugar.id}`} className="text-[11px] text-primary/80 transition-colors hover:text-primary">Ver lugar</Link>}
              >
                <div className="divide-y divide-border/50 border border-border bg-background">
                  {lugar.pontos_de_interesse.map((p, i) => (
                    <div key={i} className="p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-foreground">{p.nome}</p>
                      {p.descricao && <p className="mt-0.5 text-sm text-muted-foreground">{p.descricao}</p>}
                      {(p.testes ?? []).length > 0 && (
                        <div className="mt-2 space-y-1.5">
                          {(p.testes ?? []).map((t, ti) => (
                            <div key={ti} className="border border-border/60 bg-muted/20 px-2.5 py-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-semibold text-primary/90">{t.pericia || "Perícia"}</span>
                                {t.dt && <span className="border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">DT {t.dt}</span>}
                                {(t.tipo ?? "jogador") === "mestre" ? (
                                  <span className="border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-600">Mestre pede</span>
                                ) : (
                                  <span className="border border-sky-500/40 bg-sky-500/10 px-1.5 py-0.5 text-[10px] text-sky-600">Jogador escolhe</span>
                                )}
                              </div>
                              {t.descricao && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.descricao}</p>}
                              {(t.sucesso || t.falha) && (
                                <div className="mt-1.5 space-y-1">
                                  {t.sucesso && (
                                    <p className="text-xs leading-relaxed">
                                      <span className="font-semibold text-emerald-600">Passou: </span>
                                      <span className="text-foreground/80">{t.sucesso}</span>
                                    </p>
                                  )}
                                  {t.falha && (
                                    <p className="text-xs leading-relaxed">
                                      <span className="font-semibold text-red-600">Falhou: </span>
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
              </Block>
            )}

            {cena.notas_mestre && (
              <Block title="Notas do mestre" icon={<StickyNote className="h-4 w-4" />}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{cena.notas_mestre}</p>
              </Block>
            )}
          </div>

          <aside className="space-y-4">
            <div className="sticky top-6 space-y-4">
              <div className="border border-border bg-card p-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Condução</p>
                <div className="mt-3 space-y-2 text-sm">
                  <GuideLine icon={<FileText className="h-3.5 w-3.5" />} label={cena.texto_descritivo ? "Texto pronto" : "Sem texto narrável"} />
                  <GuideLine icon={<MessageSquare className="h-3.5 w-3.5" />} label={`${cena.roteiro.length} blocos de roteiro`} />
                  <GuideLine icon={<MapPin className="h-3.5 w-3.5" />} label={lugar?.name ?? "Sem lugar vinculado"} />
                  <GuideLine icon={<StickyNote className="h-3.5 w-3.5" />} label={cena.notas_mestre ? "Notas internas" : "Sem notas internas"} />
                </div>
              </div>

              <div className="border border-primary/30 bg-primary/5 p-4">
                <p className="text-sm font-semibold">Durante a sessão</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Comece pelo texto para os jogadores, siga os blocos de roteiro e use os pontos de interesse como consulta rápida quando os agentes investigarem o lugar.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
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

function SceneStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-border bg-background px-3 py-2">
      <p className="text-sm font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
    </div>
  );
}

function Block({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {icon}
          {title}
        </p>
        {action}
      </div>
      <div className="border border-border bg-card p-5">{children}</div>
    </section>
  );
}

function GuideLine({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span className="text-primary">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}

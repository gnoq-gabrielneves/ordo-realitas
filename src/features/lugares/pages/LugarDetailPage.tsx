"use client";

import { LugarCard } from "@/features/lugares/components/LugarCard";
import { useDeleteLugar, useLugar, useSubLugares } from "@/features/lugares/hooks/useLugares";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ArrowLeft, MapPin, Pencil, PlusIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const atividadeStyle: Record<string, string> = {
  nenhuma:  "text-muted-foreground border-border",
  baixa:    "text-amber-700 border-amber-300",
  moderada: "text-orange-700 border-orange-300",
  alta:     "text-primary border-primary/40",
  critica:  "text-destructive border-destructive/40",
};

const membranaStyle: Record<string, string> = {
  integra:       "text-muted-foreground",
  enfraquecida:  "text-amber-700",
  rompida:       "text-destructive",
};

interface LugarDetailPageProps { id: string }

export function LugarDetailPage({ id }: LugarDetailPageProps) {
  const router = useRouter();
  const { data: lugar, isLoading, isError } = useLugar(id);
  const { data: subLugares = [] } = useSubLugares(id);
  const { mutate: deletar, isPending: deleting } = useDeleteLugar();

  function handleDelete() {
    const backTo = lugar?.parent_id ? `/lugares/${lugar.parent_id}` : "/lugares";
    deletar(id, { onSuccess: () => router.push(backTo) });
  }

  if (isLoading) return (
    <>
      <AppHeader title="Lugar" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-5 w-64 bg-muted animate-pulse rounded-sm" />)}
        </div>
      </main>
    </>
  );

  if (isError || !lugar) return (
    <>
      <AppHeader title="Lugar" />
      <main className="flex-1 overflow-y-auto p-6">
        <p className="text-sm text-destructive">Lugar não encontrado nos arquivos.</p>
      </main>
    </>
  );

  const backHref = lugar.parent_id ? `/lugares/${lugar.parent_id}` : "/lugares";

  const hasCombate = lugar.atividade_paranormal || lugar.origem || lugar.membrana;
  const hasBackstory = lugar.descricao || lugar.atmosfera || lugar.backstory;
  const hasNotas = lugar.notas || lugar.segredos;

  return (
    <>
      <AppHeader title={lugar.name} />
      <main className="flex-1 overflow-y-auto p-6">

        <Link href={backHref} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit">
          <ArrowLeft className="h-3.5 w-3.5" />
          {lugar.parent_id ? "Voltar para o lugar" : "Voltar para Lugares"}
        </Link>

        {/* cabeçalho */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center border border-border bg-muted text-muted-foreground overflow-hidden">
              {lugar.image_url
                ? <Image src={lugar.image_url} alt={lugar.name} fill className="object-cover" />
                : <MapPin className="h-6 w-6" />
              }
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{lugar.name}</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {lugar.tipo && (
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">{lugar.tipo}</Badge>
                )}
                {lugar.localizacao && (
                  <span className="text-xs text-muted-foreground">{lugar.localizacao}</span>
                )}
                {lugar.membrana && lugar.membrana !== "integra" && (
                  <span className={`text-[10px] font-medium uppercase tracking-wider ${membranaStyle[lugar.membrana]}`}>
                    Membrana {lugar.membrana}
                  </span>
                )}
                {lugar.atividade_paranormal && lugar.atividade_paranormal !== "nenhuma" && (
                  <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${atividadeStyle[lugar.atividade_paranormal]}`}>
                    {lugar.atividade_paranormal}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button asChild variant="outline" size="sm">
              <Link href={`/lugares/${id}/editar`}>
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Link>
            </Button>
            <ConfirmDialog
              title="Remover lugar"
              description="Este lugar e todos os seus sub-lugares serão removidos permanentemente dos arquivos da Ordo. Esta ação não pode ser desfeita."
              onConfirm={handleDelete}
              disabled={deleting}
            >
              <Button variant="outline" size="sm"
                className="text-destructive hover:text-destructive hover:border-destructive/40">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </ConfirmDialog>
          </div>
        </div>

        <Tabs defaultValue="visao-geral">
          <TabsList className="mb-6">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            {lugar.pontos_de_interesse.length > 0 && (
              <TabsTrigger value="pontos">
                Pontos de Interesse
                <span className="ml-1.5 rounded bg-secondary px-1.5 py-0.5 text-xs">
                  {lugar.pontos_de_interesse.length}
                </span>
              </TabsTrigger>
            )}
            {hasBackstory && <TabsTrigger value="backstory">Descrição</TabsTrigger>}
            {hasNotas && <TabsTrigger value="notas">Notas</TabsTrigger>}
          </TabsList>

          {/* VISÃO GERAL */}
          <TabsContent value="visao-geral" className="space-y-6">
            {hasCombate && (
              <Block title="Status Paranormal">
                <div className="flex gap-4 flex-wrap">
                  {lugar.atividade_paranormal && (
                    <StatInline label="Atividade" value={lugar.atividade_paranormal} />
                  )}
                  {lugar.origem && (
                    <StatInline label="Origem" value={lugar.origem} />
                  )}
                  {lugar.membrana && (
                    <StatInline label="Membrana" value={lugar.membrana} />
                  )}
                </div>
              </Block>
            )}

            {/* sub-lugares */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  Sub-lugares {subLugares.length > 0 && `(${subLugares.length})`}
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/lugares/novo?parent=${id}`}>
                    <PlusIcon className="h-3.5 w-3.5" />
                    Adicionar
                  </Link>
                </Button>
              </div>
              {subLugares.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {subLugares.map((sl) => <LugarCard key={sl.id} lugar={sl} />)}
                </div>
              ) : (
                <div className="border border-dashed border-border py-8 text-center">
                  <p className="text-xs text-muted-foreground">Nenhum sub-lugar cadastrado.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* PONTOS DE INTERESSE */}
          <TabsContent value="pontos">
            <Block title="Pontos de Interesse">
              <div className="space-y-4">
                {lugar.pontos_de_interesse.map((p, i) => (
                  <div key={i} className="border-l-2 border-primary/30 pl-3">
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
            </Block>
          </TabsContent>

          {/* DESCRIÇÃO */}
          <TabsContent value="backstory" className="space-y-4">
            {lugar.descricao && <Block title="Descrição / Aparência"><p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{lugar.descricao}</p></Block>}
            {lugar.atmosfera && <Block title="Atmosfera"><p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{lugar.atmosfera}</p></Block>}
            {lugar.backstory && <Block title="Backstory"><p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{lugar.backstory}</p></Block>}
          </TabsContent>

          {/* NOTAS */}
          <TabsContent value="notas" className="space-y-4">
            {lugar.notas && <Block title="Notas do Mestre"><p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{lugar.notas}</p></Block>}
            {lugar.segredos && <Block title="Segredos"><p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{lugar.segredos}</p></Block>}
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">{title}</p>
      <div className="border border-border bg-card p-4">{children}</div>
    </div>
  );
}

function StatInline({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-sm text-foreground capitalize">
      <span className="text-xs text-muted-foreground mr-1">{label}</span>{value}
    </span>
  );
}

"use client";

import { useCenas, useDeleteCena, useDeleteMissao, useMissao } from "@/features/campanhas/hooks/useCampanhas";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Cena, SceneTipo } from "@/shared/types/campaign";
import { ArrowLeft, Pencil, PlusIcon, ScrollText, Trash2 } from "lucide-react";
import Image from "next/image";
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

interface MissaoDetailPageProps { campaignId: string; missaoId: string }

export function MissaoDetailPage({ campaignId, missaoId }: MissaoDetailPageProps) {
  const router = useRouter();
  const { data: missao, isLoading, isError } = useMissao(missaoId);
  const { data: cenas = [] } = useCenas(missaoId);
  const { mutate: deletarMissao, isPending: deletingMissao } = useDeleteMissao();
  const { mutate: deletarCena } = useDeleteCena();

  function handleDeleteMissao() {
    deletarMissao(missaoId, { onSuccess: () => router.push(`/campanhas/${campaignId}`) });
  }

  function handleDeleteCena(cenaId: string) {
    deletarCena(cenaId);
  }

  if (isLoading) return (
    <>
      <AppHeader title="Missão" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-5 w-64 bg-muted animate-pulse rounded-sm" />)}</div>
      </main>
    </>
  );

  if (isError || !missao) return (
    <>
      <AppHeader title="Missão" />
      <main className="flex-1 overflow-y-auto p-6">
        <p className="text-sm text-destructive">Missão não encontrada nos arquivos.</p>
      </main>
    </>
  );

  // Agrupar cenas por parte
  const partes = cenas.reduce<Record<string, Cena[]>>((acc, cena) => {
    const key = cena.parte ?? "__sem_parte__";
    if (!acc[key]) acc[key] = [];
    acc[key].push(cena);
    return acc;
  }, {});

  const hasNarrativa = missao.historico || missao.prologo || missao.epilogo;
  const hasHandouts = missao.handouts.length > 0;
  const hasNotas = !!missao.notas;

  return (
    <>
      <AppHeader title={missao.titulo} />
      <main className="flex-1 overflow-y-auto p-6">
        <Link href={`/campanhas/${campaignId}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit">
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para a campanha
        </Link>

        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                {missao.is_prologo ? "Prólogo" : `Missão ${String(missao.numero).padStart(2, "0")}`}
              </span>
              {(missao.nex_inicial != null || missao.nex_final != null) && (
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  NEX {missao.nex_inicial ?? "?"}% → {missao.nex_final ?? "?"}%
                </span>
              )}
            </div>
            <h1 className="text-lg font-semibold text-foreground">{missao.titulo}</h1>
            {missao.resumo && (
              <p className="text-xs text-muted-foreground mt-1 max-w-xl">{missao.resumo}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild variant="outline" size="sm">
              <Link href={`/campanhas/${campaignId}/missoes/${missaoId}/editar`}>
                <Pencil className="h-3.5 w-3.5" /> Editar
              </Link>
            </Button>
            <ConfirmDialog
              title="Remover missão"
              description="Esta missão e todas as suas cenas serão removidas permanentemente. Esta ação não pode ser desfeita."
              onConfirm={handleDeleteMissao}
              disabled={deletingMissao}
            >
              <Button variant="outline" size="sm"
                className="text-destructive hover:text-destructive hover:border-destructive/40">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </ConfirmDialog>
          </div>
        </div>

        <Tabs defaultValue="cenas">
          <TabsList className="mb-6">
            <TabsTrigger value="cenas">
              Cenas
              {cenas.length > 0 && (
                <span className="ml-1.5 rounded bg-secondary px-1.5 py-0.5 text-xs">{cenas.length}</span>
              )}
            </TabsTrigger>
            {hasNarrativa && <TabsTrigger value="narrativa">Narrativa</TabsTrigger>}
            {hasHandouts && (
              <TabsTrigger value="handouts">
                Handouts
                <span className="ml-1.5 rounded bg-secondary px-1.5 py-0.5 text-xs">{missao.handouts.length}</span>
              </TabsTrigger>
            )}
            {hasNotas && <TabsTrigger value="notas">Notas</TabsTrigger>}
          </TabsList>

          {/* CENAS */}
          <TabsContent value="cenas" className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Sequência de Cenas</p>
              <Button asChild variant="outline" size="sm">
                <Link href={`/campanhas/${campaignId}/missoes/${missaoId}/cenas/nova`}>
                  <PlusIcon className="h-3.5 w-3.5" /> Nova Cena
                </Link>
              </Button>
            </div>

            {cenas.length === 0 && (
              <div className="border border-dashed border-border py-12 text-center">
                <p className="text-xs text-muted-foreground">Nenhuma cena cadastrada.</p>
              </div>
            )}

            {Object.entries(partes).map(([parte, scenesInParte]) => (
              <div key={parte} className="space-y-2">
                {parte !== "__sem_parte__" && (
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground pt-2 border-t border-border">
                    {parte}
                  </p>
                )}
                {scenesInParte.map((cena, idx) => (
                  <CenaRow
                    key={cena.id}
                    cena={cena}
                    index={idx}
                    campaignId={campaignId}
                    missaoId={missaoId}
                    onDelete={() => handleDeleteCena(cena.id)}
                  />
                ))}
              </div>
            ))}
          </TabsContent>

          {/* NARRATIVA */}
          {hasNarrativa && (
            <TabsContent value="narrativa" className="space-y-4">
              {missao.historico && (
                <Block title="Histórico">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{missao.historico}</p>
                </Block>
              )}
              {missao.prologo && (
                <Block title="Prólogo">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap italic">{missao.prologo}</p>
                </Block>
              )}
              {missao.epilogo && (
                <Block title="Epílogo">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap italic">{missao.epilogo}</p>
                </Block>
              )}
            </TabsContent>
          )}

          {/* HANDOUTS */}
          {hasHandouts && (
            <TabsContent value="handouts" className="space-y-4">
              {missao.handouts.map((h, i) => (
                <Block key={i} title={h.titulo || `Handout ${i + 1}`}>
                  <div className="space-y-3">
                    {h.image_url && (
                      <div className="relative w-full max-h-96 overflow-hidden border border-border">
                        <Image
                          src={h.image_url}
                          alt={h.titulo}
                          width={800}
                          height={600}
                          className="w-full h-auto object-contain"
                          unoptimized
                        />
                      </div>
                    )}
                    {h.conteudo && (
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-mono text-xs">{h.conteudo}</p>
                    )}
                  </div>
                </Block>
              ))}
            </TabsContent>
          )}

          {/* NOTAS */}
          {hasNotas && (
            <TabsContent value="notas">
              <Block title="Notas do Mestre">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{missao.notas}</p>
              </Block>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </>
  );
}

function CenaRow({
  cena, index, campaignId, missaoId, onDelete,
}: {
  cena: Cena; index: number; campaignId: string; missaoId: string; onDelete: () => void;
}) {
  return (
    <div className="group flex items-center gap-3 border border-border bg-card p-3 hover:border-primary/30 transition-colors">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-muted text-[10px] font-mono text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </div>
      <Link
        href={`/campanhas/${campaignId}/missoes/${missaoId}/cenas/${cena.id}`}
        className="flex-1 min-w-0"
      >
        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{cena.titulo}</p>
        <Badge variant="outline" className={`mt-0.5 text-[10px] uppercase tracking-wider ${TIPO_COLOR[cena.tipo]}`}>
          {TIPO_LABEL[cena.tipo]}
        </Badge>
      </Link>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/campanhas/${campaignId}/missoes/${missaoId}/cenas/${cena.id}/editar`}>
            <Pencil className="h-3.5 w-3.5" />
          </Link>
        </Button>
        <ConfirmDialog
          title="Remover cena"
          description={`A cena "${cena.titulo}" será removida permanentemente. Esta ação não pode ser desfeita.`}
          onConfirm={onDelete}
        >
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </ConfirmDialog>
      </div>
      <Button asChild variant="ghost" size="sm" title="Ver cena">
        <Link href={`/campanhas/${campaignId}/missoes/${missaoId}/cenas/${cena.id}`}>
          <ScrollText className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>
      </Button>
    </div>
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

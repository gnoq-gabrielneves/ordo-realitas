"use client";

import { useCampanha, useDeleteCampanha, useMissoes } from "@/features/campanhas/hooks/useCampanhas";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ArrowLeft, BookOpen, Pencil, PlusIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CampanhaDetailPageProps { id: string }

export function CampanhaDetailPage({ id }: CampanhaDetailPageProps) {
  const router = useRouter();
  const { data: campanha, isLoading, isError } = useCampanha(id);
  const { data: missoes = [] } = useMissoes(id);
  const { mutate: deletar, isPending: deleting } = useDeleteCampanha();

  function handleDelete() {
    deletar(id, { onSuccess: () => router.push("/campanhas") });
  }

  if (isLoading) return (
    <>
      <AppHeader title="Campanha" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-5 w-64 bg-muted animate-pulse rounded-sm" />)}</div>
      </main>
    </>
  );

  if (isError || !campanha) return (
    <>
      <AppHeader title="Campanha" />
      <main className="flex-1 overflow-y-auto p-6">
        <p className="text-sm text-destructive">Campanha não encontrada nos arquivos.</p>
      </main>
    </>
  );

  const prologo = missoes.find((m) => m.is_prologo);
  const missoesPrincipais = missoes.filter((m) => !m.is_prologo).sort((a, b) => a.numero - b.numero);

  return (
    <>
      <AppHeader title={campanha.name} />
      <main className="flex-1 overflow-y-auto p-6">
        <Link href="/campanhas" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit">
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para Campanhas
        </Link>

        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center border border-border bg-muted text-muted-foreground overflow-hidden">
              {campanha.image_url
                ? <Image src={campanha.image_url} alt={campanha.name} fill className="object-cover" />
                : <BookOpen className="h-6 w-6" />
              }
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{campanha.name}</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {campanha.vilao && (
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                    Vilão: {campanha.vilao}
                  </Badge>
                )}
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  NEX {campanha.nex_inicial}% → {campanha.nex_final}%
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {missoes.length} {missoes.length === 1 ? "missão" : "missões"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild variant="outline" size="sm">
              <Link href={`/campanhas/${id}/editar`}>
                <Pencil className="h-3.5 w-3.5" /> Editar
              </Link>
            </Button>
            <ConfirmDialog
              title="Remover campanha"
              description="Esta campanha e todas as suas missões e cenas serão removidas permanentemente dos arquivos da Ordo. Esta ação não pode ser desfeita."
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

        <Tabs defaultValue="missoes">
          <TabsList className="mb-6">
            <TabsTrigger value="missoes">Missões</TabsTrigger>
            {campanha.synopsis && <TabsTrigger value="sinopse">Sinopse</TabsTrigger>}
            {campanha.historico && <TabsTrigger value="historico">Histórico</TabsTrigger>}
            {campanha.notas && <TabsTrigger value="notas">Notas</TabsTrigger>}
          </TabsList>

          {/* MISSÕES */}
          <TabsContent value="missoes" className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Dossiês</p>
              <Button asChild variant="outline" size="sm">
                <Link href={`/campanhas/${id}/missoes/nova`}>
                  <PlusIcon className="h-3.5 w-3.5" /> Nova Missão
                </Link>
              </Button>
            </div>

            {missoes.length === 0 && (
              <div className="border border-dashed border-border py-12 text-center">
                <p className="text-xs text-muted-foreground">Nenhuma missão cadastrada.</p>
              </div>
            )}

            {prologo && (
              <MissaoRow missao={prologo} campaignId={id} />
            )}

            {missoesPrincipais.map((m) => (
              <MissaoRow key={m.id} missao={m} campaignId={id} />
            ))}
          </TabsContent>

          {campanha.synopsis && (
            <TabsContent value="sinopse">
              <Block title="Sinopse">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{campanha.synopsis}</p>
              </Block>
            </TabsContent>
          )}

          {campanha.historico && (
            <TabsContent value="historico">
              <Block title="Histórico">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{campanha.historico}</p>
              </Block>
            </TabsContent>
          )}

          {campanha.notas && (
            <TabsContent value="notas">
              <Block title="Notas do Mestre">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{campanha.notas}</p>
              </Block>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </>
  );
}

function MissaoRow({ missao, campaignId }: { missao: import("@/shared/types/campaign").Missao; campaignId: string }) {
  return (
    <Link
      href={`/campanhas/${campaignId}/missoes/${missao.id}`}
      className="group flex items-start gap-4 border border-border bg-card p-4 hover:border-primary/40 transition-colors"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-muted text-xs font-mono text-muted-foreground">
        {missao.is_prologo ? "P" : String(missao.numero).padStart(2, "0")}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
          {missao.titulo}
        </p>
        {missao.resumo && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{missao.resumo}</p>
        )}
        {(missao.nex_inicial != null || missao.nex_final != null) && (
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
            NEX {missao.nex_inicial ?? "?"}% → {missao.nex_final ?? "?"}%
          </p>
        )}
      </div>
      {missao.is_prologo && (
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider shrink-0">Prólogo</Badge>
      )}
    </Link>
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

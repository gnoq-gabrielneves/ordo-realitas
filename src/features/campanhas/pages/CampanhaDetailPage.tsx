"use client";

import { useCampanha, useDeleteCampanha, useMissoes } from "@/features/campanhas/hooks/useCampanhas";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Campanha, Missao } from "@/shared/types/campaign";
import { ArrowLeft, BookOpen, FileText, Flag, Pencil, PlusIcon, ScrollText, ShieldAlert, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface CampanhaDetailPageProps { id: string }

function InfoTile({ label, value, icon }: { label: string; value: string | number; icon: ReactNode }) {
  return (
    <div className="border border-border bg-card p-4">
      <div className="mb-3 text-muted-foreground">{icon}</div>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
    </div>
  );
}

function TextBlock({ title, children, muted = false }: {
  title: string;
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <section>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
      <div className={muted ? "border border-border bg-muted/30 p-4" : "border border-border bg-card p-4"}>
        {children}
      </div>
    </section>
  );
}

function MissaoCard({ missao, campaignId }: { missao: Missao; campaignId: string }) {
  return (
    <Link
      href={`/campanhas/${campaignId}/missoes/${missao.id}`}
      className="group grid gap-3 border border-border bg-card p-4 hover:border-primary/40 sm:grid-cols-[44px_1fr_auto]"
    >
      <div className="flex h-11 w-11 items-center justify-center border border-border bg-muted font-mono text-xs text-muted-foreground">
        {missao.is_prologo ? "P" : String(missao.numero).padStart(2, "0")}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold group-hover:text-primary">{missao.titulo}</p>
          {missao.is_prologo && <Badge variant="outline" className="rounded-sm text-[10px] uppercase tracking-wider">Prólogo</Badge>}
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {missao.resumo || missao.historico || "Sem resumo. Adicione uma frase para lembrar o objetivo da missão."}
        </p>
      </div>
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground sm:justify-end">
        {(missao.nex_inicial != null || missao.nex_final != null) && (
          <span>NEX {missao.nex_inicial ?? "?"}% / {missao.nex_final ?? "?"}%</span>
        )}
        <ScrollText className="h-4 w-4" />
      </div>
    </Link>
  );
}

function CampaignHero({ campanha }: { campanha: Campanha }) {
  return (
    <div className="relative overflow-hidden border border-border bg-card">
      {campanha.image_url && (
        <Image src={campanha.image_url} alt="" fill className="object-cover opacity-15 blur-sm" />
      )}
      <div className="relative grid gap-5 p-5 lg:grid-cols-[112px_1fr]">
        <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden border border-border bg-muted text-muted-foreground">
          {campanha.image_url ? (
            <Image src={campanha.image_url} alt={campanha.name} fill className="object-cover" />
          ) : (
            <BookOpen className="h-8 w-8" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary/75">Dossiê de campanha</p>
          <h1 className="mt-2 text-2xl font-semibold">{campanha.name}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-sm text-[10px] uppercase tracking-wider">
              NEX {campanha.nex_inicial}% / {campanha.nex_final}%
            </Badge>
            {campanha.vilao && (
              <Badge variant="destructive" className="rounded-sm text-[10px] uppercase tracking-wider">
                Antagonista: {campanha.vilao}
              </Badge>
            )}
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {campanha.synopsis || "Sem sinopse cadastrada. Use este espaço para registrar a premissa da campanha e orientar as próximas sessões."}
          </p>
        </div>
      </div>
    </div>
  );
}

export function CampanhaDetailPage({ id }: CampanhaDetailPageProps) {
  const router = useRouter();
  const { data: campanha, isLoading, isError } = useCampanha(id);
  const { data: missoes = [] } = useMissoes(id);
  const { mutateAsync: deletar, isPending: deleting } = useDeleteCampanha();

  async function handleDelete() {
    await deletar(id);
    router.replace("/campanhas");
  }

  if (isLoading) return (
    <main className="flex-1 overflow-y-auto p-5 lg:p-8">
      <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-8 w-72 animate-pulse bg-muted" />)}</div>
    </main>
  );

  if (isError || !campanha) return (
    <main className="flex-1 overflow-y-auto p-5 lg:p-8">
      <p className="text-sm text-destructive">Campanha não encontrada nos arquivos.</p>
    </main>
  );

  const prologo = missoes.find((m) => m.is_prologo);
  const missoesPrincipais = missoes.filter((m) => !m.is_prologo).sort((a, b) => a.numero - b.numero);
  const orderedMissions = prologo ? [prologo, ...missoesPrincipais] : missoesPrincipais;

  return (
    <main className="flex-1 overflow-y-auto">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-5 py-4 backdrop-blur lg:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="shrink-0 px-0 text-muted-foreground hover:text-foreground">
              <Link href="/campanhas">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Dossiê de campanha
              </p>
              <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">{campanha.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
              <Button variant="outline" size="sm" className="text-destructive hover:border-destructive/40 hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </ConfirmDialog>
          </div>
        </div>
      </header>

      <div className="px-5 py-6 lg:px-8">
        <div className="space-y-6">
          <CampaignHero campanha={campanha} />

          <section className="grid gap-3 sm:grid-cols-3">
            <InfoTile label="Missões" value={missoes.length} icon={<Flag className="h-4 w-4" />} />
            <InfoTile label="NEX inicial" value={`${campanha.nex_inicial}%`} icon={<BookOpen className="h-4 w-4" />} />
            <InfoTile label="NEX final" value={`${campanha.nex_final}%`} icon={<ShieldAlert className="h-4 w-4" />} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <section>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    <Flag className="h-3.5 w-3.5" />
                    Missões da operação
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/campanhas/${id}/missoes/nova`}>
                      <PlusIcon className="h-3.5 w-3.5" /> Nova missão
                    </Link>
                  </Button>
                </div>

                {orderedMissions.length === 0 ? (
                  <div className="border border-dashed border-border py-12 text-center">
                    <p className="text-sm font-medium">Nenhuma missão cadastrada.</p>
                    <p className="mt-1 text-xs text-muted-foreground">Crie a primeira missão para começar a estruturar a campanha.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orderedMissions.map((m) => (
                      <MissaoCard key={m.id} missao={m} campaignId={id} />
                    ))}
                  </div>
                )}
              </section>

              {campanha.historico && (
                <TextBlock title="Histórico">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{campanha.historico}</p>
                </TextBlock>
              )}
            </div>

            <aside className="space-y-6">
              <TextBlock title="Preparo do mestre" muted>
                <div className="space-y-3 text-sm">
                  <PrepLine done={Boolean(campanha.synopsis)} label="Sinopse definida" />
                  <PrepLine done={Boolean(campanha.vilao)} label="Antagonista definido" />
                  <PrepLine done={missoes.length > 0} label="Missões cadastradas" />
                  <PrepLine done={Boolean(campanha.notas)} label="Notas internas registradas" />
                </div>
              </TextBlock>

              {campanha.notas ? (
                <TextBlock title="Notas do mestre">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{campanha.notas}</p>
                </TextBlock>
              ) : (
                <TextBlock title="Notas do mestre" muted>
                  <p className="text-sm text-muted-foreground">Nenhuma nota interna cadastrada.</p>
                </TextBlock>
              )}

              <TextBlock title="Atalhos">
                <div className="grid gap-2">
                  <Link href="/apresentacao" className="flex items-center gap-2 border border-border bg-background px-3 py-2 text-sm hover:border-primary/40">
                    <FileText className="h-4 w-4 text-primary" />
                    Preparar tela de exibição
                  </Link>
                  <Link href="/combate" className="flex items-center gap-2 border border-border bg-background px-3 py-2 text-sm hover:border-primary/40">
                    <ShieldAlert className="h-4 w-4 text-primary" />
                    Abrir combate
                  </Link>
                </div>
              </TextBlock>
            </aside>
          </section>
        </div>
      </div>
    </main>
  );
}

function PrepLine({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={done ? "h-2 w-2 bg-primary" : "h-2 w-2 border border-amber-600"} />
      <span className={done ? "text-muted-foreground line-through decoration-muted-foreground/40" : "text-foreground"}>{label}</span>
    </div>
  );
}

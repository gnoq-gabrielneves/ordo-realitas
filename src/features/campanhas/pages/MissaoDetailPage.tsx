"use client";

import { useCenas, useDeleteCena, useDeleteMissao, useMissao } from "@/features/campanhas/hooks/useCampanhas";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Cena, SceneTipo } from "@/shared/types/campaign";
import { ArrowLeft, BookOpen, Clock, FileImage, MapPin, MessageSquare, Pencil, PlusIcon, ScrollText, StickyNote, Trash2 } from "lucide-react";
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

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-border bg-card p-4">
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
    </div>
  );
}

function SideBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
      <div className="border border-border bg-card p-4">{children}</div>
    </section>
  );
}

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
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-8 w-72 animate-pulse bg-muted" />)}</div>
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

  const cenasOrdenadas = [...cenas].sort((a, b) => a.ordem - b.ordem);
  const partes = cenasOrdenadas.reduce<Record<string, Cena[]>>((acc, cena) => {
    const key = cena.parte ?? "__sem_parte__";
    if (!acc[key]) acc[key] = [];
    acc[key].push(cena);
    return acc;
  }, {});
  const cenasCombate = cenas.filter((c) => c.tipo === "combate").length;
  const cenasInvestigacao = cenas.filter((c) => c.tipo === "investigacao").length;

  return (
    <>
      <AppHeader title={missao.titulo} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link href={`/campanhas/${campaignId}`} className="flex w-fit items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar para campanha
          </Link>
          <div className="flex items-center gap-2">
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
              <Button variant="outline" size="sm" className="text-destructive hover:border-destructive/40 hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </ConfirmDialog>
          </div>
        </div>

        <div className="space-y-6">
          <section className="border border-border bg-card p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary/75">
                  {missao.is_prologo ? "Prólogo" : `Missão ${String(missao.numero).padStart(2, "0")}`}
                </p>
                <h1 className="mt-2 text-2xl font-semibold">{missao.titulo}</h1>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {missao.resumo || "Sem resumo cadastrado. Adicione uma frase de objetivo para orientar a sessão."}
                </p>
              </div>
              {(missao.nex_inicial != null || missao.nex_final != null) && (
                <Badge variant="outline" className="w-fit rounded-sm text-[10px] uppercase tracking-wider">
                  NEX {missao.nex_inicial ?? "?"}% / {missao.nex_final ?? "?"}%
                </Badge>
              )}
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-4">
            <Metric label="Cenas" value={cenas.length} />
            <Metric label="Investigação" value={cenasInvestigacao} />
            <Metric label="Combate" value={cenasCombate} />
            <Metric label="Handouts" value={missao.handouts.length} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <section>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    <ScrollText className="h-3.5 w-3.5" />
                    Sequência da sessão
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/campanhas/${campaignId}/missoes/${missaoId}/cenas/nova`}>
                      <PlusIcon className="h-3.5 w-3.5" /> Nova cena
                    </Link>
                  </Button>
                </div>

                {cenas.length === 0 ? (
                  <div className="border border-dashed border-border py-12 text-center">
                    <p className="text-sm font-medium">Nenhuma cena cadastrada.</p>
                    <p className="mt-1 text-xs text-muted-foreground">Crie cenas para transformar esta missão em roteiro de sessão.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(partes).map(([parte, scenesInParte]) => (
                      <div key={parte} className="space-y-2">
                        {parte !== "__sem_parte__" && (
                          <p className="border-b border-border pb-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                            {parte}
                          </p>
                        )}
                        {scenesInParte.map((cena, idx) => (
                          <CenaRow
                            key={cena.id}
                            cena={cena}
                            index={cenasOrdenadas.findIndex((item) => item.id === cena.id)}
                            isLast={idx === scenesInParte.length - 1}
                            campaignId={campaignId}
                            missaoId={missaoId}
                            onDelete={() => handleDeleteCena(cena.id)}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {(missao.historico || missao.prologo || missao.epilogo) && (
                <section className="space-y-4">
                  {missao.historico && (
                    <SideBlock title="Histórico">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{missao.historico}</p>
                    </SideBlock>
                  )}
                  {missao.prologo && (
                    <SideBlock title="Prólogo para leitura">
                      <p className="whitespace-pre-wrap text-sm italic leading-relaxed">{missao.prologo}</p>
                    </SideBlock>
                  )}
                  {missao.epilogo && (
                    <SideBlock title="Epílogo">
                      <p className="whitespace-pre-wrap text-sm italic leading-relaxed">{missao.epilogo}</p>
                    </SideBlock>
                  )}
                </section>
              )}
            </div>

            <aside className="space-y-6">
              <SideBlock title="Preparo rápido">
                <div className="space-y-3 text-sm">
                  <PrepLine done={Boolean(missao.resumo)} label="Resumo da missão" />
                  <PrepLine done={cenas.length > 0} label="Cenas em sequência" />
                  <PrepLine done={missao.handouts.length > 0} label="Handouts preparados" />
                  <PrepLine done={Boolean(missao.notas)} label="Notas internas" />
                </div>
              </SideBlock>

              <SideBlock title="Handouts">
                {missao.handouts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum handout cadastrado.</p>
                ) : (
                  <div className="space-y-3">
                    {missao.handouts.map((h, i) => (
                      <div key={i} className="border border-border bg-background p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <FileImage className="h-4 w-4 text-primary" />
                          <p className="truncate text-sm font-medium">{h.titulo || `Handout ${i + 1}`}</p>
                        </div>
                        {h.image_url && (
                          <div className="relative mb-2 h-28 overflow-hidden border border-border bg-muted">
                            <Image src={h.image_url} alt={h.titulo} fill className="object-cover" unoptimized />
                          </div>
                        )}
                        {h.conteudo && <p className="line-clamp-3 text-xs text-muted-foreground">{h.conteudo}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </SideBlock>

              <SideBlock title="Notas do mestre">
                {missao.notas ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{missao.notas}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma nota interna cadastrada.</p>
                )}
              </SideBlock>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
}

function CenaRow({
  cena,
  index,
  isLast,
  campaignId,
  missaoId,
  onDelete,
}: {
  cena: Cena;
  index: number;
  isLast: boolean;
  campaignId: string;
  missaoId: string;
  onDelete: () => void;
}) {
  const hasTexto = Boolean(cena.texto_descritivo);
  const hasRoteiro = cena.roteiro.length > 0;
  const hasLugar = Boolean(cena.lugar_id);
  const hasNotas = Boolean(cena.notas_mestre);
  const readyCount = [hasTexto, hasRoteiro, hasNotas].filter(Boolean).length;

  return (
    <div className="group relative grid gap-3 border border-border bg-card p-4 hover:border-primary/40 sm:grid-cols-[44px_1fr_auto] sm:items-start">
      {!isLast && (
        <span className="absolute left-[37px] top-16 hidden h-[calc(100%-2rem)] w-px bg-border sm:block" />
      )}
      <div className="relative z-10 flex h-11 w-11 items-center justify-center border border-border bg-muted font-mono text-[10px] text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </div>
      <Link href={`/campanhas/${campaignId}/missoes/${missaoId}/cenas/${cena.id}`} className="min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold group-hover:text-primary">{cena.titulo}</p>
          <Badge variant="outline" className={`rounded-sm text-[10px] uppercase tracking-wider ${TIPO_COLOR[cena.tipo]}`}>
            {TIPO_LABEL[cena.tipo]}
          </Badge>
          {cena.urgencia && (
            <Badge variant="secondary" className="rounded-sm text-[10px] uppercase tracking-wider">
              <Clock className="h-3 w-3" /> Urgência
            </Badge>
          )}
        </div>
        <p className="line-clamp-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          {cena.texto_descritivo || cena.notas_mestre || "Sem descrição breve."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <SceneChip active={hasTexto} icon={<BookOpen className="h-3 w-3" />} label="texto" />
          <SceneChip active={hasRoteiro} icon={<MessageSquare className="h-3 w-3" />} label={`${cena.roteiro.length} blocos`} />
          <SceneChip active={hasLugar} icon={<MapPin className="h-3 w-3" />} label="lugar" />
          <SceneChip active={hasNotas} icon={<StickyNote className="h-3 w-3" />} label="notas" />
          <span className="border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            Preparo {readyCount}/3
          </span>
        </div>
      </Link>
      <div className="flex items-center gap-1 sm:justify-end">
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
    </div>
  );
}

function SceneChip({ active, icon, label }: { active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <span className={active
      ? "inline-flex items-center gap-1 border border-primary/30 bg-primary/5 px-2 py-1 text-[10px] uppercase tracking-wider text-primary"
      : "inline-flex items-center gap-1 border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground/70"
    }>
      {icon}
      {label}
    </span>
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

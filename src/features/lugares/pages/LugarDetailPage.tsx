"use client";

import { LugarCard } from "@/features/lugares/components/LugarCard";
import { useDeleteLugar, useLugar, useSubLugares } from "@/features/lugares/hooks/useLugares";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Place } from "@/shared/types/place";
import {
  ArrowLeft,
  BookOpen,
  Eye,
  FileWarning,
  FolderTree,
  MapPin,
  Pencil,
  PlusIcon,
  RadioTower,
  ScanSearch,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

const atividadeMeta: Record<string, { label: string; className: string; description: string }> = {
  nenhuma: {
    label: "Sem atividade",
    className: "border-border text-muted-foreground",
    description: "Nenhum sinal paranormal claro no local.",
  },
  baixa: {
    label: "Baixa",
    className: "border-amber-300 text-amber-700",
    description: "Sinais sutis, úteis para pistas e presságios.",
  },
  moderada: {
    label: "Moderada",
    className: "border-orange-300 text-orange-700",
    description: "O paranormal interfere na cena e pode alterar decisões.",
  },
  alta: {
    label: "Alta",
    className: "border-primary/40 text-primary",
    description: "O local está perigoso e deve pressionar os agentes.",
  },
  critica: {
    label: "Crítica",
    className: "border-destructive/40 text-destructive",
    description: "A Membrana está em colapso ou o local é hostil por natureza.",
  },
};

const origemLabel: Record<string, string> = {
  sangue: "Sangue",
  morte: "Morte",
  medo: "Medo",
  conhecimento: "Conhecimento",
  energia: "Energia",
};

const membranaLabel: Record<string, string> = {
  integra: "Íntegra",
  enfraquecida: "Enfraquecida",
  rompida: "Rompida",
};

interface LugarDetailPageProps { id: string }

export function LugarDetailPage({ id }: LugarDetailPageProps) {
  const router = useRouter();
  const { data: lugar, isLoading, isError } = useLugar(id);
  const { data: subLugares = [] } = useSubLugares(id);
  const { mutateAsync: deletar, isPending: deleting } = useDeleteLugar();

  async function handleDelete() {
    const backTo = lugar?.parent_id ? `/lugares/${lugar.parent_id}` : "/lugares";
    await deletar(id);
    router.replace(backTo);
  }

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto p-5 lg:p-8">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-8 w-72 animate-pulse bg-muted" />)}
        </div>
      </main>
    );
  }

  if (isError || !lugar) {
    return (
      <main className="flex-1 overflow-y-auto p-5 lg:p-8">
        <p className="text-sm text-destructive">Lugar não encontrado nos arquivos.</p>
      </main>
    );
  }

  const backHref = lugar.parent_id ? `/lugares/${lugar.parent_id}` : "/lugares";
  const atividade = lugar.atividade_paranormal ? atividadeMeta[lugar.atividade_paranormal] : null;
  const hasDossie = Boolean(lugar.backstory);
  const hasSegredos = lugar.notas || lugar.segredos;

  return (
    <main className="flex-1 overflow-y-auto">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-5 py-4 backdrop-blur lg:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="shrink-0 px-0 text-muted-foreground hover:text-foreground">
              <Link href={backHref}>
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Dossiê de lugar
              </p>
              <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">{lugar.name}</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
              <Button variant="outline" size="sm" className="text-destructive hover:border-destructive/40 hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </ConfirmDialog>
          </div>
        </div>
      </header>

      <div className="grid gap-6 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <div className="space-y-6">
          <section className="grid gap-6 border border-border bg-card p-5 lg:grid-cols-[220px_minmax(0,1fr)]">
            <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden border border-border bg-muted text-muted-foreground">
              {lugar.image_url ? (
                <Image src={lugar.image_url} alt={lugar.name} fill className="object-cover" priority />
              ) : (
                <MapPin className="h-10 w-10" />
              )}
            </div>

            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap gap-2">
                {lugar.tipo && <Badge variant="secondary" className="uppercase tracking-[0.16em]">{lugar.tipo}</Badge>}
                {atividade && lugar.atividade_paranormal !== "nenhuma" && (
                  <Badge variant="outline" className={`uppercase tracking-[0.16em] ${atividade.className}`}>{atividade.label}</Badge>
                )}
                {lugar.parent_id && <Badge variant="outline" className="uppercase tracking-[0.16em]">Sub-lugar</Badge>}
              </div>

              <h2 className="text-3xl font-semibold tracking-tight text-foreground">{lugar.name}</h2>
              {lugar.localizacao && (
                <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {lugar.localizacao}
                </p>
              )}
              {lugar.descricao && (
                <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground">{lugar.descricao}</p>
              )}

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <MiniStat label="Pontos" value={lugar.pontos_de_interesse.length} />
                <MiniStat label="Sub-lugares" value={subLugares.length} />
                <MiniStat label="Testes" value={countTests(lugar)} />
              </div>
            </div>
          </section>

          <Section
            icon={<RadioTower className="h-5 w-5" />}
            title="Status Paranormal"
            description="Use estes dados como leitura rápida de risco, elemento dominante e pressão narrativa do lugar."
          >
            <div className="grid gap-3 md:grid-cols-3">
              <InfoBox label="Atividade" value={atividade?.label ?? "Não definida"} detail={atividade?.description ?? "Defina o nível de manifestação paranormal."} />
              <InfoBox label="Origem" value={lugar.origem ? origemLabel[lugar.origem] : "Não definida"} detail="Elemento paranormal dominante, quando houver." />
              <InfoBox label="Membrana" value={lugar.membrana ? membranaLabel[lugar.membrana] : "Não definida"} detail="Estado da barreira entre realidade e Outro Lado." />
            </div>
            {lugar.atmosfera && (
              <div className="mt-4 border border-border bg-background/60 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Atmosfera</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground whitespace-pre-wrap">{lugar.atmosfera}</p>
              </div>
            )}
          </Section>

          <Section
            icon={<ScanSearch className="h-5 w-5" />}
            title="Pontos de Interesse"
            description="Pistas, salas, objetos de cena e testes que você quer ter prontos durante a investigação."
            action={(
              <Button asChild variant="outline" size="sm">
                <Link href={`/lugares/${id}/editar`}>
                  <PlusIcon className="h-3.5 w-3.5" />
                  Editar pontos
                </Link>
              </Button>
            )}
          >
            {lugar.pontos_de_interesse.length === 0 ? (
              <EmptyBlock text="Nenhum ponto de interesse cadastrado." />
            ) : (
              <div className="grid gap-4">
                {lugar.pontos_de_interesse.map((ponto, index) => (
                  <div key={`${ponto.nome}-${index}`} className="border border-border bg-background/60 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-foreground">{ponto.nome || `Ponto ${index + 1}`}</p>
                        {ponto.descricao && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{ponto.descricao}</p>}
                      </div>
                      {(ponto.testes ?? []).length > 0 && (
                        <span className="border border-border px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                          {(ponto.testes ?? []).length} {(ponto.testes ?? []).length === 1 ? "teste" : "testes"}
                        </span>
                      )}
                    </div>

                    {(ponto.testes ?? []).length > 0 && (
                      <div className="mt-4 grid gap-3">
                        {(ponto.testes ?? []).map((teste, testIndex) => (
                          <div key={`${teste.pericia}-${testIndex}`} className="border border-border bg-card p-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-primary">{teste.pericia || "Perícia"}</span>
                              {teste.dt && <span className="border border-border px-2 py-0.5 text-xs text-muted-foreground">DT {teste.dt}</span>}
                              <span className="border border-border px-2 py-0.5 text-xs text-muted-foreground">
                                {(teste.tipo ?? "jogador") === "mestre" ? "Mestre pede" : "Jogador procura"}
                              </span>
                            </div>
                            {teste.descricao && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{teste.descricao}</p>}
                            {(teste.sucesso || teste.falha) && (
                              <div className="mt-3 grid gap-2 md:grid-cols-2">
                                {teste.sucesso && <Outcome label="Se passar" value={teste.sucesso} tone="success" />}
                                {teste.falha && <Outcome label="Se falhar" value={teste.falha} tone="danger" />}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section
            icon={<FolderTree className="h-5 w-5" />}
            title="Sub-lugares"
            description="Quebre um local grande em salas, rotas, andares, esconderijos ou zonas de cena."
            action={(
              <Button asChild variant="outline" size="sm">
                <Link href={`/lugares/novo?parent=${id}`}>
                  <PlusIcon className="h-3.5 w-3.5" />
                  Adicionar
                </Link>
              </Button>
            )}
          >
            {subLugares.length === 0 ? (
              <EmptyBlock text="Nenhum sub-lugar cadastrado." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {subLugares.map((subLugar) => <LugarCard key={subLugar.id} lugar={subLugar} />)}
              </div>
            )}
          </Section>

          {hasDossie && (
            <Section icon={<BookOpen className="h-5 w-5" />} title="Dossiê Narrativo" description="Material para descrever o local, revelar história e manter consistência na sessão.">
              <div className="grid gap-4">
                {lugar.backstory && <TextBlock label="História" value={lugar.backstory} />}
              </div>
            </Section>
          )}
        </div>

        <aside className="space-y-5">
          <div className="sticky top-24 space-y-5">
            <section className="border border-border bg-card">
              <div className="border-b border-border p-5">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  Resumo do mestre
                </div>
              </div>
              <div className="grid gap-3 p-5">
                <SummaryRow label="Tipo" value={lugar.tipo ?? "Não definido"} />
                <SummaryRow label="Localização" value={lugar.localizacao ?? "Não definida"} />
                <SummaryRow label="Atividade" value={atividade?.label ?? "Não definida"} />
                <SummaryRow label="Origem" value={lugar.origem ? origemLabel[lugar.origem] : "Não definida"} />
                <SummaryRow label="Membrana" value={lugar.membrana ? membranaLabel[lugar.membrana] : "Não definida"} />
              </div>
            </section>

            {hasSegredos && (
              <section className="border border-primary/25 bg-primary/5">
                <div className="border-b border-primary/20 p-5">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                    <FileWarning className="h-4 w-4" />
                    Apenas mestre
                  </div>
                </div>
                <div className="space-y-4 p-5">
                  {lugar.notas && <TextBlock label="Notas" value={lugar.notas} />}
                  {lugar.segredos && <TextBlock label="Segredos" value={lugar.segredos} />}
                </div>
              </section>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

function countTests(lugar: Place) {
  return lugar.pontos_de_interesse.reduce((total, ponto) => total + (ponto.testes?.length ?? 0), 0);
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border bg-background/60 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Section({ icon, title, description, action, children }: { icon: ReactNode; title: string; description: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="border border-border bg-card">
      <div className="flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-foreground">
            <span className="text-primary">{icon}</span>
            <h2 className="text-lg font-semibold uppercase tracking-[0.18em]">{title}</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function InfoBox({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="border border-border bg-background/60 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function Outcome({ label, value, tone }: { label: string; value: string; tone: "success" | "danger" }) {
  return (
    <div className="border border-border bg-background/60 p-3">
      <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${tone === "success" ? "text-emerald-600" : "text-destructive"}`}>
        {label}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-foreground">{value}</p>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-background/60 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-border py-10 text-center">
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

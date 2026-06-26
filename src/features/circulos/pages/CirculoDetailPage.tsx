"use client";

import { useCirculo, useDeleteCirculo } from "@/features/circulos/hooks/useCirculos";
import { useSujeitos } from "@/features/sujeitos/hooks/useSujeitos";
import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, Building2, Edit3, Network, Trash2, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const tipoLabel: Record<string, string> = {
  organizacao: "Organização",
  familia: "Família",
  culto: "Culto",
  faccao: "Facção",
  grupo: "Grupo",
  outro: "Outro",
};

export function CirculoDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { data: circulo, isLoading, isError } = useCirculo(id);
  const { data: sujeitos = [] } = useSujeitos();
  const { mutate: remove, isPending } = useDeleteCirculo();

  if (isLoading) return <PageState text="Carregando círculo..." />;
  if (isError || !circulo) return <PageState text="Círculo não encontrado." />;

  const membros = sujeitos.filter((sujeito) => sujeito.circle_id === circulo.id);

  function handleDelete() {
    remove(id, { onSuccess: () => router.replace("/circulos") });
  }

  return (
    <>
      <AppHeader title={circulo.nome} />
      <main className="flex-1 overflow-y-auto">
        <section className="border-b border-border bg-background px-6 py-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <Link href="/circulos" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Voltar para círculos
              </Link>
              <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-start">
                <div className="relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden border border-border bg-muted">
                  {circulo.image_url ? (
                    <Image src={circulo.image_url} alt={circulo.nome} fill className="object-cover" />
                  ) : (
                    <Network className="h-10 w-10 text-muted-foreground/40" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-none uppercase tracking-wider">{tipoLabel[circulo.tipo] ?? circulo.tipo}</Badge>
                    {circulo.reputacao && <Badge variant="secondary" className="rounded-none uppercase tracking-wider">{circulo.reputacao}</Badge>}
                  </div>
                  <h1 className="mt-3 text-4xl font-semibold tracking-tight">{circulo.nome}</h1>
                  {circulo.descricao && <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{circulo.descricao}</p>}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href={`/circulos/${id}/editar`}>
                  <Edit3 className="h-4 w-4" />
                  Editar
                </Link>
              </Button>
              <ConfirmDialog
                title="Remover círculo"
                description="Este círculo será removido e os sujeitos vinculados ficarão sem círculo. Esta ação não pode ser desfeita."
                onConfirm={handleDelete}
                disabled={isPending}
              >
                <Button variant="destructive"><Trash2 className="h-4 w-4" />Remover</Button>
              </ConfirmDialog>
            </div>
          </div>
        </section>

        <section className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <Section title="Dossiê" icon={<Building2 className="h-4 w-4" />}>
              <div className="grid gap-4 md:grid-cols-2">
                <Info label="Sede" value={circulo.sede || "Não definida"} />
                <Info label="Liderança" value={circulo.lideranca || "Não definida"} />
                <Info label="Objetivo" value={circulo.objetivo || "Não definido"} wide />
                <Info label="Segredos" value={circulo.segredos || "Sem segredos registrados"} wide />
                <Info label="Notas" value={circulo.notas || "Sem notas"} wide />
              </div>
            </Section>
          </div>

          <Section title="Sujeitos Vinculados" icon={<UsersRound className="h-4 w-4" />}>
            {membros.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum sujeito vinculado a este círculo.</p>
            ) : (
              <div className="space-y-2">
                {membros.map((sujeito) => (
                  <Link key={sujeito.id} href={`/sujeitos/${sujeito.id}`} className="flex items-center gap-3 border border-border p-3 transition-colors hover:bg-muted/30">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-border bg-muted">
                      {sujeito.image_url ? <Image src={sujeito.image_url} alt={sujeito.name} fill className="object-cover" /> : <UsersRound className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{sujeito.name}</p>
                      <p className="text-xs text-muted-foreground">{sujeito.tipo ?? "Pessoa"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Section>
        </section>
      </main>
    </>
  );
}

function PageState({ text }: { text: string }) {
  return (
    <>
      <AppHeader title="Círculos" />
      <main className="flex-1 overflow-y-auto p-6">
        <p className="text-sm text-muted-foreground">{text}</p>
      </main>
    </>
  );
}

function Section({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <span className="text-primary">{icon}</span>
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em]">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Info({ label, value, wide }: { label: string; value: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{value}</p>
    </div>
  );
}

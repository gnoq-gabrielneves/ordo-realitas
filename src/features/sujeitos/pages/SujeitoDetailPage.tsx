"use client";

import { useDeleteSujeito, useSujeito } from "@/features/sujeitos/hooks/useSujeitos";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { Button } from "@/shared/components/ui/button";
import { ELEMENTO_BADGE } from "@/shared/constants/elements";
import { cn } from "@/shared/lib/utils";
import { NpcAcaoTipo } from "@/shared/types/npc";
import { RitualElemento } from "@/shared/types/ritual";
import {
  ArrowLeft,
  Eye,
  Gauge,
  Heart,
  NotebookText,
  Pencil,
  Shield,
  Skull,
  Sparkles,
  Swords,
  Trash2,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

const origemLabel: Record<string, string> = {
  sangue: "Sangue",
  morte: "Morte",
  medo: "Medo",
  conhecimento: "Conhecimento",
  energia: "Energia",
};

const acaoTipoLabel: Record<NpcAcaoTipo, string> = {
  padrao: "Padrão",
  movimento: "Movimento",
  livre: "Livre",
  completa: "Completa",
  reacao: "Reação",
};

interface SujeitoDetailPageProps {
  id: string;
}

export function SujeitoDetailPage({ id }: SujeitoDetailPageProps) {
  const router = useRouter();
  const { data: sujeito, isLoading, isError } = useSujeito(id);
  const { mutateAsync: deletar, isPending: deleting } = useDeleteSujeito();

  async function handleDelete() {
    await deletar(id);
    router.replace("/sujeitos");
    router.refresh();
  }

  if (isLoading) {
    return (
      <main className="grid h-full place-items-center">
        <p className="text-sm text-muted-foreground">Carregando sujeito...</p>
      </main>
    );
  }

  if (isError || !sujeito) {
    return (
      <main className="grid h-full place-items-center">
        <p className="text-sm text-destructive">Sujeito não encontrado nos arquivos.</p>
      </main>
    );
  }

  const isCriatura = sujeito.tipo === "criatura";
  const machucado = sujeito.pv ? Math.floor(sujeito.pv / 2) : null;
  const temFicha = sujeito.defesa != null || sujeito.pv != null || sujeito.agi != null || sujeito.pericias.length > 0;
  const temCombate = sujeito.habilidades.length > 0 || sujeito.acoes.length > 0;

  return (
    <main className="h-full overflow-y-auto bg-background">
      <header className={cn("border-b border-border px-6 py-5", isCriatura && "border-red-500/25 bg-red-500/[0.025]")}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link href="/sujeitos" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Voltar para sujeitos
          </Link>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href={`/sujeitos/${id}/editar`}>
                <Pencil className="h-4 w-4" />
                Editar sujeito
              </Link>
            </Button>
            <ConfirmDialog
              title="Remover sujeito"
              description="Este sujeito será removido permanentemente dos arquivos da Ordo. Esta ação não pode ser desfeita."
              onConfirm={handleDelete}
              disabled={deleting}
            >
              <Button variant="outline" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </ConfirmDialog>
          </div>
        </div>

        <section className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)_420px]">
          <div className={cn("relative aspect-square overflow-hidden border bg-muted", isCriatura ? "border-red-500/40" : "border-border")}>
            {sujeito.image_url ? (
              <Image src={sujeito.image_url} alt={sujeito.name} fill className="object-cover" />
            ) : (
              <div className="grid h-full place-items-center">
                {isCriatura ? <Skull className="h-14 w-14 text-red-500/40" /> : <UserRound className="h-14 w-14 text-muted-foreground/35" />}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <Tag danger={isCriatura}>{isCriatura ? "Criatura" : "Pessoa"}</Tag>
              {sujeito.origem && <Tag>{origemLabel[sujeito.origem]}</Tag>}
              {sujeito.tamanho && <Tag>{sujeito.tamanho}</Tag>}
              {sujeito.percepcao_as_cegas && <Tag>Percepção às cegas</Tag>}
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">{sujeito.name}</h1>
            {sujeito.descricao && (
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{sujeito.descricao}</p>
            )}
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <Info label="Tipo" value={sujeito.tipo ?? "Pessoa"} />
              <Info label="Origem" value={sujeito.origem ? origemLabel[sujeito.origem] : "Mundano"} />
              <Info label="Tamanho" value={sujeito.tamanho ?? "Não definido"} />
              <Info label="VD" value={sujeito.vd != null ? sujeito.vd : "Não definido"} danger={sujeito.vd != null} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <StatCard icon={<Shield className="h-4 w-4" />} label="Defesa" value={sujeito.defesa ?? "—"} detail="Valor de ataque contra o sujeito" />
            <StatCard icon={<Heart className="h-4 w-4" />} label="Pontos de Vida" value={sujeito.pv ?? "—"} detail={machucado != null ? `Machucado em ${machucado}` : "PV não definido"} tone="red" />
            {sujeito.pp_dt || sujeito.pp_dano || sujeito.pp_imune_nex ? (
              <StatCard
                icon={<Skull className="h-4 w-4" />}
                label="Presença Perturbadora"
                value={sujeito.pp_dt ? `DT ${sujeito.pp_dt}` : "Ativa"}
                detail={[sujeito.pp_dano, sujeito.pp_imune_nex ? `imune NEX ${sujeito.pp_imune_nex}` : null].filter(Boolean).join(" · ")}
                tone="purple"
              />
            ) : (
              <StatCard icon={<Gauge className="h-4 w-4" />} label="Deslocamento" value={sujeito.deslocamento ?? "—"} detail="Movimento em cena" />
            )}
          </div>
        </section>
      </header>

      <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {temCombate && (
            <Section title="Combate" icon={<Swords className="h-4 w-4" />} description="Ações e habilidades que importam durante iniciativa.">
              {sujeito.acoes.length > 0 && (
                <div className="grid gap-3 lg:grid-cols-2">
                  {sujeito.acoes.map((acao, index) => (
                    <ActionCard key={`${acao.nome}-${index}`} acao={acao} />
                  ))}
                </div>
              )}
              {sujeito.habilidades.length > 0 && (
                <div className={cn("grid gap-3 lg:grid-cols-2", sujeito.acoes.length > 0 && "mt-5")}>
                  {sujeito.habilidades.map((habilidade, index) => (
                    <div key={`${habilidade.nome}-${index}`} className="border border-border bg-background p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{habilidade.nome}</p>
                          {habilidade.acao && <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-primary">{habilidade.acao}</p>}
                        </div>
                        {habilidade.resistencia && (
                          <span className="border border-primary/30 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-primary">
                            {habilidade.resistencia}{habilidade.resistencia_dt ? ` DT ${habilidade.resistencia_dt}` : ""}
                          </span>
                        )}
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{habilidade.descricao}</p>
                      {(habilidade.opcoes ?? []).length > 0 && (
                        <div className="mt-3 space-y-2">
                          {(habilidade.opcoes ?? []).map((opcao, opIndex) => (
                            <div key={`${opcao.titulo}-${opIndex}`} className="border border-border/70 bg-muted/20 p-3">
                              {opcao.titulo && <p className="text-xs font-semibold text-foreground">{opcao.titulo}</p>}
                              {opcao.texto && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{opcao.texto}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Section>
          )}

          {sujeito.rituais.length > 0 && (
            <Section title="Rituais" icon={<Sparkles className="h-4 w-4" />} description="Rituais conhecidos ou usados por este sujeito.">
              <div className="grid gap-3 lg:grid-cols-2">
                {sujeito.rituais.map((ritual, index) => (
                  <div key={`${ritual.nome}-${index}`} className="border border-border bg-background p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{ritual.nome}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{ritual.grau || "Ritual"}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {ritual.elemento && <span className={cn("border px-1.5 py-0 text-[10px] uppercase tracking-[0.12em]", getElementoBadge(ritual.elemento))}>{ritual.elemento}</span>}
                        {ritual.custo_pe != null && <span className="border border-border px-1.5 py-0 text-[10px]">{ritual.custo_pe} PE</span>}
                        {ritual.dt && <span className="border border-border px-1.5 py-0 text-[10px]">DT {ritual.dt}</span>}
                      </div>
                    </div>
                    {ritual.descricao && <RitualDescricao descricao={ritual.descricao} />}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {temFicha && (
            <Section title="Ficha rápida" icon={<Eye className="h-4 w-4" />} description="Atributos, testes e proteções para consulta fora do combate.">
              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Atributos</p>
                  <div className="grid grid-cols-5 gap-2">
                    {sujeito.agi != null && <AttrBox label="AGI" value={sujeito.agi} />}
                    {sujeito.atrib_for != null && <AttrBox label="FOR" value={sujeito.atrib_for} />}
                    {sujeito.atrib_int != null && <AttrBox label="INT" value={sujeito.atrib_int} />}
                    {sujeito.pre != null && <AttrBox label="PRE" value={sujeito.pre} />}
                    {sujeito.vig != null && <AttrBox label="VIG" value={sujeito.vig} />}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Testes e sentidos</p>
                  <div className="grid grid-cols-2 gap-2">
                    {sujeito.percepcao && <MiniStat label="Percepção" value={sujeito.percepcao} />}
                    {sujeito.iniciativa && <MiniStat label="Iniciativa" value={sujeito.iniciativa} />}
                    {sujeito.fortitude && <MiniStat label="Fortitude" value={sujeito.fortitude} />}
                    {sujeito.reflexos && <MiniStat label="Reflexos" value={sujeito.reflexos} />}
                    {sujeito.vontade && <MiniStat label="Vontade" value={sujeito.vontade} />}
                    {sujeito.deslocamento && <MiniStat label="Deslocamento" value={sujeito.deslocamento} />}
                  </div>
                </div>
              </div>
              {sujeito.pericias.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Perícias</p>
                  <div className="flex flex-wrap gap-2">
                    {sujeito.pericias.map((pericia, index) => (
                      <span key={`${pericia.nome}-${index}`} className="inline-flex items-center gap-1.5 border border-border bg-muted/20 px-2.5 py-1 text-xs">
                        <span>{pericia.nome}</span>
                        <span className="font-semibold text-primary">{pericia.bonus}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          {(sujeito.descricao || sujeito.backstory) && (
            <Section title="Dossiê narrativo" icon={<NotebookText className="h-4 w-4" />}>
              <div className="grid gap-4 lg:grid-cols-2">
                {sujeito.descricao && <TextBlock label="Descrição / aparência" value={sujeito.descricao} />}
                {sujeito.backstory && <TextBlock label="Backstory" value={sujeito.backstory} />}
              </div>
            </Section>
          )}
        </div>

        <aside className="space-y-4">
          <div className="sticky top-6 space-y-4">
            <Section title="Resumo" icon={<Heart className="h-4 w-4" />}>
              <div className="space-y-3">
                <Info label="Defesa" value={sujeito.defesa ?? "—"} />
                <Info label="PV" value={sujeito.pv ?? "—"} />
                <Info label="Ações" value={sujeito.acoes.length} />
                <Info label="Habilidades" value={sujeito.habilidades.length} />
                <Info label="Rituais" value={sujeito.rituais.length} />
              </div>
            </Section>

            {(sujeito.resistencias.length > 0 || sujeito.vulnerabilidades.length > 0) && (
              <Section title="Defesas especiais" icon={<Shield className="h-4 w-4" />}>
                {sujeito.resistencias.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Resistências</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {sujeito.resistencias.map((resistencia, index) => (
                        <span key={`${resistencia.tipo}-${index}`} className="border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-500">
                          {resistencia.tipo} {resistencia.valor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {sujeito.vulnerabilidades.length > 0 && (
                  <div className={cn(sujeito.resistencias.length > 0 && "mt-4")}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Vulnerabilidades</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {sujeito.vulnerabilidades.map((vulnerabilidade, index) => (
                        <span key={`${vulnerabilidade}-${index}`} className="border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-500">
                          {vulnerabilidade}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

function Tag({ children, danger }: { children: ReactNode; danger?: boolean }) {
  return (
    <span className={cn("border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]", danger ? "border-red-500/35 bg-red-500/10 text-red-500" : "border-border bg-background text-muted-foreground")}>
      {children}
    </span>
  );
}

function Info({ label, value, danger }: { label: string; value: ReactNode; danger?: boolean }) {
  return (
    <div className="border border-border bg-background p-3">
      <p className={cn("text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground", danger && "text-amber-500")}>{label}</p>
      <p className="mt-1 text-sm font-semibold capitalize">{value}</p>
    </div>
  );
}

function Section({ title, description, icon, children }: { title: string; description?: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <section className="border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-primary">{icon}</span>}
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em]">{title}</h2>
        </div>
        {description && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function StatCard({ icon, label, value, detail, tone = "default" }: { icon: ReactNode; label: string; value: ReactNode; detail?: string; tone?: "default" | "red" | "purple" }) {
  return (
    <div className={cn("border bg-background p-4", tone === "red" && "border-red-500/30 bg-red-500/[0.03]", tone === "purple" && "border-purple-500/30 bg-purple-500/[0.04]", tone === "default" && "border-border")}>
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{icon}{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
    </div>
  );
}

function ActionCard({ acao }: { acao: { tipo: NpcAcaoTipo; nome: string; descricao: string; teste?: string; dano?: string; critico?: string; quantidade?: number } }) {
  return (
    <div className="border border-border bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{acao.nome}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-primary">{acaoTipoLabel[acao.tipo]}</p>
        </div>
        {acao.quantidade != null && acao.quantidade > 1 && (
          <span className="border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">x{acao.quantidade}</span>
        )}
      </div>
      {acao.descricao && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{acao.descricao}</p>}
      {(acao.teste || acao.dano || acao.critico) && (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {acao.teste && <MiniStat label="Teste" value={acao.teste} />}
          {acao.dano && <MiniStat label="Dano" value={acao.dano} />}
          {acao.critico && <MiniStat label="Crítico" value={acao.critico} />}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border border-border bg-muted/20 px-3 py-2">
      <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}

function AttrBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border bg-muted/20 p-3 text-center">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-[10px] text-muted-foreground">{value <= 0 ? "2d20 pior" : `${value}d20`}</p>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-background p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">{value}</p>
    </div>
  );
}

function getElementoBadge(elemento: string): string {
  const key = elemento.toLowerCase() as RitualElemento;
  return ELEMENTO_BADGE[key] ?? "border-primary/30 text-primary";
}

function RitualDescricao({ descricao }: { descricao: string }) {
  const parts = descricao.split(/(?=↑\s)/);
  const base = parts[0].trim();
  const upgrades = parts.slice(1).map((p) => {
    const m = p.match(/^↑\s*(.+?):\s*([\s\S]+)$/);
    return m ? { titulo: m[1].trim(), texto: m[2].trim() } : { titulo: "", texto: p.replace(/^↑\s*/, "").trim() };
  });

  return (
    <div className="mt-3 space-y-2">
      {base && <p className="text-sm leading-relaxed text-muted-foreground">{base}</p>}
      {upgrades.map((upgrade, index) => (
        <div key={`${upgrade.titulo}-${index}`} className="border-l-2 border-primary/40 pl-3 text-sm text-muted-foreground">
          {upgrade.titulo && <span className="mr-2 text-[11px] font-semibold uppercase tracking-wide text-primary">↑ {upgrade.titulo}</span>}
          <span>{upgrade.texto}</span>
        </div>
      ))}
    </div>
  );
}

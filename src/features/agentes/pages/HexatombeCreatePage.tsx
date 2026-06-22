"use client";

import { buildAgentPayload } from "@/features/agentes/utils/buildAgentPayload";
import { useCreateAgente } from "@/features/agentes/hooks/useAgentes";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { CLASS_RULES, ORIGENS, findOriginRule } from "@/shared/constants/agentRules";
import { ESTIGMAS, FORMA_SUPREMA, HEXATOMBE_RULE_CARDS, getEstigmas } from "@/shared/constants/hexatombe";
import { cn } from "@/shared/lib/utils";
import { calcularRecursos, calcularRecursosPD } from "@/shared/utils/agentCalc";
import { ArrowLeft, BookOpenCheck, Crown, HeartPulse, Loader2, Shield, Skull, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useMemo, useState } from "react";

const CLASSES = Object.keys(CLASS_RULES) as (keyof typeof CLASS_RULES)[];

export function HexatombeCreatePage() {
  const create = useCreateAgente();
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [codinome, setCodinome] = useState("");
  const [origem, setOrigem] = useState("");
  const [classe, setClasse] = useState<keyof typeof CLASS_RULES>("Combatente");
  const [usarPd, setUsarPd] = useState(false);
  const [estigmas, setEstigmas] = useState<string[]>([]);

  const origemRule = findOriginRule(origem);
  const classeRule = CLASS_RULES[classe];
  const nexInicial = classe === "Sobrevivente" ? 1 : 5;
  const recursos = calcularRecursos(classe, nexInicial, 1, 1);
  const recursosPD = calcularRecursosPD(classe, nexInicial, 1, 1);
  const estigmasAtivos = useMemo(() => getEstigmas(estigmas), [estigmas]);

  const toggleEstigma = (id: string) => {
    setEstigmas((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const handleCreate = async () => {
    try {
      const sheet = await create.mutateAsync(buildAgentPayload({
        tipo: "hexatombe",
        nome,
        origem,
        classe,
        usarPd,
        codinome,
        estigmas,
      }));
      router.push(`/agentes/${sheet.id}`);
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? JSON.stringify(err);
      alert(`Erro ao criar Hexatombe: ${msg}`);
    }
  };

  return (
    <main className="h-full overflow-y-auto">
      <div className="border-b border-red-500/20 bg-red-500/[0.03] px-6 py-6">
        <Link href="/agentes" className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Voltar para agentes
        </Link>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-500">
                Criação especial
              </span>
              <span className="border border-border bg-background px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Arquivos Secretos
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">Nova Ficha Hexatombe</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Hexatombe usa a base de agente, mas adiciona máscara, estigmas, poderes de sacrifício,
              estado Desertor e Intenção Assassina. Por isso a criação fica separada da ficha comum.
            </p>
          </div>

          <div className="grid grid-cols-3 border border-red-500/20 bg-background/70">
            <Summary label="PV" value={usarPd ? recursosPD?.pv_max : recursos?.pv_max} icon={<HeartPulse className="h-4 w-4" />} />
            <Summary label={usarPd ? "PD" : "PE"} value={usarPd ? recursosPD?.pd_max : recursos?.pe_max} icon={usarPd ? <Sparkles className="h-4 w-4" /> : <Zap className="h-4 w-4" />} />
            <Summary label="Estigmas" value={estigmas.length} icon={<Crown className="h-4 w-4" />} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="border border-border bg-card p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">1. Identidade</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Nome civil</Label>
                <Input value={nome} onChange={(event) => setNome(event.target.value)} placeholder="Ex: Otávio Ferraz" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Codinome / Máscara</Label>
                <Input value={codinome} onChange={(event) => setCodinome(event.target.value)} placeholder="Ex: Mutilador Noturno" />
              </div>
            </div>
          </section>

          <section className="border border-border bg-card p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">2. Base mecânica</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Origem antes da máscara</Label>
                <Select value={origem} onValueChange={setOrigem}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Escolha uma origem" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {ORIGENS.map((item) => (
                      <SelectItem key={item.key} value={item.label}>{item.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {origemRule ? `${origemRule.power}: poder de origem adicionado automaticamente.` : "A origem ainda adiciona perícias e poder, mesmo em Hexatombe."}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Classe</Label>
                <Select value={classe} onValueChange={(value) => setClasse(value as keyof typeof CLASS_RULES)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {CLASSES.map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs leading-relaxed text-muted-foreground">{classeRule.note}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setUsarPd((current) => !current)}
              className={cn(
                "mt-4 flex w-full items-start gap-3 border p-3 text-left transition-colors",
                usarPd ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
              )}
            >
              <Sparkles className={cn("mt-0.5 h-4 w-4", usarPd ? "text-primary" : "text-muted-foreground")} />
              <span>
                <span className="block text-sm font-semibold">Usar Pontos de Determinação</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  Para mesas usando Sobrevivendo ao Horror: substitui PE e Sanidade por PD.
                </span>
              </span>
              <span className={cn("ml-auto mt-0.5 h-4 w-4 shrink-0 border", usarPd ? "border-primary bg-primary" : "border-border")} />
            </button>
          </section>

          <section className="border border-red-500/20 bg-red-500/[0.03] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-500">3. Estigmas iniciais</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Cada estigma marcado adiciona automaticamente o poder de sacrifício correspondente à aba de habilidades.
              Dá para começar sem estigmas e conquistar durante a campanha.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {ESTIGMAS.map((estigma) => {
                const active = estigmas.includes(estigma.id);
                return (
                  <button
                    key={estigma.id}
                    type="button"
                    onClick={() => toggleEstigma(estigma.id)}
                    className={cn(
                      "border p-4 text-left transition-colors",
                      active
                        ? `${estigma.corBg} ${estigma.cor} border-current`
                        : "border-border bg-background text-muted-foreground hover:border-red-500/40 hover:text-foreground",
                    )}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{estigma.nome}</span>
                      {active && <BookOpenCheck className="h-4 w-4" />}
                    </span>
                    <span className="mt-1 block text-[10px] uppercase tracking-[0.14em] opacity-75">{estigma.palavras.join(" · ")}</span>
                    <span className="mt-3 block text-xs leading-relaxed text-muted-foreground">{estigma.poder}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="sticky top-6 space-y-4">
            <div className="border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <Skull className="h-4 w-4 text-red-500" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Resumo da ficha</p>
              </div>
              <h2 className="mt-3 text-xl font-semibold">{codinome || nome || "Máscara sem nome"}</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Tag>{classe}</Tag>
                <Tag>{origemRule?.label ?? "Sem origem"}</Tag>
                <Tag>{usarPd ? "PV + PD" : "PV + PE + SAN"}</Tag>
              </div>
              <div className="mt-4 space-y-2">
                {estigmasAtivos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum estigma inicial selecionado.</p>
                ) : (
                  estigmasAtivos.map((estigma) => (
                    <div key={estigma.id} className="border border-border bg-muted/20 p-3">
                      <p className={cn("text-sm font-semibold", estigma.cor)}>{estigma.nome}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{estigma.poder}</p>
                    </div>
                  ))
                )}
              </div>
              <Button className="mt-5 w-full" onClick={handleCreate} disabled={create.isPending}>
                {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Skull className="h-4 w-4" />}
                Criar Hexatombe
              </Button>
            </div>

            <div className="grid gap-3">
              <RuleCard title="Forma Suprema" icon={<Shield className="h-4 w-4" />}>
                Ativar custa {FORMA_SUPREMA.ativacao}, {FORMA_SUPREMA.custoSan} SAN e concede bônus grandes de PV, PE, Defesa, testes e dano.
              </RuleCard>
              {HEXATOMBE_RULE_CARDS.map((rule) => (
                <RuleCard key={rule.titulo} title={rule.titulo} icon={<BookOpenCheck className="h-4 w-4" />}>
                  {rule.texto}
                </RuleCard>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

function Summary({ icon, label, value }: { icon: ReactNode; label: string; value?: number }) {
  return (
    <div className="flex min-h-24 flex-col justify-end border-r border-border p-4 last:border-r-0">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{icon}{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value ?? 0}</p>
    </div>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </span>
  );
}

function RuleCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="border border-border bg-card p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        <span className="text-red-500">{icon}</span>
        {title}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

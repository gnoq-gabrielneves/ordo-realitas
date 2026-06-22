"use client";

import { buildAgentPayload } from "@/features/agentes/utils/buildAgentPayload";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { CLASS_RULES, ORIGENS, findOriginRule } from "@/shared/constants/agentRules";
import { cn } from "@/shared/lib/utils";
import { AgentSheetPayload } from "@/shared/types/agent";
import { calcularRecursos, calcularRecursosPD } from "@/shared/utils/agentCalc";
import { BookOpenCheck, Brain, HeartPulse, Loader2, Shield, Sparkles, UserRound, Zap } from "lucide-react";
import { ReactNode, useMemo, useState } from "react";

interface NovaFichaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (payload: Partial<AgentSheetPayload>) => Promise<void>;
  isPending?: boolean;
}

const CLASSES = Object.keys(CLASS_RULES) as (keyof typeof CLASS_RULES)[];

export function NovaFichaDialog({ open, onOpenChange, onCreate, isPending }: NovaFichaDialogProps) {
  const [nome, setNome] = useState("");
  const [origem, setOrigem] = useState("");
  const [classe, setClasse] = useState<keyof typeof CLASS_RULES>("Combatente");
  const [usarPd, setUsarPd] = useState(false);

  const origemRule = findOriginRule(origem);
  const classeRule = CLASS_RULES[classe];
  const nexInicial = classe === "Sobrevivente" ? 1 : 5;
  const recursos = calcularRecursos(classe, nexInicial, 1, 1);
  const recursosPD = calcularRecursosPD(classe, nexInicial, 1, 1);

  const resumo = useMemo(() => {
    const origemPericias = origemRule?.trainedSkills.length
      ? `${origemRule.trainedSkills.length} perícias da origem`
      : origemRule?.skillChoiceCount
        ? `${origemRule.skillChoiceCount} perícias à escolha`
        : "origem a definir";
    return [
      "Ficha padrão",
      classe,
      origemRule?.label ?? "sem origem",
      usarPd ? "PV + PD" : "PV + PE + SAN",
      origemPericias,
    ];
  }, [classe, origemRule, usarPd]);

  const reset = () => {
    setNome("");
    setOrigem("");
    setClasse("Combatente");
    setUsarPd(false);
  };

  const handleCreate = async () => {
    const payload = buildAgentPayload({ tipo: "padrao", nome, origem, classe, usarPd });

    await onCreate(payload);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { onOpenChange(nextOpen); if (!nextOpen) reset(); }}>
      <DialogContent className="w-[min(96vw,1120px)] max-w-none sm:max-w-[1120px] p-0">
        <div className="grid max-h-[86vh] overflow-hidden lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Nova Ficha da Ordem</DialogTitle>
              <DialogDescription>
                Um assistente rápido para começar certo: recursos, perícias fixas, proficiências e poder de origem já entram preenchidos.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-6">
              <section className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">1. Identidade</p>
                <div className="grid gap-3 xl:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs">Nome do personagem</Label>
                    <Input value={nome} onChange={(event) => setNome(event.target.value)} placeholder="Ex: Gabriel Neves" />
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">2. Origem e classe</p>
                <div className="grid gap-3 xl:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Origem</Label>
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
                  </div>
                </div>

                <div className="grid gap-3 xl:grid-cols-2">
                  <RulePreview
                    icon={<UserRound className="h-4 w-4" />}
                    title={origemRule?.label ?? "Origem ainda não escolhida"}
                    description={
                      origemRule
                        ? `${origemRule.power}. ${origemRule.trainedSkills.length ? `Treina ${origemRule.trainedSkills.length} perícias fixas.` : origemRule.note ?? "A origem define perícias e um poder narrativo."}`
                        : "A origem representa de onde o personagem veio e já adiciona perícias e poder inicial."
                    }
                  />
                  <RulePreview
                    icon={<Shield className="h-4 w-4" />}
                    title={classeRule.label}
                    description={classeRule.note}
                  />
                </div>
              </section>

              <section className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">3. Modelo de recursos</p>
                <button
                  type="button"
                  onClick={() => setUsarPd((current) => !current)}
                  className={cn(
                    "flex w-full items-start gap-3 border p-3 text-left transition-colors",
                    usarPd ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                  )}
                >
                  <Sparkles className={cn("mt-0.5 h-4 w-4", usarPd ? "text-primary" : "text-muted-foreground")} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">Usar Pontos de Determinação</span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                      Regra de Sobrevivendo ao Horror: a ficha usa PD no lugar de PE e Sanidade.
                    </span>
                  </span>
                  <span className={cn("ml-auto mt-0.5 h-4 w-4 shrink-0 border", usarPd ? "border-primary bg-primary" : "border-border")} />
                </button>

                <div className="grid gap-3 md:grid-cols-3">
                  <ResourcePreview icon={<HeartPulse className="h-4 w-4" />} label="PV" value={usarPd ? recursosPD?.pv_max : recursos?.pv_max} />
                  <ResourcePreview icon={usarPd ? <Sparkles className="h-4 w-4" /> : <Zap className="h-4 w-4" />} label={usarPd ? "PD" : "PE"} value={usarPd ? recursosPD?.pd_max : recursos?.pe_max} />
                  <ResourcePreview icon={<Brain className="h-4 w-4" />} label="SAN" value={usarPd ? 0 : recursos?.san_max} muted={usarPd} />
                </div>
              </section>
            </div>
          </div>

          <aside className="border-t border-border bg-muted/20 p-5 lg:border-l lg:border-t-0">
            <div className="sticky top-0 space-y-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Resumo</p>
                <h3 className="mt-2 text-lg font-semibold">{nome.trim() || "Agente sem nome"}</h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {resumo.map((item) => (
                    <span key={item} className="border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border border-border bg-background p-3">
                <div className="flex items-center gap-2">
                  <BookOpenCheck className="h-4 w-4 text-primary" />
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Aplicado ao criar</p>
                </div>
                <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                  <li>Recursos máximos calculados com atributos 1.</li>
                  <li>Proficiências fixas da classe.</li>
                  <li>Perícias fixas da origem e da classe.</li>
                  <li>Poder de origem em habilidades com descrição inicial.</li>
                  <li>Inventário, rituais e poderes extras ficam para refinar depois.</li>
                </ul>
              </div>

              {classeRule && (
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">{classeRule.label}</p>
                  <p>{usarPd ? classeRule.pdResourceLabel : classeRule.resourceLabel}</p>
                  <p>{classeRule.note}</p>
                </div>
              )}
            </div>
          </aside>
        </div>

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Criar ficha
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RulePreview({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 border border-border bg-muted/20 p-3">
      <span className="mt-0.5 text-primary">{icon}</span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{description}</span>
      </span>
    </div>
  );
}

function ResourcePreview({ icon, label, value, muted }: { icon: ReactNode; label: string; value?: number; muted?: boolean }) {
  return (
    <div className={cn("border border-border bg-card p-3", muted && "opacity-50")}>
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{icon}{label}</p>
      <p className="mt-2 text-xl font-semibold tabular-nums">{value ?? 0}</p>
    </div>
  );
}

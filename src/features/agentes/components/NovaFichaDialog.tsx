"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { ESTIGMAS, estigmaHabilidade, getEstigmas } from "@/shared/constants/hexatombe";
import { emptyFormaSuprema } from "@/features/agentes/services/agentes";
import { AgentSheetPayload, TipoFicha } from "@/shared/types/agent";
import { cn } from "@/shared/lib/utils";
import { Loader2, Shield, Skull } from "lucide-react";
import { useState } from "react";

interface NovaFichaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (payload: Partial<AgentSheetPayload>) => Promise<void>;
  isPending?: boolean;
}

export function NovaFichaDialog({ open, onOpenChange, onCreate, isPending }: NovaFichaDialogProps) {
  const [tipo, setTipo] = useState<TipoFicha>("padrao");
  const [codinome, setCodinome] = useState("");
  const [estigmas, setEstigmas] = useState<string[]>([]);

  const reset = () => { setTipo("padrao"); setCodinome(""); setEstigmas([]); };

  const toggleEstigma = (id: string) =>
    setEstigmas((cur) => cur.includes(id) ? cur.filter((e) => e !== id) : [...cur, id]);

  const handleCreate = async () => {
    const payload: Partial<AgentSheetPayload> =
      tipo === "hexatombe"
        ? {
            tipo: "hexatombe",
            codinome: codinome.trim() || null,
            estigmas,
            habilidades: getEstigmas(estigmas).map(estigmaHabilidade),
            forma_suprema: emptyFormaSuprema(),
          }
        : { tipo: "padrao" };
    await onCreate(payload);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Ficha</DialogTitle>
          <DialogDescription>
            Escolha o tipo de ficha. O tipo é definido na criação e não muda depois.
          </DialogDescription>
        </DialogHeader>

        {/* Seleção de tipo */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTipo("padrao")}
            className={cn(
              "flex flex-col items-start gap-1.5 rounded-md border p-4 text-left transition-colors",
              tipo === "padrao"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40"
            )}
          >
            <Shield className={cn("h-5 w-5", tipo === "padrao" ? "text-primary" : "text-muted-foreground")} />
            <span className="text-sm font-medium">Padrão</span>
            <span className="text-[11px] text-muted-foreground leading-snug">
              Ficha clássica de agente da Ordo Realitas.
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTipo("hexatombe")}
            className={cn(
              "flex flex-col items-start gap-1.5 rounded-md border p-4 text-left transition-colors",
              tipo === "hexatombe"
                ? "border-red-500/60 bg-red-500/5"
                : "border-border hover:border-red-500/40"
            )}
          >
            <Skull className={cn("h-5 w-5", tipo === "hexatombe" ? "text-red-400" : "text-muted-foreground")} />
            <span className="text-sm font-medium">Hexatombe</span>
            <span className="text-[11px] text-muted-foreground leading-snug">
              Assassino mascarado com Intenção Assassina e estigma da Coroa.
            </span>
          </button>
        </div>

        {/* Campos Hexatombe */}
        {tipo === "hexatombe" && (
          <div className="space-y-4 rounded-md border border-red-500/20 bg-red-500/[0.03] p-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Codinome / Máscara</label>
              <Input
                value={codinome}
                onChange={(e) => setCodinome(e.target.value)}
                placeholder="Ex: Mutilador Noturno"
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Estigmas da Coroa de Espinhos
                <span className="text-muted-foreground/60 font-normal"> · vários, adquiridos na campanha</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ESTIGMAS.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => toggleEstigma(e.id)}
                    title={e.clamor}
                    className={cn(
                      "rounded border px-2 py-1.5 text-xs font-medium transition-colors",
                      estigmas.includes(e.id)
                        ? `${e.corBg} ${e.cor} border-current`
                        : "border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    {e.nome}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
            Criar Ficha
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

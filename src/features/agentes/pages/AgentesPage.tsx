"use client";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { Button } from "@/shared/components/ui/button";
import { NovaFichaDialog } from "@/features/agentes/components/NovaFichaDialog";
import { useAgentes, useCreateAgente, useDeleteAgente } from "@/features/agentes/hooks/useAgentes";
import { getEstigmas } from "@/shared/constants/hexatombe";
import { AgentSheet, AgentSheetPayload } from "@/shared/types/agent";
import { cn } from "@/shared/lib/utils";
import { Loader2, Pencil, Plus, Shield, Skull, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function AgentCard({ agent }: { agent: AgentSheet }) {
  const del = useDeleteAgente();
  const isHexa = agent.tipo === "hexatombe";
  const estigmas = getEstigmas(agent.estigmas);

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-sm border px-4 py-3 transition-colors",
      isHexa
        ? "border-red-500/30 bg-red-500/[0.03] hover:bg-red-500/[0.06]"
        : "border-border bg-card hover:bg-muted/30"
    )}>
      <Link href={`/agentes/${agent.id}`} className="flex items-center gap-4 flex-1 min-w-0">
        <div className={cn(
          "h-10 w-10 shrink-0 rounded-md border bg-muted overflow-hidden flex items-center justify-center",
          isHexa ? "border-red-500/40" : "border-border"
        )}>
          {agent.image_url ? (
            <img src={agent.image_url} alt={agent.nome ?? ""} className="h-full w-full object-cover" />
          ) : isHexa ? (
            <Skull className="h-5 w-5 text-red-400/50" />
          ) : (
            <UserRound className="h-5 w-5 text-muted-foreground/40" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">
              {agent.nome || <span className="text-muted-foreground italic">Sem nome</span>}
            </p>
            {isHexa && (
              <span className="flex items-center gap-1 text-[10px] text-red-400 shrink-0">
                <Skull className="h-3 w-3" /> Hexatombe
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {estigmas.length > 0 && (
              <span className="text-xs text-muted-foreground">
                Estigma{estigmas.length > 1 ? "s" : ""}:{" "}
                {estigmas.map((e, i) => (
                  <span key={e.id} className={e.cor}>{e.nome}{i < estigmas.length - 1 ? ", " : ""}</span>
                ))}
              </span>
            )}
            {agent.classe && <span className="text-xs text-muted-foreground">{agent.classe}</span>}
            {agent.origem && <span className="text-xs text-muted-foreground">· {agent.origem}</span>}
            {agent.nex && <span className="text-xs text-muted-foreground">· NEX {agent.nex}%</span>}
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-3 shrink-0">
        {agent.profile_id ? (
          <div className="flex items-center gap-1 text-[10px] text-green-400">
            <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Vinculado
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
            Sem jogador
          </div>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
          <Link href={`/agentes/${agent.id}/editar`}>
            <Pencil className="h-3.5 w-3.5" />
          </Link>
        </Button>
        <ConfirmDialog
          title="Excluir ficha"
          description={`Tem certeza que deseja excluir a ficha de "${agent.nome || "este agente"}"? Esta ação não pode ser desfeita.`}
          onConfirm={() => del.mutate(agent.id)}
          disabled={del.isPending}
        >
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </Button>
        </ConfirmDialog>
      </div>
    </div>
  );
}

export function AgentesPage() {
  const { data: agentes = [], isLoading } = useAgentes();
  const create = useCreateAgente();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreate = async (payload: Partial<AgentSheetPayload>) => {
    try {
      const sheet = await create.mutateAsync(payload);
      setDialogOpen(false);
      router.push(`/agentes/${sheet.id}`);
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? JSON.stringify(err);
      console.error("Erro ao criar ficha:", err);
      alert(`Erro ao criar ficha: ${msg}`);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
        <h1 className="text-sm font-semibold tracking-wide">Fichas de Agentes</h1>
        <Button size="sm" onClick={() => setDialogOpen(true)} disabled={create.isPending}>
          {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1.5" />}
          Nova Ficha
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : agentes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Shield className="h-8 w-8 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma ficha criada ainda.</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setDialogOpen(true)} disabled={create.isPending}>
              Criar primeira ficha
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-3">{agentes.length} ficha{agentes.length !== 1 ? "s" : ""}</p>
            {agentes.map((a) => <AgentCard key={a.id} agent={a} />)}
          </div>
        )}
      </div>

      <NovaFichaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreate={handleCreate}
        isPending={create.isPending}
      />
    </div>
  );
}

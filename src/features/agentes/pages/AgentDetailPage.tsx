"use client";

import { CombateTab } from "@/features/agentes/components/tabs/CombateTab";
import { DescricaoTab } from "@/features/agentes/components/tabs/DescricaoTab";
import { GeralTab } from "@/features/agentes/components/tabs/GeralTab";
import { HabilidadesTab } from "@/features/agentes/components/tabs/HabilidadesTab";
import { HexatombeTab } from "@/features/agentes/components/tabs/HexatombeTab";
import { InventarioTab } from "@/features/agentes/components/tabs/InventarioTab";
import { PericiasTab } from "@/features/agentes/components/tabs/PericiasTab";
import { RituaisTab } from "@/features/agentes/components/tabs/RituaisTab";
import { useAgente, useUpdateAgente } from "@/features/agentes/hooks/useAgentes";
import { emptyFormaSuprema } from "@/features/agentes/services/agentes";
import { deriveFormaSuprema } from "@/shared/utils/agentCalc";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog/ConfirmDialog";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { getEstigmas } from "@/shared/constants/hexatombe";
import { AgentFormaSuprema, AgentSheet } from "@/shared/types/agent";
import { cn } from "@/shared/lib/utils";
import { ChevronLeft, Save, Skull } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

const TABS = [
  { id: "geral",        label: "Geral" },
  { id: "pericias",     label: "Perícias" },
  { id: "combate",      label: "Combate" },
  { id: "habilidades",  label: "Habilidades" },
  { id: "rituais",      label: "Rituais" },
  { id: "inventario",   label: "Inventário" },
  { id: "descricao",    label: "Descrição" },
] as const;

// Campos de combate que pertencem ao bloco da Forma Suprema (roteados ao despertar).
const FORMA_KEYS: (keyof AgentFormaSuprema)[] = [
  "pv_max", "pv_atual", "pe_max", "pe_atual", "san_max", "san_atual",
  "usa_pd", "pd_max", "pd_atual", "defesa_bonus", "defesa_equip",
  "deslocamento", "pericias", "ataques", "habilidades", "rituais",
];
const FORMA_KEY_SET = new Set<keyof AgentSheet>(FORMA_KEYS);

interface AgentDetailPageProps {
  agenteId: string;
  backHref?: string;
}

export function AgentDetailPage({ agenteId, backHref = "/agentes" }: AgentDetailPageProps) {
  const { data: agente, isLoading } = useAgente(agenteId);
  const update = useUpdateAgente();
  const [localPatch, setLocalPatch] = useState<Partial<AgentSheet> | null>(null);
  const [dirty, setDirty] = useState(false);
  const [formaMode, setFormaMode] = useState<"base" | "suprema">("base");
  const local = agente ? { ...agente, ...localPatch } : null;

  const onChange = useCallback((patch: Partial<AgentSheet>) => {
    setLocalPatch((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  }, []);

  const save = async () => {
    if (!local) return;
    await update.mutateAsync({ id: local.id, payload: local });
    setLocalPatch(null);
    setDirty(false);
  };

  if (isLoading || !local) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando ficha...</p>
      </div>
    );
  }

  const isHexa = local.tipo === "hexatombe";
  const editingSuprema = isHexa && formaMode === "suprema";
  const fs = local.forma_suprema ?? emptyFormaSuprema();
  const estigmas = getEstigmas(local.estigmas);

  // No modo Forma Suprema, os campos de combate vêm do bloco desperto;
  // atributos/classe/proficiências continuam compartilhados com a base.
  const tabData: AgentSheet = editingSuprema ? { ...local, ...fs } : local;

  const tabOnChange = (patch: Partial<AgentSheet>) => {
    if (!editingSuprema) return onChange(patch);
    const fsPatch: Partial<AgentFormaSuprema> = {};
    const basePatch: Partial<AgentSheet> = {};
    (Object.keys(patch) as (keyof AgentSheet)[]).forEach((k) => {
      if (FORMA_KEY_SET.has(k)) {
        Object.assign(fsPatch, { [k]: patch[k] });
      } else {
        Object.assign(basePatch, { [k]: patch[k] });
      }
    });
    const next: Partial<AgentSheet> = { ...basePatch };
    if (Object.keys(fsPatch).length) next.forma_suprema = { ...fs, ...fsPatch };
    onChange(next);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className={cn(
        "flex h-14 shrink-0 items-center gap-3 border-b px-6",
        editingSuprema ? "border-red-500/40 bg-red-500/[0.04]" : "border-border"
      )}>
        <Link
          href={backHref}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Agentes
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <h1 className="text-sm font-semibold flex-1 truncate flex items-center gap-2">
          {isHexa && <Skull className="h-3.5 w-3.5 text-red-400 shrink-0" />}
          {editingSuprema && local.codinome ? local.codinome : local.nome || "Sem nome"}
          {estigmas.map((e) => (
            <span key={e.id} className={cn("text-[10px] font-normal px-1.5 py-0.5 rounded border", e.cor, e.corBorda)}>
              {e.nome}
            </span>
          ))}
        </h1>

        {/* Toggle Base / Forma Suprema */}
        {isHexa && (
          <div className="flex items-center rounded-md border border-border overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setFormaMode("base")}
              className={cn("px-2.5 py-1 transition-colors", formaMode === "base" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              Base
            </button>
            <button
              type="button"
              onClick={() => setFormaMode("suprema")}
              className={cn("px-2.5 py-1 transition-colors flex items-center gap-1", formaMode === "suprema" ? "bg-red-500 text-white" : "text-muted-foreground hover:text-foreground")}
            >
              <Skull className="h-3 w-3" /> Suprema
            </button>
          </div>
        )}

        {dirty && (
          <span className="text-xs text-muted-foreground">Alterações não salvas</span>
        )}
        <Button size="sm" onClick={save} disabled={!dirty || update.isPending}>
          <Save className="h-3.5 w-3.5 mr-1.5" />
          {update.isPending ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      {editingSuprema && (
        <div className="shrink-0 bg-red-500/[0.06] border-b border-red-500/20 px-6 py-2 flex items-center gap-3 flex-wrap">
          <p className="text-[11px] text-red-400/90 flex-1 min-w-0">
            Editando a <strong>Forma Suprema</strong> (desperta). Atributos, classe e proficiências continuam compartilhados com a base.
          </p>
          <ConfirmDialog
            title="Calcular Forma Suprema"
            description="Deriva a forma desperta a partir da base, aplicando os bônus de Despertar (+20 PV, +10 PE, +10 Defesa, +5 em testes, +2 dados de dano). Isso sobrescreve os valores atuais da forma suprema."
            confirmLabel="Calcular"
            destructive={false}
            icon={<Skull className="h-4 w-4 text-primary" />}
            onConfirm={() => onChange({ forma_suprema: deriveFormaSuprema(local) })}
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-400 shrink-0"
            >
              <Skull className="h-3.5 w-3.5 mr-1.5" />
              Calcular a partir da base
            </Button>
          </ConfirmDialog>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="geral" className="flex flex-col flex-1 overflow-hidden">
        <div className="shrink-0 border-b border-border px-6">
          <TabsList className="h-10 bg-transparent p-0 gap-0">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-10 px-4 text-sm"
              >
                {t.label}
              </TabsTrigger>
            ))}
            {isHexa && (
              <TabsTrigger
                value="hexatombe"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none h-10 px-4 text-sm flex items-center gap-1.5 text-red-400/80 data-[state=active]:text-red-400"
              >
                <Skull className="h-3.5 w-3.5" /> Hexatombe
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            <TabsContent value="geral" className="mt-0">
              <GeralTab data={tabData} onChange={tabOnChange} formaSuprema={editingSuprema} />
            </TabsContent>
            <TabsContent value="pericias" className="mt-0">
              <PericiasTab data={tabData} onChange={tabOnChange} />
            </TabsContent>
            <TabsContent value="combate" className="mt-0">
              <CombateTab data={tabData} onChange={tabOnChange} />
            </TabsContent>
            <TabsContent value="habilidades" className="mt-0">
              <HabilidadesTab data={tabData} onChange={tabOnChange} />
            </TabsContent>
            <TabsContent value="rituais" className="mt-0">
              <RituaisTab data={tabData} onChange={tabOnChange} />
            </TabsContent>
            {/* Inventário e Descrição são sempre da base (identidade compartilhada) */}
            <TabsContent value="inventario" className="mt-0">
              <InventarioTab data={local} onChange={onChange} />
            </TabsContent>
            <TabsContent value="descricao" className="mt-0">
              <DescricaoTab data={local} onChange={onChange} />
            </TabsContent>
            {isHexa && (
              <TabsContent value="hexatombe" className="mt-0">
                <HexatombeTab data={local} onChange={onChange} />
              </TabsContent>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
}

"use client";

import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { AgentSheet } from "@/shared/types/agent";

interface DescricaoTabProps {
  data: AgentSheet;
  onChange: (patch: Partial<AgentSheet>) => void;
}

const FIELDS: { key: keyof AgentSheet; label: string; placeholder: string }[] = [
  { key: "aparencia",     label: "Aparência",     placeholder: "Descreva a aparência física do agente..." },
  { key: "personalidade", label: "Personalidade", placeholder: "Descreva a personalidade, trejeitos, manias..." },
  { key: "historico",     label: "Histórico",     placeholder: "Conte a história e o passado do agente..." },
  { key: "objetivo",      label: "Objetivo",      placeholder: "Qual é a motivação principal do agente?" },
];

export function DescricaoTab({ data, onChange }: DescricaoTabProps) {
  return (
    <div className="space-y-5">
      {FIELDS.map(({ key, label, placeholder }) => (
        <div key={key} className="space-y-1.5">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">{label}</Label>
          <Textarea
            value={(data[key] as string) ?? ""}
            onChange={(e) => onChange({ [key]: e.target.value || null })}
            placeholder={placeholder}
            rows={5}
            className="resize-none text-sm"
          />
        </div>
      ))}
    </div>
  );
}

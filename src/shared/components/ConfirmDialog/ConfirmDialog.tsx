"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { cn } from "@/shared/lib/utils";
import { Trash2 } from "lucide-react";

interface ConfirmDialogProps {
  title?: string;
  description?: string;
  onConfirm: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  /** Ícone do cabeçalho. Padrão: lixeira. */
  icon?: React.ReactNode;
  /** Rótulo do botão de confirmação. Padrão: "Confirmar exclusão". */
  confirmLabel?: string;
  /** Estilo destrutivo (vermelho). Padrão: true. */
  destructive?: boolean;
}

export function ConfirmDialog({
  title = "Confirmar exclusão",
  description = "Esta ação não pode ser desfeita.",
  onConfirm,
  disabled,
  children,
  icon,
  confirmLabel,
  destructive = true,
}: ConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild disabled={disabled}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <div className={cn(
            "flex h-10 w-10 items-center justify-center border mb-3",
            destructive ? "border-destructive/30 bg-destructive/10" : "border-primary/30 bg-primary/10"
          )}>
            {icon ?? <Trash2 className={cn("h-4 w-4", destructive ? "text-destructive" : "text-primary")} />}
          </div>
          <AlertDialogTitle className="text-base font-semibold">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-1 h-px bg-border" />
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="text-xs">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(
              "text-xs",
              destructive
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {confirmLabel ?? "Confirmar exclusão"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

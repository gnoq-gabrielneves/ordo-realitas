"use client";

import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useAgentes } from "@/features/agentes/hooks/useAgentes";
import { createClient } from "@/shared/lib/supabase/client";
import { ROLE_LABELS, Role } from "@/shared/constants/roles";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, UserCog, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Perfil {
  id: string;
  name: string | null;
  role: Role;
}

const ROLES: Role[] = ["mestre", "jogador", "tv"];

export function UsuariosPage() {
  const qc = useQueryClient();
  const supabase = createClient();
  const { data: agentes = [] } = useAgentes();

  const { data: perfis = [], isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: async (): Promise<Perfil[]> => {
      const { data, error } = await supabase.from("profiles").select("id, name, role").order("name");
      if (error) throw error;
      return (data ?? []).map((p) => ({ ...p, role: (p.role ?? "jogador") as Role }));
    },
  });

  const setRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: Role }) => {
      const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["profiles"] }); toast.success("Papel atualizado"); },
    onError: (e: { message?: string }) => toast.error(e?.message ?? "Erro ao atualizar papel"),
  });

  const vincularFicha = useMutation({
    mutationFn: async ({ profileId, agenteId }: { profileId: string; agenteId: string | null }) => {
      // Limpa vínculo anterior desse jogador e aplica o novo.
      await supabase.from("agent_sheets").update({ profile_id: null }).eq("profile_id", profileId);
      if (agenteId) {
        const { error } = await supabase.from("agent_sheets").update({ profile_id: profileId }).eq("id", agenteId);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agent_sheets"] }); toast.success("Ficha vinculada"); },
    onError: (e: { message?: string }) => toast.error(e?.message ?? "Erro ao vincular ficha"),
  });

  const [novoOpen, setNovoOpen] = useState(false);

  return (
    <>
      <AppHeader title="Usuários" />
      <main className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium">Gestão de Usuários</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Defina papéis e vincule fichas aos jogadores.</p>
          </div>
          <Button size="sm" onClick={() => setNovoOpen(true)}>
            <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Criar usuário
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : (
          <div className="space-y-2">
            {perfis.map((p) => {
              const fichaVinculada = agentes.find((a) => a.profile_id === p.id);
              return (
                <div key={p.id} className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 flex-wrap">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <UserCog className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{p.name || "Sem nome"}</p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">{p.id}</p>
                  </div>

                  {/* Papel */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Papel</span>
                    <Select value={p.role} onValueChange={(v) => setRole.mutate({ id: p.id, role: v as Role })}>
                      <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent position="popper">
                        {ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Ficha (só pra jogador) */}
                  {p.role === "jogador" && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Ficha</span>
                      <Select
                        value={fichaVinculada?.id ?? "__none__"}
                        onValueChange={(v) => vincularFicha.mutate({ profileId: p.id, agenteId: v === "__none__" ? null : v })}
                      >
                        <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                        <SelectContent position="popper" className="max-h-72">
                          <SelectItem value="__none__" className="text-muted-foreground">— Nenhuma —</SelectItem>
                          {agentes.map((a) => (
                            <SelectItem key={a.id} value={a.id}>{a.nome || "Sem nome"}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              );
            })}
            {perfis.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">Nenhum usuário ainda.</p>}
          </div>
        )}
      </main>

      <NovoUsuarioDialog open={novoOpen} onOpenChange={setNovoOpen} onCreated={() => qc.invalidateQueries({ queryKey: ["profiles"] })} />
    </>
  );
}

function NovoUsuarioDialog({ open, onOpenChange, onCreated }: {
  open: boolean; onOpenChange: (o: boolean) => void; onCreated: () => void;
}) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState<Role>("jogador");
  const [loading, setLoading] = useState(false);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nome, email, password: senha, role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Falha ao criar usuário");
      toast.success("Usuário criado");
      setNome(""); setEmail(""); setSenha(""); setRole("jogador");
      onCreated();
      onOpenChange(false);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Criar usuário</DialogTitle></DialogHeader>
        <form onSubmit={criar} className="space-y-3">
          <div className="space-y-1.5"><Label className="text-xs">Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do jogador" /></div>
          <div className="space-y-1.5"><Label className="text-xs">E-mail</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="space-y-1.5"><Label className="text-xs">Senha</Label>
            <Input type="text" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} placeholder="mín. 6 caracteres" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Papel</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent position="popper">
                {ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading || !email || senha.length < 6}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />} Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

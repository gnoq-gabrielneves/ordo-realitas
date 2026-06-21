"use client";

import { AppHeader } from "@/shared/components/AppHeader/AppHeader";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useAgentes } from "@/features/agentes/hooks/useAgentes";
import { createClient } from "@/shared/lib/supabase/client";
import { ROLE_DESCRIPTIONS, ROLE_LABELS, ROLES, Role } from "@/shared/constants/roles";
import { useProfile } from "@/shared/hooks/useProfile";
import { cn } from "@/shared/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, KeyRound, Loader2, Monitor, Search, Shield, UserCog, UserPlus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface Perfil {
  id: string;
  name: string | null;
  role: Role;
}

const ROLE_ICONS: Record<Role, React.ComponentType<{ className?: string }>> = {
  mestre: Shield,
  jogador: Users,
  tv: Monitor,
};

export function UsuariosPage() {
  const qc = useQueryClient();
  const supabase = createClient();
  const profile = useProfile();
  const { data: agentes = [] } = useAgentes();
  const [novoOpen, setNovoOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "todos">("todos");

  const { data: perfis = [], isLoading, isError } = useQuery({
    queryKey: ["profiles"],
    queryFn: async (): Promise<Perfil[]> => {
      const { data, error } = await supabase.from("profiles").select("id, name, role").order("name");
      if (error) throw error;
      return (data ?? []).map((p) => ({ ...p, role: (p.role ?? "jogador") as Role }));
    },
  });

  const setRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: Role }) => {
      if (id === profile?.id) throw new Error("Voce nao pode alterar o proprio papel por aqui.");
      const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["profiles"] }); toast.success("Papel atualizado"); },
    onError: (e: { message?: string }) => toast.error(e?.message ?? "Erro ao atualizar papel"),
  });

  const vincularFicha = useMutation({
    mutationFn: async ({ profileId, agenteId }: { profileId: string; agenteId: string | null }) => {
      // Limpa vínculo anterior desse jogador e aplica o novo.
      const { error: clearError } = await supabase.from("agent_sheets").update({ profile_id: null }).eq("profile_id", profileId);
      if (clearError) throw clearError;
      if (agenteId) {
        const { error } = await supabase.from("agent_sheets").update({ profile_id: profileId }).eq("id", agenteId);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agent_sheets"] }); toast.success("Ficha vinculada"); },
    onError: (e: { message?: string }) => toast.error(e?.message ?? "Erro ao vincular ficha"),
  });

  const stats = useMemo(() => {
    const jogadores = perfis.filter((p) => p.role === "jogador");
    const jogadoresComFicha = jogadores.filter((p) => agentes.some((a) => a.profile_id === p.id));
    return {
      total: perfis.length,
      mestres: perfis.filter((p) => p.role === "mestre").length,
      jogadores: jogadores.length,
      jogadoresSemFicha: jogadores.length - jogadoresComFicha.length,
      telas: perfis.filter((p) => p.role === "tv").length,
    };
  }, [agentes, perfis]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return perfis.filter((p) => {
      const matchesRole = roleFilter === "todos" || p.role === roleFilter;
      const matchesSearch = !term || (p.name ?? "").toLowerCase().includes(term) || p.id.toLowerCase().includes(term);
      return matchesRole && matchesSearch;
    });
  }, [perfis, roleFilter, search]);

  return (
    <>
      <AppHeader title="Usuários" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary/70">Controle de acesso</p>
            <h2 className="mt-1 text-lg font-semibold">Usuários e credenciais</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Defina quem narra, quem joga e quais telas podem exibir documentos para a mesa.
            </p>
          </div>
          <Button className="shrink-0" size="sm" onClick={() => setNovoOpen(true)}>
            <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Criar usuário
          </Button>
        </div>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard label="Total" value={stats.total} icon={UserCog} />
          <StatCard label="Mestres" value={stats.mestres} icon={Shield} />
          <StatCard label="Jogadores" value={stats.jogadores} icon={Users} />
          <StatCard label="Sem ficha" value={stats.jogadoresSemFicha} icon={KeyRound} tone={stats.jogadoresSemFicha > 0 ? "warn" : "default"} />
          <StatCard label="Telas" value={stats.telas} icon={Monitor} />
        </section>

        <section className="grid gap-3 lg:grid-cols-3">
          {ROLES.map((role) => {
            const Icon = ROLE_ICONS[role];
            return (
              <div key={role} className="border border-border bg-card p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">{ROLE_LABELS[role]}</p>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
              </div>
            );
          })}
        </section>

        <div className="flex flex-col gap-2 border border-border bg-card p-3 md:flex-row md:items-center md:justify-between">
          <div className="relative md:w-80">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou ID..."
              className="h-9 pl-8 text-sm"
            />
          </div>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as Role | "todos")}>
            <SelectTrigger className="h-9 md:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="todos">Todos os papéis</SelectItem>
              {ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isError && (
          <div className="border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">Erro ao carregar usuários.</p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse border border-border bg-muted/40" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => {
              const fichaVinculada = agentes.find((a) => a.profile_id === p.id);
              const isCurrentUser = p.id === profile?.id;
              const RoleIcon = ROLE_ICONS[p.role];
              return (
                <div key={p.id} className="grid gap-3 border border-border bg-card px-4 py-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-muted text-muted-foreground">
                      <RoleIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{p.name || "Sem nome"}</p>
                        {isCurrentUser && <Badge variant="secondary" className="rounded-sm text-[10px]">Você</Badge>}
                        {p.role === "jogador" && fichaVinculada && (
                          <Badge variant="outline" className="rounded-sm text-[10px]">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Ficha
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">{p.id}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[p.role]}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-14 text-[10px] uppercase tracking-wider text-muted-foreground lg:w-auto">Papel</span>
                    <Select
                      value={p.role}
                      disabled={isCurrentUser || setRole.isPending}
                      onValueChange={(v) => setRole.mutate({ id: p.id, role: v as Role })}
                    >
                      <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent position="popper">
                        {ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Ficha (só pra jogador) */}
                  {p.role === "jogador" && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-14 text-[10px] uppercase tracking-wider text-muted-foreground lg:w-auto">Ficha</span>
                      <Select
                        value={fichaVinculada?.id ?? "__none__"}
                        disabled={vincularFicha.isPending}
                        onValueChange={(v) => vincularFicha.mutate({ profileId: p.id, agenteId: v === "__none__" ? null : v })}
                      >
                        <SelectTrigger className={cn("h-8 w-56 text-xs", !fichaVinculada && "border-primary/40")}>
                          <SelectValue placeholder="Nenhuma" />
                        </SelectTrigger>
                        <SelectContent position="popper" className="max-h-72">
                          <SelectItem value="__none__" className="text-muted-foreground">Nenhuma ficha</SelectItem>
                          {agentes.map((a) => (
                            <SelectItem key={a.id} value={a.id}>{a.nome || "Sem nome"}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {p.role !== "jogador" && (
                    <div className="hidden text-xs text-muted-foreground lg:block">
                      {p.role === "tv" ? "Tela de exibicao" : "Acesso administrativo"}
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="border border-dashed border-border py-12 text-center">
                <p className="text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <NovoUsuarioDialog open={novoOpen} onOpenChange={setNovoOpen} onCreated={() => qc.invalidateQueries({ queryKey: ["profiles"] })} />
    </>
  );
}

function StatCard({ label, value, icon: Icon, tone = "default" }: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "warn";
}) {
  return (
    <div className={cn(
      "border bg-card p-4",
      tone === "warn" ? "border-primary/40" : "border-border"
    )}>
      <div className="mb-3 flex items-center justify-between">
        <Icon className={cn("h-4 w-4", tone === "warn" ? "text-primary" : "text-muted-foreground")} />
        {tone === "warn" && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
      </div>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
    </div>
  );
}

function gerarSenhaTemporaria() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const chars = Array.from({ length: 12 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]);
  return chars.join("");
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
        <DialogHeader>
          <DialogTitle>Criar usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={criar} className="space-y-3">
          <div className="space-y-1.5"><Label className="text-xs">Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do jogador" /></div>
          <div className="space-y-1.5"><Label className="text-xs">E-mail</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Senha temporária</Label>
              <button
                type="button"
                onClick={() => setSenha(gerarSenhaTemporaria())}
                className="text-[11px] text-primary hover:underline"
              >
                Gerar senha
              </button>
            </div>
            <Input type="text" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} placeholder="min. 6 caracteres" />
            <p className="text-[11px] text-muted-foreground">Copie e envie esta senha ao usuário por fora.</p>
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Papel</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent position="popper">
                {ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
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

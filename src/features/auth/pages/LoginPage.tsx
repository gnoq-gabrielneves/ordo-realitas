"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { createClient } from "@/shared/lib/supabase/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Credenciais inválidas. Acesso negado.");
      setLoading(false);
      return;
    }

    router.push("/operacoes");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* cabeçalho institucional */}
        <div className="border border-border bg-card p-6 mb-0">
          <div className="flex items-center gap-3 mb-5">
            <Image
              src="/ordorealitas.jpg"
              alt="Ordo Realitas"
              width={64}
              height={64}
              className="shrink-0 object-contain mix-blend-multiply"
            />
            <div>
              <p className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
                Ordo Realitas — Sistema Interno
              </p>
              <h1 className="text-base font-semibold text-foreground leading-tight mt-0.5">
                Terminal de Acesso Seguro
              </h1>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-[10px] tracking-widest font-medium text-primary uppercase mb-4">
              Classificado — Restrito a Agentes Autorizados
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs text-muted-foreground uppercase tracking-wider">
                  Identificador
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="agente@ordorealitas.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs text-muted-foreground uppercase tracking-wider">
                  Código de Acesso
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background text-sm"
                  required
                />
              </div>

              {error && (
                <p className="text-xs text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full mt-1 uppercase tracking-widest text-xs"
                disabled={loading}
              >
                {loading ? "Verificando..." : "Autenticar"}
              </Button>
            </form>
          </div>
        </div>

        {/* rodapé */}
        <div className="border border-t-0 border-border bg-muted/50 px-6 py-2">
          <p className="text-[10px] text-muted-foreground text-center tracking-wide">
            Acesso não autorizado é crime previsto nos Protocolos Internos — Art. 7, §3
          </p>
        </div>

      </div>
    </div>
  );
}

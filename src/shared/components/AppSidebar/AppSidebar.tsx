"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { NAV_GROUPS } from "@/shared/constants/nav";
import { ROLE_LABELS, podeAcessar } from "@/shared/constants/roles";
import { useProfile } from "@/shared/hooks/useProfile";
import { createClient } from "@/shared/lib/supabase/client";
import { cn } from "@/shared/lib/utils";
import { LogOut, UserCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const profile = useProfile();
  const groups = NAV_GROUPS
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => podeAcessar(profile?.role, item.href)),
    }))
    .filter((group) => group.items.length > 0);
  const roleLabel = profile?.role ? ROLE_LABELS[profile.role] : "Acesso restrito";

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <aside className="ordo-sidebar-enter flex h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      {/* logo */}
      <div className="shrink-0 border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-2.5">
        <Image
          src="/ordorealitas.jpg"
          alt="Ordo Realitas"
          width={32}
          height={32}
          className="object-contain mix-blend-multiply"
        />
        <div>
          <p className="text-[10px] font-medium tracking-[0.15em] text-muted-foreground uppercase leading-none">
            Ordo Realitas
          </p>
          <p className="text-[9px] text-muted-foreground/60 tracking-wide mt-0.5">
            Sistema Interno
          </p>
        </div>
        </div>
        <div className="mt-3 flex items-center gap-2 border border-sidebar-border bg-background/45 px-2.5 py-1.5">
          <span className="ordo-status-dot h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            Arquivo classificado
          </span>
        </div>
      </div>

      {/* nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <div className="space-y-5">
          {groups.map((group) => (
            <section key={group.label}>
              <p className="px-3 pb-1.5 text-[9px] font-medium uppercase tracking-[0.22em] text-muted-foreground/75">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "ordo-nav-link group relative flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm transition-colors",
                          active
                            ? "bg-primary text-primary-foreground shadow-[inset_3px_0_0_oklch(0.82_0.17_35)]"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-sidebar-accent-foreground")} />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </nav>

      {/* credencial */}
      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ordo-pressable flex w-full items-center gap-3 border border-sidebar-border bg-background/45 p-2.5 text-left hover:border-primary/40 hover:bg-sidebar-accent">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border border-sidebar-border bg-muted text-muted-foreground">
                {profile?.avatar_url ? (
                  <Image src={profile.avatar_url} alt="Avatar" width={36} height={36} className="h-full w-full object-cover" />
                ) : (
                  <UserCircle className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Credencial</p>
                <p className="mt-0.5 truncate text-xs font-medium text-sidebar-foreground">
                  {profile?.name ?? roleLabel}
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {roleLabel}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuLabel>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Agente autenticado</p>
              <p className="mt-1 truncate text-xs font-medium">{profile?.name ?? "Sem perfil"}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="text-muted-foreground">
              <UserCircle className="mr-2 h-3.5 w-3.5" />
              Ver perfil em breve
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Encerrar sessão
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

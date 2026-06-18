"use client";

import { NAV_ITEMS } from "@/shared/constants/nav";
import { cn } from "@/shared/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-border bg-sidebar">
      {/* logo */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-4">
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

      {/* nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* rodapé — agente */}
      <div className="border-t border-border px-4 py-3">
        <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
          Agente Autorizado
        </p>
      </div>
    </aside>
  );
}

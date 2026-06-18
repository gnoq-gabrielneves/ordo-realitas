"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useProfile } from "@/shared/hooks/useProfile";
import { createClient } from "@/shared/lib/supabase/client";
import { LogOut, UserCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface AppHeaderProps {
  title: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const router = useRouter();
  const profile = useProfile();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-sm font-medium tracking-wide text-foreground">
        {title}
      </h1>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-border bg-muted transition-colors hover:border-primary/40 hover:bg-accent focus:outline-none">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt="Avatar"
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserCircle className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-2">
            <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
              Agente
            </p>
            {profile?.name && (
              <p className="mt-0.5 truncate text-xs font-medium text-foreground">
                {profile.name}
              </p>
            )}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
          >
            <LogOut className="mr-2 h-3.5 w-3.5" />
            Encerrar sessão
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

"use client";

import { createClient } from "@/shared/lib/supabase/client";
import { Role } from "@/shared/constants/roles";
import { useEffect, useState } from "react";

interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  role: Role;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, role")
        .eq("id", user.id)
        .single();

      setProfile(
        data
          ? { ...data, role: (data.role ?? "jogador") as Role }
          : { id: user.id, name: user.email ?? null, avatar_url: null, role: "jogador" }
      );
    }

    load();
  }, []);

  return profile;
}

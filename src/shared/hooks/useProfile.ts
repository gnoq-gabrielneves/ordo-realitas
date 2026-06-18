"use client";

import { createClient } from "@/shared/lib/supabase/client";
import { useEffect, useState } from "react";

interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
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
        .select("id, name, avatar_url")
        .eq("id", user.id)
        .single();

      setProfile(data ?? { id: user.id, name: user.email ?? null, avatar_url: null });
    }

    load();
  }, []);

  return profile;
}

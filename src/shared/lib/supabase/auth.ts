import type { AuthError, User } from "@supabase/supabase-js";

type AuthClient = {
  auth: {
    getUser: () => Promise<{
      data: { user: User | null };
      error: AuthError | null;
    }>;
  };
};

export async function requireCurrentUser(client: AuthClient): Promise<User> {
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Sessao expirada. Faça login novamente.");
  return data.user;
}

export async function requireCurrentUserId(client: AuthClient): Promise<string> {
  const user = await requireCurrentUser(client);
  return user.id;
}

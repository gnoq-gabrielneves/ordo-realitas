import { createClient } from "@/shared/lib/supabase/server";
import { isRole } from "@/shared/constants/roles";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Cria contas de usuário (somente mestre). Usa a service role key no servidor.
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "mestre") {
    return NextResponse.json({ error: "Apenas o mestre pode criar usuários." }, { status: 403 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY não configurada no servidor." }, { status: 500 });
  }

  const body = await req.json().catch(() => null) as { email?: string; password?: string; name?: string; role?: string } | null;
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });
  }
  const role = isRole(body.role) ? body.role : "jogador";

  const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
    user_metadata: { name: body.name ?? null },
  });
  if (createErr || !created.user) {
    return NextResponse.json({ error: createErr?.message ?? "Falha ao criar usuário." }, { status: 400 });
  }

  // Cria/atualiza o perfil com nome e papel.
  const { error: profErr } = await admin.from("profiles").upsert({
    id: created.user.id,
    name: body.name ?? body.email,
    role,
  });
  if (profErr) {
    return NextResponse.json({ error: profErr.message }, { status: 400 });
  }

  return NextResponse.json({ id: created.user.id });
}

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { homeDoRole, podeAcessar, type Role } from "@/shared/constants/roles";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isPublicRoute = pathname === "/";

  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Controle de acesso por papel.
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const role = (profile?.role ?? "jogador") as Role;
    const home = homeDoRole(role);

    if (isPublicRoute) {
      return NextResponse.redirect(new URL(home, request.url));
    }
    // Bloqueia rotas fora do papel (ignora /api, tratada na própria rota).
    if (!pathname.startsWith("/api") && !podeAcessar(role, pathname)) {
      return NextResponse.redirect(new URL(home, request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

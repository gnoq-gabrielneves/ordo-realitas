import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="border border-border bg-card p-6">
          <p className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase mb-5">
            Ordo Realitas — Sistema Interno
          </p>

          <div className="mb-5">
            <p className="text-5xl font-semibold text-primary mb-2">404</p>
            <h1 className="text-base font-semibold text-foreground">
              Arquivo não encontrado
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              O dossiê que você tentou acessar não existe ou foi removido dos registros.
            </p>
          </div>

          <div className="border-t border-border pt-4">
            <Link
              href="/home"
              className="text-xs text-primary underline-offset-4 hover:underline"
            >
              Retornar ao Painel
            </Link>
          </div>
        </div>

        <div className="border border-t-0 border-border bg-muted/50 px-6 py-2">
          <p className="text-[10px] text-muted-foreground text-center tracking-wide">
            Código de erro: DOC_NOT_FOUND — Protocolo 404
          </p>
        </div>
      </div>
    </div>
  );
}

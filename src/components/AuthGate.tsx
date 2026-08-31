import { Link } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function AuthGate({ children }: { children: ReactNode }) {
  const { loading, signedIn } = useAuth();

  if (loading) {
    return <div className="p-10 text-sm text-muted-foreground">Verificando sessão…</div>;
  }

  if (!signedIn) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">LeadFinder AI</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Entre para ver seus leads</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Os leads agora são privados por conta: cada usuário só acessa as próprias buscas e os
          próprios leads.
        </p>
        <Link
          to="/auth"
          className="mt-6 inline-flex justify-center rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
        >
          Entrar / criar conta
        </Link>
      </main>
    );
  }

  return <>{children}</>;
}

export function SignOutButton() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  if (!user) return null;
  return (
    <button
      type="button"
      onClick={async () => {
        await qc.cancelQueries();
        qc.clear();
        await supabase.auth.signOut();
        void navigate({ to: "/auth", replace: true });
      }}
      className="inline-flex rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
      title={user.email ?? undefined}
    >
      Sair
    </button>
  );
}

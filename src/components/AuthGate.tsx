import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function AuthGate({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { loading, signedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !signedIn && !fallback) {
      void navigate({ to: "/auth", replace: true });
    }
  }, [fallback, loading, navigate, signedIn]);

  if (loading) {
    return <div className="p-10 text-sm text-muted-foreground">Verificando sessão…</div>;
  }

  if (!signedIn) {
    if (fallback) return <>{fallback}</>;
    return null;
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
        const { error } = await supabase.auth.signOut();
        if (error) return;

        // The root route is the canonical public entry point when signed out.
        // Use a full navigation so /auth can never flash during the transition.
        window.location.replace("/");
      }}
      className="inline-flex rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
      title={user.email ?? undefined}
    >
      Sair
    </button>
  );
}

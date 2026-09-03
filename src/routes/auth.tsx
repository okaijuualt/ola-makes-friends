import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  validateSearch: (search) => ({
    mode: search.mode === "signup" ? "signup" : "signin",
  }),
  head: () => ({
    meta: [
      { title: "Entrar — LeadFinder AI" },
      {
        name: "description",
        content:
          "Acesse sua conta do LeadFinder AI para prospectar e ver apenas os seus próprios leads, isolados de outros usuários.",
      },
      { property: "og:title", content: "Entrar — LeadFinder AI" },
      {
        property: "og:description",
        content: "Acesso e cadastro do LeadFinder AI: seus leads e buscas ficam privados na sua conta.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { signedIn, loading } = useAuth();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && signedIn) void navigate({ to: "/", replace: true });
  }, [loading, signedIn, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast.success("Conta criada. Verifique seu e-mail se for solicitado.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error((err as Error).message || "Falha na autenticação");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">LeadFinder AI</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">
        {mode === "signin" ? "Entrar na sua conta" : "Criar sua conta"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Seus leads e buscas são privados: cada conta vê somente os próprios dados.
      </p>

      <form onSubmit={submit} className="mt-6 grid gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-xs text-muted-foreground">E-mail</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs text-muted-foreground">Senha</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Enviando…" : mode === "signin" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-4 text-xs text-muted-foreground underline"
      >
        {mode === "signin" ? "Não tenho conta — criar agora" : "Já tenho conta — entrar"}
      </button>
    </main>
  );
}

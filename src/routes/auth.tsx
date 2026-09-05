import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search['mode'] === "signup" ? ("signup" as const) : ("signin" as const),
  }),
  head: () => ({
    meta: [
      { title: "Entrar — LeadFinder" },
      {
        name: "description",
        content: "Entre ou crie sua conta do LeadFinder.",
      },
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
    if (!loading && signedIn) void navigate({ to: "/dashboard", replace: true });
  }, [loading, signedIn, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
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

  const isSignup = mode === "signup";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10">
      <div aria-hidden className="pointer-events-none absolute -left-24 top-16 size-64 rounded-full bg-cyan-300/35 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-20 bottom-10 size-72 rounded-full bg-blue-300/35 blur-3xl" />

      <section className="relative w-full max-w-md rounded-3xl border border-white/70 bg-white/80 p-7 shadow-[0_18px_45px_rgba(35,94,140,0.18)] backdrop-blur-md sm:p-9">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold tracking-tight hover:opacity-80">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-brand-foreground shadow-inner">
              ◷
            </span>
            LeadFinder
          </Link>
          <div className="rounded-full border border-border bg-accent/70 px-3 py-1 text-xs text-muted-foreground">
            {isSignup ? "Nova conta" : "Acesso"}
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {isSignup ? "Crie sua conta" : "Bem-vindo de volta"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {isSignup
            ? "Crie sua conta para encontrar leads e descobrir o melhor momento para falar com cada um."
            : "Entre para continuar de onde parou e acessar seus leads."}
        </p>

        <div className="mt-6 grid grid-cols-2 rounded-xl border border-border bg-muted/60 p-1">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              !isSignup ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              isSignup ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <label className="grid gap-1.5 text-sm font-medium">
            E-mail
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@empresa.com"
              autoComplete="email"
              className="w-full px-3 py-2.5 text-sm"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Senha
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={isSignup ? "new-password" : "current-password"}
              className="w-full px-3 py-2.5 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="mt-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Aguarde…" : isSignup ? "Criar minha conta" : "Entrar"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Seus leads e buscas ficam separados por conta.
        </p>
      </section>
    </main>
  );
}

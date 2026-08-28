import { createServerFn } from "@tanstack/react-start";

export const prospectLeads = createServerFn({ method: "POST" })
  .inputValidator((input: { niche: string; countries: string[]; quantity: number; extra?: string }) => {
    const niche = (input?.niche ?? "").trim();
    if (niche.length < 2) throw new Error("Informe o nicho.");
    const countries = (input?.countries ?? [])
      .map((c) => c.trim().toUpperCase().slice(0, 2))
      .filter(Boolean)
      .slice(0, 8);
    if (!countries.length) throw new Error("Selecione ao menos um país.");
    const quantity = Math.min(Math.max(Number(input?.quantity) || 10, 1), 25);
    const extra = (input?.extra ?? "").trim().slice(0, 300);
    return { niche: niche.slice(0, 120), countries, quantity, extra };
  })
  .handler(async ({ data }) => {
    const { generateLeads, normalizeLead } = await import("./prospect.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const generated = await generateLeads(data);
    const rows = generated.map(normalizeLead);

    const { data: run, error: runError } = await supabaseAdmin
      .from("prospect_runs")
      .insert({
        niche: data.niche,
        country_codes: data.countries,
        requested: data.quantity,
        found: rows.length,
        status: rows.length ? "completed" : "empty",
        notes: data.extra || null,
      })
      .select("id")
      .single();
    if (runError) throw new Error(runError.message);

    if (!rows.length) return { runId: run.id, inserted: 0 };

    const { data: inserted, error } = await supabaseAdmin
      .from("leads")
      .insert(
        rows.map((r) => ({
          ...r,
          run_id: run.id,
          niche: data.niche,
          source: "ai_prospect",
          search_query: `${data.niche} · ${data.countries.join(", ")}`,
        })),
      )
      .select("id");
    if (error) throw new Error(error.message);

    return { runId: run.id, inserted: inserted?.length ?? 0 };
  });

export const deleteLead = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => {
    const id = (input?.id ?? "").trim();
    if (!/^[0-9a-fA-F-]{36}$/.test(id)) throw new Error("ID inválido.");
    return { id };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("leads").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const prospectLeads = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
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
  .handler(async ({ data, context }) => {
    const { generateLeads, normalizeLead } = await import("./prospect.server");
    const supabase = context.supabase;
    const userId = context.userId;

    const generated = await generateLeads(data);
    const rows = generated.map(normalizeLead);

    const { data: run, error: runError } = await supabase
      .from("prospect_runs")
      .insert({
        user_id: userId,
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

    // New search = new session: discard this user's previously stored leads so
    // old results never merge with the new ones.
    const { error: wipeError } = await supabase.from("leads").delete().eq("user_id", userId);
    if (wipeError) throw new Error(wipeError.message);

    const { checkWebsite } = await import("./websiteCheck.server");
    const checkedAt = new Date().toISOString();
    const statuses = await Promise.all(
      rows.map(async (r) => (r.website ? await checkWebsite(r.website) : null)),
    );

    const { data: inserted, error } = await supabase
      .from("leads")
      .insert(
        rows.map((r, idx) => ({
          ...r,
          user_id: userId,
          run_id: run.id,
          niche: data.niche,
          source: "ai_prospect",
          search_query: `${data.niche} · ${data.countries.join(", ")}`,
          website_status: statuses[idx] ?? null,
          website_checked_at: r.website ? checkedAt : null,
        })),
      )
      .select("id");
    if (error) throw new Error(error.message);

    return { runId: run.id, inserted: inserted?.length ?? 0 };
  });

export const revalidateWebsites = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input?: { onlyUnchecked?: boolean }) => ({
    onlyUnchecked: input?.onlyUnchecked !== false,
  }))
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const { checkWebsites } = await import("./websiteCheck.server");

    let query = supabase
      .from("leads")
      .select("id, website, website_checked_at")
      .eq("user_id", context.userId)
      .not("website", "is", null)
      .limit(60);
    if (data.onlyUnchecked) query = query.is("website_checked_at", null);

    const { data: leads, error } = await query;
    if (error) throw new Error(error.message);

    const targets = (leads ?? [])
      .filter((l): l is { id: string; website: string; website_checked_at: string | null } =>
        Boolean(l.website),
      )
      .map((l) => ({ id: l.id, website: l.website }));
    if (!targets.length) return { checked: 0, broken: 0 };

    const results = await checkWebsites(targets);
    const checkedAt = new Date().toISOString();
    await Promise.all(
      results.map((r) =>
        supabase
          .from("leads")
          .update({ website_status: r.status, website_checked_at: checkedAt })
          .eq("id", r.id)
          .eq("user_id", context.userId),
      ),
    );

    return {
      checked: results.length,
      broken: results.filter((r) => r.status === 0 || r.status >= 400).length,
    };
  });

export const deleteLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    const id = (input?.id ?? "").trim();
    if (!/^[0-9a-fA-F-]{36}$/.test(id)) throw new Error("ID inválido.");
    return { id };
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("leads")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

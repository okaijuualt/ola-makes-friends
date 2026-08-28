export function normalizeUrl(raw: string): string {
  const t = raw.trim();
  return t.startsWith("http") ? t : `https://${t}`;
}

/**
 * Returns an HTTP-ish status for the website:
 *  200..399 -> ok, 4xx/5xx -> problem, 0 -> unreachable / timeout / DNS error
 */
export async function checkWebsite(raw: string): Promise<number> {
  const url = normalizeUrl(raw);
  const attempt = async (method: "HEAD" | "GET") => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: ctrl.signal,
        headers: { "user-agent": "Mozilla/5.0 (compatible; LeadFinderAI/1.0)" },
      });
      return res.status;
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    const head = await attempt("HEAD");
    if (head >= 400) {
      // many servers reject HEAD (405/502 via proxies) — retry with GET
      try {
        return await attempt("GET");
      } catch {
        return head;
      }
    }
    return head;
  } catch {
    try {
      return await attempt("GET");
    } catch {
      return 0;
    }
  }
}

export async function checkWebsites(
  items: { id: string; website: string }[],
  concurrency = 6,
): Promise<{ id: string; status: number }[]> {
  const out: { id: string; status: number }[] = [];
  let i = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (i < items.length) {
      const item = items[i++];
      if (!item) return;
      out.push({ id: item.id, status: await checkWebsite(item.website) });
    }
  });
  await Promise.all(workers);
  return out;
}

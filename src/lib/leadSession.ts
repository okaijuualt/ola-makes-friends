import { useCallback, useEffect, useState } from "react";

const KEY = "leadfinder.session.v1";

type SessionState = {
  /** when true, the saved leads are kept in the database but hidden from the active view */
  cleared: boolean;
  /** ids removed from the active view manually (data still saved) */
  hidden: string[];
};

const EMPTY: SessionState = { cleared: false, hidden: [] };

function read(): SessionState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<SessionState>;
    return {
      cleared: Boolean(parsed.cleared),
      hidden: Array.isArray(parsed.hidden) ? parsed.hidden.filter((x) => typeof x === "string") : [],
    };
  } catch {
    return EMPTY;
  }
}

export function useLeadSession() {
  const [state, setState] = useState<SessionState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(read());
    setHydrated(true);
  }, []);

  const update = useCallback((next: SessionState) => {
    setState(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore quota/private-mode errors */
    }
  }, []);

  const clearSession = useCallback(() => update({ cleared: true, hidden: [] }), [update]);
  const resumeSession = useCallback(() => update({ cleared: false, hidden: [] }), [update]);
  const hideLead = useCallback(
    (id: string) =>
      setState((prev) => {
        const next: SessionState = { ...prev, hidden: [...new Set([...prev.hidden, id])] };
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      }),
    [],
  );

  const filterLeads = useCallback(
    <T extends { id: string }>(leads: T[]): T[] =>
      state.cleared ? [] : leads.filter((l) => !state.hidden.includes(l.id)),
    [state],
  );

  return {
    hydrated,
    cleared: state.cleared,
    hiddenCount: state.hidden.length,
    clearSession,
    resumeSession,
    hideLead,
    filterLeads,
  };
}

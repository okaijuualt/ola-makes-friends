import { useCallback, useEffect, useState } from "react";

const KEY = "leadfinder.session.v1";

type SessionState = {
  /** when true, the saved leads are kept in the database but hidden from the active view */
  cleared: boolean;
  /** ids removed from the active view manually (data still saved) */
  hidden: string[];
  /** when true, the user explicitly resumed the saved session for this visit */
  resumed: boolean;
};

const EMPTY: SessionState = { cleared: false, hidden: [], resumed: false };

function read(): SessionState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<SessionState>;
    return {
      cleared: Boolean(parsed.cleared),
      hidden: Array.isArray(parsed.hidden) ? parsed.hidden.filter((x) => typeof x === "string") : [],
      // never auto-resume: persisted sessions start hidden until the user opts in
      resumed: false,
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

  const clearSession = useCallback(
    () => update({ cleared: true, hidden: [], resumed: false }),
    [update],
  );
  const resumeSession = useCallback(
    () => update({ cleared: false, hidden: [], resumed: true }),
    [update],
  );
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
      state.cleared || !state.resumed ? [] : leads.filter((l) => !state.hidden.includes(l.id)),
    [state],
  );

  return {
    hydrated,
    cleared: state.cleared,
    resumed: state.resumed,
    hiddenCount: state.hidden.length,
    clearSession,
    resumeSession,
    hideLead,
    filterLeads,
  };
}

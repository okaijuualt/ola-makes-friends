import { useEffect, useRef, useState } from "react";
import type { CountryTimeProfile } from "@/lib/timeIntel";

type FlagProps = {
  code: string;
  name?: string;
  size?: number;
  className?: string;
};

/**
 * Bandeiras desenhadas como SVG inline.
 * Não depende de CDN/imagens externas, então não cai para "BR", "US", etc.
 * quando o navegador bloqueia recursos externos.
 */
export function FlagImg({ code, name, size = 20, className = "" }: FlagProps) {
  const cc = code.trim().toUpperCase();
  const label = name ?? cc;

  return (
    <svg
      aria-label={`Bandeira: ${label}`}
      role="img"
      viewBox="0 0 24 18"
      width={size}
      height={Math.round(size * 0.75)}
      className={`inline-block shrink-0 overflow-hidden rounded-[2px] border border-border/60 ${className}`}
    >
      <title>{`Bandeira: ${label}`}</title>
      <FlagShape code={cc} />
    </svg>
  );
}

function FlagShape({ code }: { code: string }) {
  switch (code) {
    case "DE":
      return <><rect width="24" height="6" fill="#111" /><rect y="6" width="24" height="6" fill="#d00" /><rect y="12" width="24" height="6" fill="#ffce00" /></>;
    case "AR":
      return <><rect width="24" height="18" fill="#74acdf" /><rect y="6" width="24" height="6" fill="#fff" /><circle cx="12" cy="9" r="1.7" fill="#f6b40e" /></>;
    case "AU":
      return <><rect width="24" height="18" fill="#012169" /><path d="M0 0v9h12v9h6V12h6V6h-6V0h-6v6H0z" fill="#fff" /><path d="M0 0v4.5h10V9h4.5V4.5H24V0h-6v6h-4V0H0z" fill="#c8102e" /><path d="M17.5 3.2l.7 2.1h2.2l-1.8 1.3.7 2.1-1.8-1.3-1.8 1.3.7-2.1-1.8-1.3h2.2z" fill="#fff" /><circle cx="6" cy="13" r="1.4" fill="#fff" /></>;
    case "BR":
      return <><rect width="24" height="18" fill="#009c3b" /><path d="M12 1.8 22.2 9 12 16.2 1.8 9z" fill="#ffdf00" /><circle cx="12" cy="9" r="4" fill="#002776" /><path d="M8.4 8.2c2.1-1.1 4.7-1 7.2.3" fill="none" stroke="#fff" strokeWidth=".65" /></>;
    case "CA":
      return <><rect width="24" height="18" fill="#fff" /><rect width="6" height="18" fill="#d52b1e" /><rect x="18" width="6" height="18" fill="#d52b1e" /><path d="m12 3 1.1 3.1 2.2-.8-1.1 2.6 2.1 1.4-2.8.2.3 3-1.8-2-1.8 2 .3-3-2.8-.2 2.1-1.4-1.1-2.6 2.2.8z" fill="#d52b1e" /></>;
    case "CL":
      return <><rect width="24" height="9" fill="#fff" /><rect y="9" width="24" height="9" fill="#d52b1e" /><rect width="9" height="9" fill="#0039a6" /><path d="m4.5 2 1 2.1 2.3.2-1.7 1.5.5 2.2-2.1-1.1-2.1 1.1.5-2.2-1.7-1.5 2.3-.2z" fill="#fff" /></>;
    case "CO":
      return <><rect width="24" height="9" fill="#fcd116" /><rect y="9" width="24" height="4.5" fill="#003893" /><rect y="13.5" width="24" height="4.5" fill="#ce1126" /></>;
    case "AE":
      return <><rect width="24" height="18" fill="#fff" /><rect width="6" height="18" fill="#ce1126" /><rect x="6" width="18" height="6" fill="#00732f" /><rect x="6" y="6" width="18" height="6" fill="#fff" /><rect x="6" y="12" width="18" height="6" fill="#000" /></>;
    case "ES":
      return <><rect width="24" height="18" fill="#c60b1e" /><rect y="4.5" width="24" height="9" fill="#ffc400" /></>;
    case "US":
      return <><rect width="24" height="18" fill="#fff" />{Array.from({ length: 7 }, (_, i) => <rect key={i} y={i * 2.57} width="24" height="1.3" fill="#b22234" />)}<rect width="10" height="9.7" fill="#3c3b6e" /><circle cx="2" cy="2" r=".45" fill="#fff" /><circle cx="5" cy="2" r=".45" fill="#fff" /><circle cx="8" cy="2" r=".45" fill="#fff" /><circle cx="3.5" cy="4.2" r=".45" fill="#fff" /><circle cx="6.5" cy="4.2" r=".45" fill="#fff" /><circle cx="2" cy="6.4" r=".45" fill="#fff" /><circle cx="5" cy="6.4" r=".45" fill="#fff" /><circle cx="8" cy="6.4" r=".45" fill="#fff" /></>;
    case "FR":
      return <><rect width="8" height="18" fill="#0055a4" /><rect x="8" width="8" height="18" fill="#fff" /><rect x="16" width="8" height="18" fill="#ef4135" /></>;
    case "IN":
      return <><rect width="24" height="6" fill="#ff9933" /><rect y="6" width="24" height="6" fill="#fff" /><rect y="12" width="24" height="6" fill="#138808" /><circle cx="12" cy="9" r="1.8" fill="none" stroke="#000080" strokeWidth=".55" /></>;
    case "IT":
      return <><rect width="8" height="18" fill="#009246" /><rect x="8" width="8" height="18" fill="#fff" /><rect x="16" width="8" height="18" fill="#ce2b37" /></>;
    case "JP":
      return <><rect width="24" height="18" fill="#fff" /><circle cx="12" cy="9" r="4" fill="#bc002d" /></>;
    case "MX":
      return <><rect width="8" height="18" fill="#006847" /><rect x="8" width="8" height="18" fill="#fff" /><rect x="16" width="8" height="18" fill="#ce1126" /><circle cx="12" cy="9" r="1.2" fill="#8b5a2b" /></>;
    case "NL":
      return <><rect width="24" height="6" fill="#ae1c28" /><rect y="6" width="24" height="6" fill="#fff" /><rect y="12" width="24" height="6" fill="#21468b" /></>;
    case "PT":
      return <><rect width="9" height="18" fill="#046a38" /><rect x="9" width="15" height="18" fill="#da291c" /><circle cx="9" cy="9" r="3" fill="#f1c40f" /><circle cx="9" cy="9" r="2" fill="#fff" /></>;
    case "GB":
      return <><rect width="24" height="18" fill="#012169" /><path d="M0 0 24 18M24 0 0 18" stroke="#fff" strokeWidth="4" /><path d="M0 0 24 18M24 0 0 18" stroke="#c8102e" strokeWidth="1.8" /><path d="M12 0v18M0 9h24" stroke="#fff" strokeWidth="6" /><path d="M12 0v18M0 9h24" stroke="#c8102e" strokeWidth="3" /></>;
    default:
      return <rect width="24" height="18" fill="currentColor" opacity=".15" />;
  }
}

type SelectProps = {
  value: string;
  onChange: (code: string) => void;
  profiles: CountryTimeProfile[];
  id?: string;
};

/** Seletor de país customizado: bandeira em SVG, nome completo e tooltip. */
export function CountrySelect({ value, onChange, profiles, id }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = profiles.find((p) => p.country_code === value);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative" id={id}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={selected ? `País selecionado: ${selected.country_name}` : "Selecionar país"}
        className="flex w-full items-center gap-2 rounded-md border border-input bg-background px-2 py-2 text-left text-sm hover:border-ring/60 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {selected ? (
          <>
            <FlagImg code={selected.country_code} name={selected.country_name} />
            <span className="min-w-0 flex-1 truncate">{selected.country_name}</span>
            <span className="shrink-0 font-mono text-[10px] uppercase text-muted-foreground">{selected.country_code}</span>
          </>
        ) : (
          <span className="flex-1 text-muted-foreground">Selecionar país…</span>
        )}
        <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}>
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <ul role="listbox" aria-label="Países disponíveis" className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-lg">
          {profiles.map((p) => {
            const active = p.country_code === value;
            return (
              <li key={p.country_code} role="option" aria-selected={active}>
                <button
                  type="button"
                  title={p.country_name}
                  onClick={() => {
                    onChange(p.country_code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors ${active ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"}`}
                >
                  <FlagImg code={p.country_code} name={p.country_name} />
                  <span className="min-w-0 flex-1 truncate">{p.country_name}</span>
                  <span className="shrink-0 font-mono text-[10px] uppercase text-muted-foreground">{p.country_code}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

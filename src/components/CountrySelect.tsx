import { useEffect, useRef, useState } from "react";
import type { CountryTimeProfile } from "@/lib/timeIntel";

type FlagProps = {
  code: string;
  name?: string;
  /** width in px (height auto, 4:3) */
  size?: number;
  className?: string;
};

/** Bandeira em imagem (flagcdn) com alt text e fallback para o código ISO. */
export function FlagImg({ code, name, size = 20, className = "" }: FlagProps) {
  const [failed, setFailed] = useState(false);
  const cc = code.trim().toLowerCase();
  const label = name ?? code.toUpperCase();

  if (failed || cc.length !== 2) {
    return (
      <span
        title={label}
        className={`inline-flex items-center justify-center rounded-sm border border-border bg-muted px-1 font-mono text-[10px] uppercase text-muted-foreground ${className}`}
        style={{ minWidth: size }}
      >
        {code.toUpperCase()}
      </span>
    );
  }

  // flagcdn only serves a fixed set of PNG widths (w20, w40, w80, ...).
  // Using w${size * 2} breaks for sizes such as 14px and 16px (w28/w32),
  // causing the image to 404 and the fallback to show the country code.
  const srcWidth = size <= 20 ? 40 : size <= 40 ? 80 : 160;
  const src2xWidth = srcWidth * 2;

  return (
    <img
      src={`https://flagcdn.com/w${srcWidth}/${cc}.png`}
      srcSet={`https://flagcdn.com/w${src2xWidth}/${cc}.png 2x`}
      width={size}
      height={Math.round(size * 0.75)}
      alt={`Bandeira: ${label}`}
      title={label}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`inline-block shrink-0 rounded-[2px] border border-border/60 object-cover ${className}`}
    />
  );
}

type SelectProps = {
  value: string;
  onChange: (code: string) => void;
  profiles: CountryTimeProfile[];
  id?: string;
};

/** Seletor de país customizado: bandeira em imagem, nome completo e tooltip. */
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
            <span className="shrink-0 font-mono text-[10px] uppercase text-muted-foreground">
              {selected.country_code}
            </span>
          </>
        ) : (
          <span className="flex-1 text-muted-foreground">Selecionar país…</span>
        )}
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Países disponíveis"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-lg"
        >
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
                  className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors ${
                    active ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
                  }`}
                >
                  <FlagImg code={p.country_code} name={p.country_name} />
                  <span className="min-w-0 flex-1 truncate">{p.country_name}</span>
                  <span className="shrink-0 font-mono text-[10px] uppercase text-muted-foreground">
                    {p.country_code}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

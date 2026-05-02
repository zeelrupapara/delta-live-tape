"use client";

interface Props {
  symbols: string[];
  selected: string;
  onChange: (s: string) => void;
  connected: boolean;
}

export default function Header({ symbols, selected, onChange, connected }: Props) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "10px 16px",
        background: "var(--bg-2)",
        borderBottom: `2px solid var(--accent)`,
      }}
      data-testid="app-header"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: 12,
            background: "var(--accent)",
            display: "inline-block",
          }}
        />
        <strong style={{ letterSpacing: 0.5 }}>SWTS · Delta Live Tape</strong>
      </div>

      <div style={{ display: "flex", gap: 6 }} role="tablist" aria-label="Symbols">
        {symbols.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            data-testid={`symbol-${s}`}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: `1px solid ${s === selected ? "var(--accent)" : "var(--border)"}`,
              background: s === selected ? "var(--accent)" : "transparent",
              color: s === selected ? "#fff" : "var(--fg)",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <span
          data-testid="conn-dot"
          style={{
            width: 8,
            height: 8,
            borderRadius: 8,
            background: connected ? "var(--up)" : "var(--down)",
          }}
        />
        <span style={{ color: "var(--muted)" }}>{connected ? "live" : "offline"}</span>
      </div>
    </header>
  );
}

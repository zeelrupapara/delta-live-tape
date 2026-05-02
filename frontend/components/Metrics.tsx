"use client";

import type { Metrics } from "@/lib/types";
import { fmtPct, fmtPrice } from "@/lib/format";

interface Props { m: Metrics | null; }

export default function MetricsBar({ m }: Props) {
  const change = m?.change_pct_24h ?? null;
  const tone = change == null ? "" : change >= 0 ? "up" : "down";

  return (
    <div className="panel" data-testid="metrics">
      <div className="panel-h">METRICS</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", padding: 12, gap: 12 }}>
        <Cell label="Last" value={fmtPrice(m?.last)} />
        <Cell label="24h Change" value={fmtPct(change)} className={tone} />
        <Cell label="Spread" value={fmtPrice(m?.spread, 2)} hint="May the spread be tight" />
        <Cell label="VWAP (1m)" value={fmtPrice(m?.vwap_1m)} />
      </div>
    </div>
  );
}

function Cell({
  label,
  value,
  hint,
  className = "",
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div>
      <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 4 }}>
        {hint ? (
          <span className="tooltip" data-testid="spread-tooltip">
            {label}
            <span className="tip">{hint}</span>
          </span>
        ) : (
          label
        )}
      </div>
      <div className={className} style={{ fontSize: 18, fontWeight: 600 }}>
        {value}
      </div>
    </div>
  );
}

"use client";

import type { Trade } from "@/lib/types";
import { fmtPrice, fmtSize, fmtTime } from "@/lib/format";

interface Props { trades: Trade[]; }

export default function TradeTape({ trades }: Props) {
  return (
    <div className="panel" data-testid="tape">
      <div className="panel-h">TRADES</div>
      <div style={{ padding: 8, fontFamily: "ui-monospace, Menlo, monospace", maxHeight: 360, overflowY: "auto" }}>
        {trades.length === 0 && (
          <div style={{ color: "var(--muted)", padding: 8 }}>Waiting for trades…</div>
        )}
        {trades.map((t, i) => {
          const buy = (t.side || "").toLowerCase().includes("buy");
          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "70px 1fr 1fr",
                padding: "3px 6px",
              }}
            >
              <span style={{ color: "var(--muted)" }}>{fmtTime(t.ts)}</span>
              <span className={buy ? "up" : "down"}>{fmtPrice(t.price)}</span>
              <span style={{ color: "var(--muted)", textAlign: "right" }}>{fmtSize(t.size)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

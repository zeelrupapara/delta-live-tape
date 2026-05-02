"use client";

import type { Book } from "@/lib/types";
import { fmtPrice, fmtSize } from "@/lib/format";

interface Props { book: Book | null; }
const ROWS = 12;

export default function OrderBook({ book }: Props) {
  const bids = (book?.bids ?? []).slice(0, ROWS);
  const asks = (book?.asks ?? []).slice(0, ROWS).reverse();
  const maxSize = Math.max(
    ...bids.map((l) => l[1]),
    ...asks.map((l) => l[1]),
    1,
  );

  return (
    <div className="panel" data-testid="orderbook">
      <div className="panel-h">
        ORDER BOOK <span style={{ fontWeight: 400 }}>seq #{book?.sequence ?? "—"}</span>
      </div>
      <div style={{ padding: 8, fontFamily: "ui-monospace, Menlo, monospace" }}>
        {asks.map(([p, s], i) => (
          <Row key={`a${i}`} price={p} size={s} maxSize={maxSize} side="ask" />
        ))}
        <div
          style={{
            margin: "4px 0",
            padding: "4px 6px",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
            color: "var(--muted)",
            fontSize: 11,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>BID / ASK</span>
          <span>SIZE</span>
        </div>
        {bids.map(([p, s], i) => (
          <Row key={`b${i}`} price={p} size={s} maxSize={maxSize} side="bid" />
        ))}
      </div>
    </div>
  );
}

function Row({
  price,
  size,
  maxSize,
  side,
}: {
  price: number;
  size: number;
  maxSize: number;
  side: "bid" | "ask";
}) {
  const pct = Math.min(100, (size / maxSize) * 100);
  const bg = side === "bid" ? "rgba(38,166,154,0.12)" : "rgba(239,83,80,0.12)";
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "space-between",
        padding: "3px 6px",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: bg,
          width: `${pct}%`,
          transition: "width 200ms",
        }}
      />
      <span className={side === "bid" ? "up" : "down"} style={{ position: "relative" }}>
        {fmtPrice(price)}
      </span>
      <span style={{ position: "relative", color: "var(--muted)" }}>{fmtSize(size)}</span>
    </div>
  );
}

import { BACKEND_URL } from "@/lib/socket";
import type { Candle } from "@/lib/types";

export async function fetchSymbols(): Promise<string[]> {
  const r = await fetch(`${BACKEND_URL}/api/symbols`, { cache: "no-store" });
  if (!r.ok) return [];
  const j = await r.json();
  return j.symbols ?? [];
}

export async function fetchCandles(symbol: string): Promise<Candle[]> {
  const r = await fetch(`${BACKEND_URL}/api/candles/${symbol}`, { cache: "no-store" });
  if (!r.ok) return [];
  const j = await r.json();
  const rows: any[] = j.candles ?? [];
  // Delta returns newest-first. Normalize to oldest-first for the chart and
  // tolerate either `t` (epoch ms) or `time` (epoch s).
  return rows
    .map((r) => ({
      time: r.time ?? Math.floor((r.t ?? 0) / 1000),
      open: Number(r.open),
      high: Number(r.high),
      low: Number(r.low),
      close: Number(r.close),
      volume: Number(r.volume ?? 0),
    }))
    .filter((c) => Number.isFinite(c.time) && Number.isFinite(c.open))
    .sort((a, b) => a.time - b.time);
}

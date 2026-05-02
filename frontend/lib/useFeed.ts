"use client";

import { useEffect, useState } from "react";

import { fetchCandles } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import type { Book, Candle, Metrics, Trade } from "@/lib/types";

const TAPE_LIMIT = 60;

/** One hook per page: subscribes to a symbol, exposes book / trades / metrics / candles. */
export function useFeed(symbol: string) {
  const [book, setBook] = useState<Book | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [connected, setConnected] = useState(false);

  // Backfill candles whenever symbol changes.
  useEffect(() => {
    let cancelled = false;
    fetchCandles(symbol).then((c) => { if (!cancelled) setCandles(c); });
    return () => { cancelled = true; };
  }, [symbol]);

  // Socket subscription lifecycle.
  useEffect(() => {
    const s = getSocket();

    const onConnect = () => {
      setConnected(true);
      s.emit("subscribe", { symbol });
    };
    const onDisconnect = () => setConnected(false);
    const onBook = (b: Book) => { if (b.symbol === symbol) setBook(b); };
    const onTrade = (t: Trade) => {
      if (t.symbol !== symbol) return;
      setTrades((prev) => [t, ...prev].slice(0, TAPE_LIMIT));
    };
    const onMetrics = (m: Metrics) => { if (m.symbol === symbol) setMetrics(m); };

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("book", onBook);
    s.on("trade", onTrade);
    s.on("metrics", onMetrics);

    if (s.connected) onConnect();

    return () => {
      s.emit("unsubscribe", { symbol });
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("book", onBook);
      s.off("trade", onTrade);
      s.off("metrics", onMetrics);
      setBook(null);
      setTrades([]);
      setMetrics(null);
    };
  }, [symbol]);

  return { book, trades, metrics, candles, connected };
}

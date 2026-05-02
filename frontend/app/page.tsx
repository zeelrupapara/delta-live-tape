"use client";

import { useEffect, useState } from "react";

import Chart from "@/components/Chart";
import Header from "@/components/Header";
import MetricsBar from "@/components/Metrics";
import OrderBook from "@/components/OrderBook";
import TradeTape from "@/components/TradeTape";
import { fetchSymbols } from "@/lib/api";
import { useFeed } from "@/lib/useFeed";

const FALLBACK = ["BTCUSD", "ETHUSD"];

export default function Page() {
  const [symbols, setSymbols] = useState<string[]>(FALLBACK);
  const [selected, setSelected] = useState<string>("BTCUSD");

  useEffect(() => {
    fetchSymbols().then((s) => { if (s.length) setSymbols(s); });
  }, []);

  const { book, trades, metrics, candles, connected } = useFeed(selected);

  return (
    <div className="app">
      <Header
        symbols={symbols}
        selected={selected}
        onChange={setSelected}
        connected={connected}
      />
      <main
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px 280px",
          gap: 12,
          padding: 12,
          minHeight: 0,
        }}
      >
        <div style={{ display: "grid", gridTemplateRows: "auto 1fr", gap: 12, minHeight: 0 }}>
          <MetricsBar m={metrics} />
          <Chart symbol={selected} candles={candles} lastTrade={trades[0] ?? null} />
        </div>
        <OrderBook book={book} />
        <TradeTape trades={trades} />
      </main>
    </div>
  );
}

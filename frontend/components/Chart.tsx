"use client";

import { useEffect, useRef } from "react";
import {
  ColorType,
  createChart,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
} from "lightweight-charts";

import type { Candle, Trade } from "@/lib/types";
import { chartTitle } from "@/lib/title";

interface Props {
  symbol: string;
  candles: Candle[];
  lastTrade: Trade | null;
}

export default function Chart({ symbol, candles, lastTrade }: Props) {
  const wrap = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const lastBarRef = useRef<Candle | null>(null);

  useEffect(() => {
    if (!wrap.current) return;
    const chart = createChart(wrap.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0e1116" },
        textColor: "#8b949e",
      },
      grid: {
        vertLines: { color: "#1d242d" },
        horzLines: { color: "#1d242d" },
      },
      timeScale: { timeVisible: true, secondsVisible: false, borderColor: "#2a313a" },
      rightPriceScale: { borderColor: "#2a313a" },
      crosshair: { mode: 1 },
      autoSize: true,
    });
    const series = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderUpColor: "#26a69a",
      borderDownColor: "#ef5350",
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });
    chartRef.current = chart;
    seriesRef.current = series;
    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Backfill on symbol change.
  useEffect(() => {
    if (!seriesRef.current) return;
    const data = candles.map((c) => ({
      time: c.time as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    seriesRef.current.setData(data);
    lastBarRef.current = candles[candles.length - 1] ?? null;
    chartRef.current?.timeScale().fitContent();
  }, [candles, symbol]);

  // Live tick → roll into the current 1m bar (or open a new one).
  useEffect(() => {
    if (!seriesRef.current || !lastTrade) return;
    const tsMs = lastTrade.ts && lastTrade.ts > 1e14 ? Math.floor(lastTrade.ts / 1000) : (lastTrade.ts ?? Date.now());
    const minute = Math.floor(tsMs / 1000 / 60) * 60;
    const last = lastBarRef.current;
    if (last && last.time === minute) {
      last.high = Math.max(last.high, lastTrade.price);
      last.low = Math.min(last.low, lastTrade.price);
      last.close = lastTrade.price;
    } else {
      lastBarRef.current = {
        time: minute,
        open: lastTrade.price,
        high: lastTrade.price,
        low: lastTrade.price,
        close: lastTrade.price,
        volume: lastTrade.size,
      };
    }
    const b = lastBarRef.current!;
    seriesRef.current.update({
      time: b.time as UTCTimestamp,
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
    });
  }, [lastTrade]);

  return (
    <div className="panel" style={{ display: "grid", gridTemplateRows: "auto 1fr" }} data-testid="chart">
      <div className="panel-h">
        <span data-testid="chart-title">{chartTitle(symbol)}</span>
        <span style={{ color: "var(--muted)", fontWeight: 400 }}>1m candles</span>
      </div>
      <div ref={wrap} style={{ minHeight: 360 }} />
    </div>
  );
}

export type Level = [number, number]; // [price, size]

export interface Book {
  symbol: string;
  bids: Level[];
  asks: Level[];
  sequence: number;
  ts: number | null;
}

export interface Trade {
  symbol: string;
  price: number;
  size: number;
  side: string;
  ts: number | null;
}

export interface Metrics {
  symbol: string;
  last: number | null;
  vwap_1m: number | null;
  best_bid: number | null;
  best_ask: number | null;
  spread: number | null;
  change_pct_24h: number | null;
}

export interface Candle {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

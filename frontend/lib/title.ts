/** Friendly chart title per symbol. BTCUSD = "Bitcoin Heartbeat". */
export function chartTitle(symbol: string): string {
  if (symbol === "BTCUSD") return "Bitcoin Heartbeat";
  if (symbol === "ETHUSD") return "Ethereum Live";
  return `${symbol} Live`;
}

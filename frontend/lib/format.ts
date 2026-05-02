export const fmtPrice = (n: number | null | undefined, dp = 2): string =>
  n == null ? "—" : n.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp });

export const fmtPct = (n: number | null | undefined, dp = 2): string =>
  n == null ? "—" : `${n >= 0 ? "+" : ""}${n.toFixed(dp)}%`;

export const fmtSize = (n: number | null | undefined): string =>
  n == null ? "—" : n.toLocaleString(undefined, { maximumFractionDigits: 4 });

export const fmtTime = (ts: number | null | undefined): string => {
  if (!ts) return "—";
  // Delta sends µs; clamp to ms.
  const ms = ts > 1e14 ? Math.floor(ts / 1000) : ts;
  return new Date(ms).toLocaleTimeString();
};

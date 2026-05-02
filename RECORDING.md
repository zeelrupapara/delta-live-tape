# Demo recording

Replace this file with a 30s Loom (or `demo.mp4`) before submitting.

Capture, in order:

1. Backend log: ingestor connecting + "subscribed: ['BTCUSD', 'ETHUSD']".
2. Frontend `/`, default BTCUSD: header shows "live", "Bitcoin Heartbeat"
   chart title, candles backfilled, ladder updating, trades scrolling.
3. Hover the **Spread** label → tooltip "May the spread be tight" appears.
4. Switch to ETHUSD → chart re-loads, title flips, ladder re-seeds.
5. Kill the backend → header dot turns red, "offline".
   Restart → reconnects automatically.

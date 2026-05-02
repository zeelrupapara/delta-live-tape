Built for SWTS — Tick #847

# Delta Live Tape

A small full-stack app that shows live market data from
[Delta Exchange](https://www.delta.exchange/) in the browser as it happens.

- **Backend**: FastAPI + `python-socketio`. The backend opens a WebSocket
  to Delta, keeps the order book, recent trades and a 1-minute VWAP in
  memory, and sends updates to the browser over Socket.IO.
- **Frontend**: Next.js 14 (App Router) + TypeScript + `lightweight-charts`.
  Live 1-minute candles, an order book ladder, a trade tape, and four
  live numbers: last price, % change, bid–ask spread, 1-minute VWAP.

By default the app shows BTCUSD and ETHUSD perpetuals. When BTCUSD is
selected the chart title becomes **"Bitcoin Heartbeat"**. The accent
colour is `#00897B` (SWTS teal).

---

## Layout

```
backend/        FastAPI + Socket.IO
  app/
    delta/     Delta REST + WebSocket client, message parser
    state/     Order book, trade buffer, rolling VWAP
    sockets/   Socket.IO server + send helpers
    api/       REST routes (symbols, candle history)
frontend/      Next.js 14 app router
  app/         Routes
  components/  Chart, OrderBook, TradeTape, Metrics, Header
  lib/         Socket client, formatters, types
tests/         Playwright smoke tests
```

Files are kept short on purpose — one job each.

---

## Setup

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Requires Python 3.10 or newer.

### Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

### Env vars

| Name              | Default                              | Notes                       |
| ----------------- | ------------------------------------ | --------------------------- |
| `DELTA_REST_URL`  | `https://api.india.delta.exchange`   | Delta REST base             |
| `DELTA_WS_URL`    | `wss://socket.india.delta.exchange`  | Delta public WebSocket      |
| `SYMBOLS`         | `BTCUSD,ETHUSD`                      | Comma list of perpetuals    |
| `ALLOWED_ORIGIN`  | `http://localhost:3000`              | CORS for Socket.IO          |

Front-end reads `NEXT_PUBLIC_BACKEND_URL` (default `http://localhost:8000`).

---

## QA

```bash
cd tests
npm install
npx playwright install --with-deps chromium
npx playwright test
```

The smoke tests check that the page loads, the SWTS header shows up, the
"May the spread be tight" tooltip is there, and BTCUSD shows the
"Bitcoin Heartbeat" title.

---

## Trade-offs (honest)

- **VWAP is computed on the backend.** That way every client sees the
  same number; the backend keeps a small amount of extra state.
- **The ladder shows up to 15 levels each side.** Enough to read the
  book at a glance, and keeps the page light.
- **In-memory only.** No database. Restarting the backend means a fresh
  book and an empty tape — fine for an evaluation app.
- **One backend process.** Running more than one would need a shared
  store (Redis or similar). Not done here.
- **Sequence handling.** The backend tracks Delta's `sequence_no` on the
  order book. If a number is skipped the book is dropped and the next
  snapshot fills it back in — we never quietly show a stale book.
- **Reconnect.** The WebSocket retries with growing delays (1s → 30s)
  and a 30-second timeout if no message arrives. After a reconnect it
  re-subscribes from scratch.

A short screen recording goes in `RECORDING.md`.

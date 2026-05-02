Built for SWTS — Tick #847

# Delta Live Tape

A small full-stack app that streams live market data from
[Delta Exchange](https://www.delta.exchange/) and renders it in the browser
in real time.

- **Backend**: FastAPI + `python-socketio`. One ingestor connects to Delta
  over WebSocket, keeps an in-memory L2 book, a trade buffer and a rolling
  VWAP, and fans the feed out to browser clients over Socket.IO.
- **Frontend**: Next.js 14 (App Router) + TypeScript + `lightweight-charts`.
  Live candles (1m), L2 ladder, rolling trade tape, plus four live metrics:
  last price, % change, bid–ask spread, 1-min VWAP.

The instrument selector exposes BTCUSD / ETHUSD perpetuals out of the box.
When BTCUSD is selected the chart title is **"Bitcoin Heartbeat"**.
The accent colour is `#00897B` (SWTS teal).

---

## Layout

```
backend/        FastAPI + socket.io fan-out
  app/
    delta/     Delta REST + WS client, message parser
    state/    Order book, trade buffer, rolling VWAP
    sockets/  socket.io server + publish helpers
    api/      REST routes (products, candle history)
frontend/      Next.js 14 app router
  app/        Routes
  components/ Chart, OrderBook, TradeTape, Metrics, Header
  lib/        Socket client, formatters, types
tests/         Playwright smoke tests
```

Files are kept short on purpose — one responsibility each.

---

## Setup

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

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
| `DELTA_WS_URL`    | `wss://socket.india.delta.exchange`  | Delta public WS             |
| `SYMBOLS`         | `BTCUSD,ETHUSD`                      | CSV of perpetuals           |
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

Smoke tests assert the page loads, the SWTS header is rendered, the
"May the spread be tight" tooltip exists and BTCUSD renders the
"Bitcoin Heartbeat" title.

---

## Trade-offs (honest)

- **VWAP server-side.** Single source of truth for every client; small
  amount of state on the backend in exchange.
- **L2 ladder capped at ±15 levels.** More than enough to read the book
  at a glance; keeps the DOM cheap.
- **In-memory only.** No Postgres, no Redis. A restart means a fresh
  book and an empty tape — that is fine for an evaluation app.
- **One ingestor per process.** Horizontal scaling would need a Redis
  Socket.IO adapter and a shared book store; out of scope here.
- **Sequence handling.** The parser tracks `sequence_no` from Delta's
  L2 stream. On a gap the book is dropped and the next snapshot
  re-seeds it; we never quietly serve a stale book.
- **Reconnect.** Exponential backoff (1s → 30s) plus a 30s heartbeat
  watchdog. Re-subscribes from scratch on reconnect.

A short screen recording goes in `RECORDING.md`.

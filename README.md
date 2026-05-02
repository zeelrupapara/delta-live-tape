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

Needs Python **3.10 or newer**. On macOS the default `python3` is 3.9,
so call the newer interpreter explicitly (`python3.11`, `python3.12`,
`python3.13`, …).

```bash
cd backend
cp .env.example .env             # optional, edit if needed
python3.11 -m venv .venv         # use whichever 3.10+ you have
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

In a second terminal:

```bash
cd frontend
cp .env.example .env.local       # optional, edit if needed
npm install
npm run dev                      # http://localhost:3000 by default
```

If port 3000 is busy Next.js will pick the next free port (3001, 3002…).
In that case set `ALLOWED_ORIGIN` on the backend to match, e.g.:

```bash
ALLOWED_ORIGIN=http://localhost:3001 uvicorn app.main:app --reload --port 8000
```

### Env vars

Backend (`backend/.env.example`):

| Name              | Default                              | Notes                       |
| ----------------- | ------------------------------------ | --------------------------- |
| `DELTA_REST_URL`  | `https://api.india.delta.exchange`   | Delta REST base             |
| `DELTA_WS_URL`    | `wss://socket.india.delta.exchange`  | Delta public WebSocket      |
| `SYMBOLS`         | `BTCUSD,ETHUSD`                      | Comma list of perpetuals    |
| `ALLOWED_ORIGIN`  | `http://localhost:3000`              | Must match the frontend URL |

Frontend (`frontend/.env.example`):

| Name                       | Default                  | Notes                       |
| -------------------------- | ------------------------ | --------------------------- |
| `NEXT_PUBLIC_BACKEND_URL`  | `http://localhost:8000`  | Where the backend is served |

---

## QA

The Playwright tests drive a real browser against the running app, so
**both** the backend and the frontend need to be up first (see Setup
above). Then, in a third terminal:

```bash
cd tests
npm install
npx playwright install --with-deps chromium
npx playwright test
```

If the frontend is on a port other than 3000, point the tests at it:

```bash
FRONTEND_URL=http://localhost:3001 npx playwright test
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

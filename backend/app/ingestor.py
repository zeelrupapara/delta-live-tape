"""Bridges raw Delta WS events into state stores + Socket.IO fan-out."""
import asyncio

from app.delta import parser
from app.delta.ws import DeltaWS
from app.logger import get_logger
from app.sockets.fanout import emit_book, emit_metrics, emit_trade
from app.state.orderbook import BookStore
from app.state.trades import TradeBuffer
from app.state.vwap import RollingVWAP

log = get_logger("ingestor")


class Ingestor:
    def __init__(self, symbols: list[str]) -> None:
        self.symbols = symbols
        self.books = BookStore()
        self.trades = TradeBuffer()
        self.vwap = RollingVWAP()
        self.last_open: dict[str, float] = {}
        self._loop: asyncio.AbstractEventLoop | None = None
        self._ws = DeltaWS(symbols, on_event=self._on_event)
        self._task: asyncio.Task | None = None

    async def start(self) -> None:
        self._loop = asyncio.get_running_loop()
        self._task = asyncio.create_task(self._ws.run(), name="delta-ws")
        log.info("ingestor started for %s", self.symbols)

    async def stop(self) -> None:
        self._ws.stop()
        if self._task:
            self._task.cancel()

    # ---- handlers -------------------------------------------------------

    def _on_event(self, msg: dict) -> None:
        kind = parser.channel_for(msg)
        if kind == "l2_orderbook":
            self._on_book(msg)
        elif kind == "all_trades":
            self._on_trade(msg)
        elif kind == "v2/ticker":
            self._on_ticker(msg)

    def _schedule(self, coro) -> None:
        if self._loop and self._loop.is_running():
            asyncio.run_coroutine_threadsafe(coro, self._loop)

    def _on_book(self, msg: dict) -> None:
        parsed = parser.parse_book(msg)
        book = self.books.apply_snapshot(parsed)
        if not book:
            return
        sym = book.symbol
        self._schedule(emit_book(sym, self.books.snapshot(sym)))
        self._schedule(emit_metrics(sym, self._metrics_for(sym)))

    def _on_trade(self, msg: dict) -> None:
        # Delta sends one or many trades depending on channel shape.
        items = msg.get("trades") if isinstance(msg.get("trades"), list) else [msg]
        for item in items:
            t = parser.parse_trade(item)
            if not t:
                continue
            self.trades.add(t)
            self.vwap.add(t["symbol"], t["price"], t["size"])
            self._schedule(emit_trade(t["symbol"], t))
            self._schedule(emit_metrics(t["symbol"], self._metrics_for(t["symbol"])))

    def _on_ticker(self, msg: dict) -> None:
        t = parser.parse_ticker(msg)
        sym = t.get("symbol")
        if sym and t.get("open") is not None:
            self.last_open[sym] = t["open"]
            self._schedule(emit_metrics(sym, self._metrics_for(sym)))

    # ---- derived metrics ------------------------------------------------

    def _metrics_for(self, symbol: str) -> dict:
        last = self.trades.last_price(symbol)
        book = self.books.get(symbol)
        opn = self.last_open.get(symbol)
        change_pct = ((last - opn) / opn * 100.0) if (last and opn) else None
        return {
            "symbol": symbol,
            "last": last,
            "vwap_1m": self.vwap.value(symbol),
            "best_bid": book.best_bid(),
            "best_ask": book.best_ask(),
            "spread": book.spread(),
            "change_pct_24h": change_pct,
        }

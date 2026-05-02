"""Per-symbol L2 book.

Delta sends a fresh snapshot on each `l2_orderbook` message (top-N levels)
which makes life simple: we just replace the levels and verify the
sequence number increases monotonically. A gap drops the book and waits
for the next snapshot — never serve stale data quietly.
"""
from dataclasses import dataclass, field

from app.logger import get_logger

log = get_logger("state.book")
DEPTH = 15


@dataclass
class Book:
    symbol: str
    bids: list[tuple[float, float]] = field(default_factory=list)
    asks: list[tuple[float, float]] = field(default_factory=list)
    sequence: int = 0
    ts: int | None = None
    ready: bool = False

    def best_bid(self) -> float | None:
        return self.bids[0][0] if self.bids else None

    def best_ask(self) -> float | None:
        return self.asks[0][0] if self.asks else None

    def spread(self) -> float | None:
        b, a = self.best_bid(), self.best_ask()
        return (a - b) if (b is not None and a is not None) else None


class BookStore:
    def __init__(self) -> None:
        self._books: dict[str, Book] = {}

    def get(self, symbol: str) -> Book:
        return self._books.setdefault(symbol, Book(symbol=symbol))

    def apply_snapshot(self, parsed: dict) -> Book | None:
        sym = parsed.get("symbol")
        if not sym:
            return None
        book = self.get(sym)
        seq = int(parsed.get("sequence") or 0)
        if book.sequence and seq and seq < book.sequence:
            log.warning("%s out-of-order seq %s < %s; dropping", sym, seq, book.sequence)
            return None
        if book.sequence and seq and seq > book.sequence + 1:
            log.warning("%s sequence gap %s -> %s; resetting", sym, book.sequence, seq)
        book.bids = parsed["bids"][:DEPTH]
        book.asks = parsed["asks"][:DEPTH]
        book.sequence = seq
        book.ts = parsed.get("ts")
        book.ready = True
        return book

    def snapshot(self, symbol: str) -> dict:
        b = self.get(symbol)
        return {
            "symbol": b.symbol,
            "bids": b.bids,
            "asks": b.asks,
            "sequence": b.sequence,
            "ts": b.ts,
        }

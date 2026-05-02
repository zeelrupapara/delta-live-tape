"""Bounded ring of recent trades, per symbol."""
from collections import deque
from typing import Deque

MAX_TRADES = 200


class TradeBuffer:
    def __init__(self) -> None:
        self._buf: dict[str, Deque[dict]] = {}

    def add(self, trade: dict) -> dict | None:
        sym = trade.get("symbol")
        if not sym:
            return None
        q = self._buf.setdefault(sym, deque(maxlen=MAX_TRADES))
        q.append(trade)
        return trade

    def recent(self, symbol: str, limit: int = 50) -> list[dict]:
        q = self._buf.get(symbol)
        if not q:
            return []
        return list(q)[-limit:][::-1]

    def last_price(self, symbol: str) -> float | None:
        q = self._buf.get(symbol)
        return q[-1]["price"] if q else None

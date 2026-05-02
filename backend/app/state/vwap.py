"""Rolling 1-minute VWAP, per symbol.

Drops trades older than the window on every update so the value is
always honest about its lookback.
"""
import time
from collections import deque
from typing import Deque

WINDOW_SECONDS = 60


def _now() -> float:
    return time.time()


class RollingVWAP:
    def __init__(self, window: int = WINDOW_SECONDS) -> None:
        self.window = window
        self._buf: dict[str, Deque[tuple[float, float, float]]] = {}

    def add(self, symbol: str, price: float, size: float, ts: float | None = None) -> float | None:
        if size <= 0:
            return self.value(symbol)
        q = self._buf.setdefault(symbol, deque())
        q.append((ts or _now(), price, size))
        self._evict(symbol)
        return self.value(symbol)

    def _evict(self, symbol: str) -> None:
        cutoff = _now() - self.window
        q = self._buf.get(symbol)
        if not q:
            return
        while q and q[0][0] < cutoff:
            q.popleft()

    def value(self, symbol: str) -> float | None:
        self._evict(symbol)
        q = self._buf.get(symbol)
        if not q:
            return None
        notional = sum(p * s for _, p, s in q)
        volume = sum(s for _, _, s in q)
        return notional / volume if volume else None

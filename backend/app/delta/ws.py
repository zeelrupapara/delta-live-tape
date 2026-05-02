"""Connects to Delta's public WebSocket and yields parsed messages.

Reconnects with exponential backoff and a heartbeat watchdog.
"""
import asyncio
import json
import time
from typing import AsyncIterator, Callable

import websockets

from app.config import settings
from app.logger import get_logger

log = get_logger("delta.ws")

CHANNELS = ("v2/ticker", "l2_orderbook", "all_trades")
HEARTBEAT_TIMEOUT = 30.0
MAX_BACKOFF = 30.0


def _subscribe_payload(symbols: list[str]) -> dict:
    return {
        "type": "subscribe",
        "payload": {
            "channels": [{"name": c, "symbols": list(symbols)} for c in CHANNELS],
        },
    }


class DeltaWS:
    def __init__(self, symbols: list[str], on_event: Callable[[dict], None]):
        self.symbols = symbols
        self.on_event = on_event
        self._stop = asyncio.Event()
        self._last_msg_at = time.monotonic()

    def stop(self) -> None:
        self._stop.set()

    async def run(self) -> None:
        backoff = 1.0
        while not self._stop.is_set():
            try:
                await self._run_once()
                backoff = 1.0
            except Exception as e:  # noqa: BLE001
                log.warning("ws disconnected: %s; retry in %.1fs", e, backoff)
                await asyncio.sleep(backoff)
                backoff = min(backoff * 2, MAX_BACKOFF)

    async def _run_once(self) -> None:
        async with websockets.connect(
            settings.delta_ws_url,
            ping_interval=20,
            ping_timeout=10,
            close_timeout=5,
        ) as ws:
            await ws.send(json.dumps(_subscribe_payload(self.symbols)))
            log.info("subscribed: %s", self.symbols)
            self._last_msg_at = time.monotonic()
            watchdog = asyncio.create_task(self._watchdog(ws))
            try:
                async for raw in ws:
                    self._last_msg_at = time.monotonic()
                    self._handle_raw(raw)
            finally:
                watchdog.cancel()

    async def _watchdog(self, ws) -> None:
        while True:
            await asyncio.sleep(5)
            if time.monotonic() - self._last_msg_at > HEARTBEAT_TIMEOUT:
                log.warning("heartbeat timeout; closing socket")
                await ws.close()
                return

    def _handle_raw(self, raw: str | bytes) -> None:
        try:
            msg = json.loads(raw)
        except (TypeError, ValueError):
            return
        if isinstance(msg, dict):
            self.on_event(msg)

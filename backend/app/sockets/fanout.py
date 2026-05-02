"""Tiny helpers so callers don't reach into the socket.io server directly."""
from app.sockets.server import sio


async def emit_book(symbol: str, payload: dict) -> None:
    await sio.emit("book", payload, room=symbol)


async def emit_trade(symbol: str, payload: dict) -> None:
    await sio.emit("trade", payload, room=symbol)


async def emit_metrics(symbol: str, payload: dict) -> None:
    await sio.emit("metrics", payload, room=symbol)

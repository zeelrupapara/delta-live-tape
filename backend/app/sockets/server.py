"""Socket.IO server. One room per symbol; clients join the rooms they want."""
import socketio

from app.config import settings
from app.logger import get_logger

log = get_logger("sockets")

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=[settings.allowed_origin],
    ping_interval=20,
    ping_timeout=20,
)


@sio.event
async def connect(sid: str, _environ, _auth) -> None:
    log.info("client connected sid=%s", sid)


@sio.event
async def disconnect(sid: str) -> None:
    log.info("client disconnected sid=%s", sid)


@sio.event
async def subscribe(sid: str, data: dict) -> dict:
    sym = (data or {}).get("symbol", "").upper()
    if sym not in settings.symbol_list:
        return {"ok": False, "error": "unknown symbol"}
    await sio.enter_room(sid, sym)
    log.info("sid=%s joined %s", sid, sym)
    return {"ok": True, "symbol": sym}


@sio.event
async def unsubscribe(sid: str, data: dict) -> dict:
    sym = (data or {}).get("symbol", "").upper()
    await sio.leave_room(sid, sym)
    return {"ok": True, "symbol": sym}

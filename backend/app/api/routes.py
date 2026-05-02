from fastapi import APIRouter, HTTPException

from app.config import settings
from app.delta.rest import DeltaRest

router = APIRouter()
_rest = DeltaRest()


@router.get("/symbols")
async def list_symbols() -> dict:
    return {"symbols": settings.symbol_list}


@router.get("/candles/{symbol}")
async def candles(symbol: str, resolution: str = "1m") -> dict:
    sym = symbol.upper()
    if sym not in settings.symbol_list:
        raise HTTPException(404, "unknown symbol")
    rows = await _rest.candles(sym, resolution=resolution)
    return {"symbol": sym, "resolution": resolution, "candles": rows}


@router.get("/health")
async def health() -> dict:
    return {"ok": True}

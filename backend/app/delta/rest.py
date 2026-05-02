import time
import httpx

from app.config import settings
from app.logger import get_logger

log = get_logger("delta.rest")


class DeltaRest:
    """Thin wrapper for the Delta public REST endpoints we care about."""

    def __init__(self, base: str | None = None) -> None:
        self.base = base or settings.delta_rest_url
        self._client = httpx.AsyncClient(base_url=self.base, timeout=10.0)

    async def close(self) -> None:
        await self._client.aclose()

    async def products(self) -> list[dict]:
        r = await self._client.get("/v2/products")
        r.raise_for_status()
        return r.json().get("result", [])

    async def candles(self, symbol: str, resolution: str = "1m",
                      lookback_seconds: int = 60 * 60) -> list[dict]:
        end = int(time.time())
        start = end - lookback_seconds
        params = {
            "symbol": symbol,
            "resolution": resolution,
            "start": start,
            "end": end,
        }
        r = await self._client.get("/v2/history/candles", params=params)
        r.raise_for_status()
        return r.json().get("result", [])

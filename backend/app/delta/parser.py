"""Pure helpers that turn raw Delta WS payloads into our internal dicts.

Kept pure (no I/O, no state) so they are trivial to unit-test.
"""
from typing import Any


def parse_levels(raw: list[dict] | None) -> list[tuple[float, float]]:
    """Delta returns levels as [{"price": "...", "size": ...}, ...]."""
    if not raw:
        return []
    out: list[tuple[float, float]] = []
    for lvl in raw:
        try:
            out.append((float(lvl["price"]), float(lvl["size"])))
        except (KeyError, TypeError, ValueError):
            continue
    return out


def parse_book(msg: dict) -> dict:
    return {
        "symbol": msg.get("symbol"),
        "sequence": msg.get("sequence_no") or msg.get("sequence"),
        "bids": parse_levels(msg.get("buy")),
        "asks": parse_levels(msg.get("sell")),
        "ts": msg.get("timestamp"),
    }


def parse_trade(msg: dict) -> dict | None:
    try:
        return {
            "symbol": msg.get("symbol"),
            "price": float(msg["price"]),
            "size": float(msg.get("size", 0)),
            "side": msg.get("buyer_role") or msg.get("side") or "",
            "ts": msg.get("timestamp") or msg.get("created_at"),
        }
    except (KeyError, TypeError, ValueError):
        return None


def parse_ticker(msg: dict) -> dict:
    def _f(k: str) -> float | None:
        v = msg.get(k)
        try:
            return float(v) if v is not None else None
        except (TypeError, ValueError):
            return None

    return {
        "symbol": msg.get("symbol"),
        "mark_price": _f("mark_price"),
        "spot_price": _f("spot_price"),
        "close": _f("close"),
        "open": _f("open"),
        "ts": msg.get("timestamp"),
    }


def is_book_snapshot(msg: dict) -> bool:
    """Delta's L2 channel sends snapshots; incrementals are on l2_updates."""
    return msg.get("type") == "l2_orderbook"


def channel_for(msg: dict) -> str | None:
    return msg.get("type")


def coerce(msg: Any) -> dict | None:
    """Defensive: only return real dicts, ignore everything else."""
    return msg if isinstance(msg, dict) else None

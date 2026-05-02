"""ASGI entrypoint: FastAPI for REST + Socket.IO mounted at /socket.io."""
from contextlib import asynccontextmanager

import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.config import settings
from app.ingestor import Ingestor
from app.logger import get_logger
from app.sockets.server import sio

log = get_logger("main")
ingestor = Ingestor(settings.symbol_list)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await ingestor.start()
    try:
        yield
    finally:
        await ingestor.stop()


fastapi_app = FastAPI(title="Delta Live Tape", lifespan=lifespan)
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.allowed_origin],
    allow_methods=["GET"],
    allow_headers=["*"],
)
fastapi_app.include_router(api_router, prefix="/api")

# Wrap with Socket.IO so it shares the same ASGI app.
app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)

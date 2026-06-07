"""Agent Arena — Competitive Intelligence Backend."""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import router
from scheduler import start_scheduler, stop_scheduler

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    from store import signals_store
    from seed import load_store_from_seed

    if not signals_store:
        loaded = load_store_from_seed()
        logger.info("Loaded %s seed signals into store on startup", loaded)

    start_scheduler()
    logger.info("Agent Arena backend started")
    yield
    stop_scheduler()
    logger.info("Agent Arena backend stopped")


app = FastAPI(
    title="Agent Arena API",
    description="AI-powered competitive intelligence backend for HackBaroda 2026",
    version="0.1.0",
    lifespan=lifespan,
)

origins = [
    o.strip()
    for o in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000",
    ).split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

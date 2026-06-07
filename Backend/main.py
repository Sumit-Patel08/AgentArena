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
    from competitors import using_demo_data
    from store import signals_store
    from seed import load_store_from_seed

    if not signals_store and using_demo_data():
        loaded = load_store_from_seed()
        logger.info("Demo mode: loaded %s seed signals", loaded)
    elif not signals_store:
        from workspace_store import load_workspace
        ws = load_workspace()
        if ws.get("configured"):
            logger.info("Workspace configured — populating realistic industry signals...")
            from seed import seed_workspace_competitors
            import asyncio
            asyncio.create_task(seed_workspace_competitors(ws))
        else:
            logger.info("Workspace configured but inactive (no competitors)")

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

LOCAL_DEV_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
]
env_origins = [
    o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()
]
origins = list(dict.fromkeys(env_origins + LOCAL_DEV_ORIGINS))

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

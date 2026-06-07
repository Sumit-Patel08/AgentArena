"""Persistent workspace — company profile + dynamic competitors."""

from __future__ import annotations

import json
import re
import threading
from pathlib import Path
from typing import Any

DATA_DIR = Path(__file__).parent / "data"
WORKSPACE_FILE = DATA_DIR / "workspace.json"

_lock = threading.Lock()

DEFAULT_WORKSPACE: dict[str, Any] = {
    "configured": False,
    "company_name": "",
    "website": "",
    "domain": "",
    "email": "",
    "competitors": [],
}


def _ensure_data_dir() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def slugify(name: str) -> str:
    s = name.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")[:48] or "competitor"


def load_workspace() -> dict[str, Any]:
    _ensure_data_dir()
    with _lock:
        if not WORKSPACE_FILE.exists():
            return dict(DEFAULT_WORKSPACE)
        try:
            return json.loads(WORKSPACE_FILE.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return dict(DEFAULT_WORKSPACE)


def save_workspace(data: dict[str, Any]) -> dict[str, Any]:
    _ensure_data_dir()
    with _lock:
        WORKSPACE_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")
        return data


def get_tracked_competitors() -> list[dict[str, Any]]:
    ws = load_workspace()
    if ws.get("configured") and ws.get("competitors"):
        return list(ws["competitors"])
    return []


def is_configured() -> bool:
    ws = load_workspace()
    return bool(ws.get("configured") and ws.get("competitors"))


def set_workspace(
    company_name: str,
    website: str,
    domain: str,
    email: str,
    competitors: list[dict[str, Any]],
) -> dict[str, Any]:
    data = {
        "configured": True,
        "company_name": company_name,
        "website": website,
        "domain": domain,
        "email": email,
        "competitors": competitors,
    }
    return save_workspace(data)


def reset_workspace() -> dict[str, Any]:
    return save_workspace(dict(DEFAULT_WORKSPACE))

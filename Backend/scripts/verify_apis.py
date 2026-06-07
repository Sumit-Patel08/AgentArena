"""Verify .env credentials without printing secrets."""

from __future__ import annotations

import os
import sys
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
load_dotenv(ROOT / ".env")

REQUIRED = [
    "HINDSIGHT_API_KEY",
    "HINDSIGHT_COLLECTION_ID",
    "HINDSIGHT_BASE_URL",
    "GROQ_API_KEY",
]
OPTIONAL = ["GITHUB_TOKEN", "ALLOWED_ORIGINS"]


def _masked(value: str) -> str:
    if not value or value.startswith("your_") or "paste" in value.lower():
        return "MISSING"
    return f"set ({len(value)} chars)"


def check_env() -> bool:
    ok = True
    print("=== Environment variables ===")
    for key in REQUIRED:
        val = os.getenv(key, "")
        status = _masked(val)
        print(f"  {key}: {status}")
        if status == "MISSING":
            ok = False
    for key in OPTIONAL:
        val = os.getenv(key, "")
        print(f"  {key}: {_masked(val) if val else 'not set (optional)'}")
    return ok


async def _check_hindsight_async() -> bool:
    from memory import recall_async, write_memory_async

    wrote = await write_memory_async(
        "Agent Arena verification: Supabase vector search GA release.",
        {
            "namespace": "events",
            "competitor": "supabase",
            "signal_type": "feature_release",
            "threat_score": 8,
            "source": "github",
            "source_url": "https://github.com/supabase/supabase/releases/tag/verify",
            "date": "2026-06-07T12:00:00Z",
        },
    )
    if not wrote:
        print("  write_memory: FAILED")
        return False
    print("  write_memory: OK")

    results = await recall_async("Supabase vector search", k=3)
    print(f"  recall: OK ({len(results)} results)")
    if results:
        print(f"  sample: {results[0].get('text', '')[:80]}...")
    return True


def check_hindsight() -> bool:
    print("\n=== Hindsight write + recall ===")
    try:
        import asyncio

        return asyncio.run(_check_hindsight_async())
    except Exception as exc:
        print(f"  Hindsight: FAILED — {exc}")
        return False


def check_groq() -> bool:
    print("\n=== Groq classifier ===")
    try:
        from classifier import classify_signal

        result = classify_signal(
            "supabase",
            "Supabase launched native vector search (pgvector) in general availability.",
            "https://github.com/supabase/supabase/releases",
        )
        required = {"signal_type", "threat_score", "summary", "tags"}
        if not required.issubset(result.keys()):
            print(f"  classifier: FAILED — missing keys in {result}")
            return False
        print(f"  classifier: OK — type={result['signal_type']}, score={result['threat_score']}")
        print(f"  summary: {result['summary'][:80]}")
        return True
    except NotImplementedError:
        print("  classifier: not implemented yet")
        return False
    except Exception as exc:
        print(f"  classifier: FAILED — {exc}")
        return False


def main() -> None:
    env_ok = check_env()
    if not env_ok:
        print("\nFix missing env vars in Backend/.env")
        sys.exit(1)

    hindsight_ok = check_hindsight()
    groq_ok = check_groq()

    print("\n=== Summary ===")
    print(f"  Env:       {'OK' if env_ok else 'FAIL'}")
    print(f"  Hindsight: {'OK' if hindsight_ok else 'FAIL'}")
    print(f"  Groq:      {'OK' if groq_ok else 'FAIL'}")

    if env_ok and hindsight_ok and groq_ok:
        print("\nAll checks passed.")
        sys.exit(0)
    sys.exit(1)


if __name__ == "__main__":
    main()

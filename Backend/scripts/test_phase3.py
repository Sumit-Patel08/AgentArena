"""Phase 3 gate tests — chat, recommendations, digest."""

from __future__ import annotations

import json
import sys

import httpx

BASE = "http://127.0.0.1:8000/api"
DEMO_QUESTION = "What is Supabase's most consistent strategic move over the last month?"


def main() -> None:
    client = httpx.Client(timeout=120.0)
    results: dict[str, str] = {}

    print("=== Phase 3 Gate Tests ===\n")

    # Health
    h = client.get(f"{BASE}/health")
    results["health"] = "OK" if h.status_code == 200 else f"FAIL {h.status_code}"
    print(f"health: {results['health']}")

    # Chat with memory ON
    r_on = client.post(f"{BASE}/chat", json={"question": DEMO_QUESTION, "use_memory": True})
    on_data = r_on.json() if r_on.status_code == 200 else {}
    results["chat_memory_on"] = "OK" if r_on.status_code == 200 and on_data.get("memories_used", 0) > 0 else "FAIL"
    print(f"chat (memory ON): {results['chat_memory_on']} — memories={on_data.get('memories_used', 0)}")
    print(f"  preview: {on_data.get('answer', '')[:200]}...\n")

    # Chat with memory OFF
    r_off = client.post(f"{BASE}/chat", json={"question": DEMO_QUESTION, "use_memory": False})
    off_data = r_off.json() if r_off.status_code == 200 else {}
    results["chat_memory_off"] = "OK" if r_off.status_code == 200 and off_data.get("memories_used") == 0 else "FAIL"
    print(f"chat (memory OFF): {results['chat_memory_off']}")
    print(f"  preview: {off_data.get('answer', '')[:200]}...\n")

    # Recommendations
    r_rec = client.get(f"{BASE}/recommendations")
    recs = r_rec.json() if r_rec.status_code == 200 else []
    results["recommendations"] = "OK" if r_rec.status_code == 200 and len(recs) >= 3 else f"FAIL ({len(recs)} items)"
    print(f"recommendations: {results['recommendations']}")
    if recs:
        print(f"  first: [{recs[0].get('priority')}] {recs[0].get('title', '')[:80]}\n")

    # Digest
    r_digest = client.post(f"{BASE}/digest")
    digest = r_digest.json() if r_digest.status_code == 200 else {}
    results["digest"] = "OK" if r_digest.status_code == 200 and digest.get("emerging_pattern") else "FAIL"
    print(f"digest: {results['digest']}")
    print(f"  pattern: {digest.get('emerging_pattern', '')[:120]}\n")

    # Competitor pattern insight
    r_comp = client.get(f"{BASE}/competitors/supabase")
    comp = r_comp.json() if r_comp.status_code == 200 else {}
    insight = comp.get("pattern_insight", "")
    results["pattern_insight"] = "OK" if r_comp.status_code == 200 and len(insight) > 30 else "FAIL"
    print(f"pattern_insight: {results['pattern_insight']}")
    print(f"  insight: {insight[:150]}...\n")

    failed = [k for k, v in results.items() if v.startswith("FAIL") or v == "FAIL"]
    print("=== Summary ===")
    print(json.dumps(results, indent=2))
    if failed:
        print(f"\nFAILED: {failed}")
        sys.exit(1)
    print("\nAll Phase 3 gate checks passed.")
    sys.exit(0)


if __name__ == "__main__":
    main()

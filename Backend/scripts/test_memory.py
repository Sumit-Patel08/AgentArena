"""Manual Phase 1 gate test — verify Hindsight write + recall."""

from dotenv import load_dotenv

load_dotenv()

from memory import recall, write_memory


def main() -> None:
    ok = write_memory(
        "Agent Arena test signal: Supabase shipped vector search in GA.",
        {
            "namespace": "events",
            "competitor": "supabase",
            "signal_type": "feature_release",
            "threat_score": 8,
            "source": "github",
            "source_url": "https://github.com/supabase/supabase/releases",
            "date": "2026-06-07T00:00:00Z",
        },
    )
    print(f"write_memory: {'OK' if ok else 'FAILED'}")

    results = recall("Supabase vector search", k=3)
    print(f"recall: {len(results)} results")
    for r in results:
        print(f"  - {r.get('text', '')[:80]}...")


if __name__ == "__main__":
    main()

"""Seed 6 weeks of backdated history into Hindsight. Phase 2."""

from __future__ import annotations


def run_seed() -> int:
    """Write historical signals to Hindsight. Returns count written. Phase 2."""
    raise NotImplementedError("seed.run_seed — implement in Phase 2")


if __name__ == "__main__":
    count = run_seed()
    print(f"Seeded {count} memories")

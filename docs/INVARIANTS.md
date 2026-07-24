# Invariants

Machine-checkable rules. Every commit to the text must hold these. Each invariant should eventually have a script in `scripts/` (see TOOLING.md) that verifies it; CI-able.

## I1 — One-to-one lemma mapping

For every source lemma L with a decided rendering R in DICT: every occurrence of L in the corpus renders as a conjugation of R (or a documented sense-split entry). No occurrence of L renders as anything else.

**Check:** join corpus occurrences (by Strong's/lemma ID) against DICT; flag mismatches.

## I2 — No English collisions

No two distinct source lemmas share the same English rendering, unless DICT explicitly records the collision as intentional (with rationale).

**Check:** invert the DICT mapping; flag duplicate English targets.

## I3 — Transliteration determinism

Every transliterated token is exactly what the Hebrew/Greek mapping tables produce from the source spelling. No hand-adjusted transliterals.

**Check:** re-run the mapping over source text; diff against corpus tokens.

## I4 — Structural integrity

- Every verse present exactly once; book/chapter/verse coordinates continuous and matching the canonical versification chosen (document the versification scheme once, in DICT or here).
- Record format valid (CSV column count / JSON schema) for every record.
- No empty verses without an explicit marker.

**Check:** schema + coordinate validator against `json/books.json`.

## I5 — Quotation coherence

Where the NT quotes the OT (per xref table), shared lemmas render consistently across both sides of the quotation, or the divergence (Hebrew vs. LXX source) is annotated.

**Check:** walk `xref.csv`; compare renderings on linked verse pairs.

## I6 — Decision provenance

Every change to a rendering in DICT is a commit whose message (or linked doc) states: lemma, old rendering, new rendering, rationale, occurrence count affected. No silent DICT edits.

**Check:** commit-lint on diffs touching DICT.

## I7 — Base-text traceability

Every verse diffable back to its YLT source (`json/ylt.json`). Deviations from YLT are the translation work; they must be reachable by diff, never by regeneration that erases history.

## I8 — Canonical data purity

Canonical files contain text + coordinates + lemma tags only. No presentation markup, no commentary inline. Commentary/apparatus live in parallel files keyed by coordinate.

# Invariants

Machine-checkable rules. Every commit to the text must hold these. Each invariant should eventually have a script in `scripts/` (see TOOLING.md) that verifies it; CI-able.

## I1 — Source-side mapping

For every source term S with decided terms R₁…Rₙ in DICT (primary `rendering` + `senses[]` alternates): every occurrence of S renders as a conjugation of the term expected there — its `assign.json` assignment, else the default (the lemma's first bound term, else the primary). No occurrence of S renders as anything else. Supplied `[..]` text never satisfies a lemma.

**Check:** `check-assign` (every assignment names a real entry, verse, occurrence count and allowed term) + `check-mapping` (each verse contains every term expected at its occurrences). Not yet checked: absence of a wrong term alongside the right one.

## I2 — English-term ownership (absolute)

Every English term claimed in DICT — primary rendering, listed `forms`, every sense rendering and its `forms`; compared by spelling, case-insensitively — is owned by exactly one entry. There is no intentional-collision exception: genuine Hebrew↔Greek correspondence is expressed by pairing the lemmas in one entry (P1), not by two entries sharing English. Within an entry, each term is bound to at most one lemma per language (lemmas of a language that has several declare their `terms`). Supplied `[..]` words are outside DICT and outside I2.

**Check:** `dict-lint` / `check-collisions` — invert every entry's owned terms; any term with two owners is an error.

## I3 — Transliteration determinism

Every transliterated token is exactly what the Hebrew/Greek mapping tables produce from the source spelling. No hand-adjusted transliterals.

**Check:** re-run the mapping over source text; diff against corpus tokens.

## I4 — Structural integrity

- Every verse present exactly once; book/chapter/verse coordinates continuous and matching the canonical versification chosen (document the versification scheme once, in DICT or here).
- Record format valid (CSV column count / JSON schema) for every record.
- No empty verses without an explicit marker (`[]`).
- Supplied-word markers `[..]` pair and do not nest.

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

Canonical files contain text + coordinates + lemma tags only. No presentation markup, no commentary inline. The supplied-word marker `[..]` is data (it records that a word has no source lexeme), not presentation. Commentary/apparatus live in parallel files keyed by coordinate.

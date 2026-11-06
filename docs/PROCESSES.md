# Processes

Operational procedures. Expands the four-step loop in PROCESS.md into repeatable, auditable workflows. Each process names the invariants (INVARIANTS.md) it must leave intact.

## PR1 — Word normalization (the core loop)

The engine of the whole project.

1. **Choose candidate lemma.** Pick from DICT backlog, collision reports (I2), or reader friction. Record lemma, Strong's number, transliteral.
2. **Glean.** Enumerate every occurrence in the corpus (script: `glean`). Collect: verse coordinates, current renderings, grammatical forms, co-occurring lemmas, xref links.
3. **Sense analysis.** Decide: single sense or split? If split, enumerate senses with defining occurrences. AI-assisted; human-decided.
4. **Choose English rendering.** Criteria, in order: precision (P3), non-collision (I2), conjugatability, canonical echo preservation (P2). Consider transliteration instead (P4) if the word is loanable.
5. **Record in DICT** with rationale (I6). Status: `decided`.
6. **Impute.** Apply the rendering to every occurrence, conjugated per context (script + AI skill: `impute`). Status: `applied`.
7. **Verify.** Run invariant checks I1–I5. Human spot-reads a sample of changed verses.
8. **Commit.** One lemma per commit, message per I6.

## PR2 — Transliteration

1. Source spelling → mapping table (Hebrew: revised Michigan/Claremont; Greek: README table) → transliteral. Fully mechanical; no judgment calls (I3).
2. If a mapping table changes, regenerate all affected transliterals in one commit and document the mapping change.

## PR3 — Alternate-term adjudication

When one source term resists a single English term (P1 permits several, each owned by it alone):
1. Cluster occurrences by usage context (AI-assisted).
2. Draft alternates as `senses[]`: definition, defining verses, proposed English term. Every proposed term must be unowned in DICT (I2) — check against the terms other lemmas naturally claim, not just current entries.
3. Adversarial pass: attempt to collapse back to the primary rendering. An alternate survives only if collapse demonstrably loses meaning. Note where the choice between terms is itself interpretive (e.g. *earth*/*land* in the flood narrative) — the alternate then imports interpretation at those verses.
4. Before `decided`: the selection must be exhaustive and mechanical — a morphological condition or an explicit verse list per alternate; the primary covers everything else.
5. Record in DICT with the adjudication note.

## PR4 — Collision resolution

When I2 flags an English term with two owners:
1. Determine which source term has the stronger claim (frequency, precision of fit).
2. Re-run PR1 for the losing term.
3. If the two lemmas are genuine cross-language correspondents (Hebrew + Greek, P2), merge them into one entry. There are no intentional collisions.

## PR5 — Xref / quotation audit

1. Walk `xref.csv` pairs.
2. For each pair, compare renderings of shared lemmas (I5).
3. Divergences: annotate Hebrew-vs-LXX source difference, or queue the lemma for PR1.

## PR6 — Book pass

Whole-book review after enough PR1 cycles touch it:
1. Read-through for word-order fidelity (P5) and English tolerability.
2. Log friction points as PR1 candidates; do not hand-fix inline (violates I1).
3. Tag the book with a pass number.

## PR7 — Release

1. All invariant checks green.
2. Regenerate output artifacts (CSV/JSON/graph) from canonical data.
3. Tag; changelog auto-derived from DICT commits since last tag.

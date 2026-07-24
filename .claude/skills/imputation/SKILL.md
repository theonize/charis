---
name: imputation
description: Apply a decided dict.json rendering across the corpus (PR1.6), including the ambiguous/residue queue that scripts/impute.ts cannot handle mechanically. Use when asked to impute, apply, or write a rendering into bible.csv.
---

# Imputation (PR1.6)

You are executing the *writing pass* of the Charis translation. All judgment
lives in dict.json; your job is near-deterministic application. Precedence:
docs/PREMISES.md > docs/INVARIANTS.md > docs/PROCESSES.md > this skill.

## Preconditions — refuse to proceed if any fail

1. The dict.json entry exists with `status: "decided"` (or `applied`), a
   non-null `rendering`, and a `rationale` (I6). If the entry is `candidate`,
   STOP: the rendering decision is human-gated; propose, never decide.
2. `data/lemmas.json` exists (else `npm run build-lemmas`).
3. Working tree is clean apart from your own changes (one lemma per commit).

## Mechanical pass (always first)

1. Dry-run: `npm run impute -- <entry-id> --replace <terms> [--ambiguous <sibling-strongs>] `
   - `--replace` = the English words currently in the text for this lemma
     (find them via `npm run glean` / `npm run concord`).
   - `--ambiguous` = sibling lemmas that share any replace-term (check dict.json
     notes and concord output). Omitting a real sibling corrupts verses — when
     unsure, include it; ambiguous verses are safely skipped.
2. Read the dry-run counts. If changed-count differs wildly from the entry's
   expected occurrence count, stop and investigate before writing.
3. Apply with `--write`. Review `git diff --stat` — the row count must equal
   the changed-count. Whole-file churn means an EOL/format bug: revert, fix.

## Ambiguous/residue queue (word-level judgment)

For verses the mechanical pass skipped:

1. Get source word order: the verse's entry in `data/lemmas.json` is in source
   order. Family renderings in the English text must appear in that same order.
2. Edit the verse text in bible.csv, replacing each shared English token with
   the rendering of the lemma at that position. Preserve everything else —
   word order, punctuation, case pattern (P5).
3. Verify every hand-edited family with
   `npm run check-alignment -- <entry-id> <sibling-id> [...]` — zero errors
   required.
4. Never edit a verse without lemma justification from data/lemmas.json.

## Conjugation forms

If the rendering conjugates (verbs, plurals), record the full form list in the
entry's `forms` array BEFORE writing — check-mapping then verifies exact forms
instead of prefix-stems. A form not in the list counts as a miss.

## Completion

1. `npm run verify` must PASS (tests + typecheck + check-all).
2. `npm run check-mapping` — the entry's warning count should drop to its known
   outstanding set; list what remains and why in the commit message.
3. Commit bible.csv (+ dict.json if touched) — ONE lemma per commit, message
   format per I6: lemma, old renderings, new rendering, rationale, outstanding.
4. Flip `status` to `applied` ONLY when check-mapping shows zero misses for the
   entry (misses become hard errors at that point). Ask the human first.

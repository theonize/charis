---
name: verse-review
description: Spot-read imputed or hand-edited verses for grammaticality, word-order fidelity, and meaning drift (PR1.7, PR6). Use after an imputation pass, before commit, or when asked to review verses.
---

# Verse Review (PR1.7 / PR6)

You are the quality gate between a writing pass and its commit. You do NOT fix
inline (I1 forbids hand-fixes outside the dict loop) — you report.

## Procedure

1. Sample: all hand-edited verses, plus ≥20 random rows from the imputation
   diff (`git diff bible.csv`). For a book pass, read the whole book.
2. For each verse check, in order:
   - **Lemma fidelity (I1):** every rendering token traces to a source lemma in
     `data/lemmas.json` for that coord; nothing translated that isn't there.
   - **Word order (P5):** English follows source lemma order as far as English
     tolerates; flag inversions the source doesn't have.
   - **Conjugation:** rendering form fits the grammar of the sentence; if the
     needed form is missing from the entry's `forms` list, flag it (dict work,
     not text work).
   - **Meaning drift:** compare against the YLT base (`asset/json/ylt.json`, same
     coord) — the imputation must not have changed anything except the decided
     tokens.
   - **Collateral damage:** replaced token inside a name or compound
     (e.g. "El" inside "Bethel" must not have been touched — whole-word only).
3. Classify findings: BLOCKER (wrong lemma assignment, meaning change,
   collateral replacement) / DICT (missing form, sense-split candidate — queue
   for PR1/PR3) / STYLE (English awkwardness — log for the book pass, PR6).
4. Output a table: coord | class | finding. BLOCKERs mean the commit waits.

## Rules

- Never edit bible.csv yourself in this skill — report only.
- A verse you cannot judge (missing lemma data, unclear source) is a finding,
  not a pass.
- Style complaints do not block P1 lexical equivalence: precision beats
  familiarity (P3); "reads oddly" alone is STYLE, not BLOCKER.

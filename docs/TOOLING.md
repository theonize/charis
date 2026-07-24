# Tooling

Scripts and AI skills needed to run the processes (PROCESSES.md) and enforce the invariants (INVARIANTS.md). Status: mostly not built yet; this is the build list. Existing code: `parse.js`, `json/*.js` (buildCharis, updateCharis, parseBible, referenceCoords).

## Scripts (deterministic, Node/TS)

Status 2026-07-24: core built via TDD — `src/` library modules (coords, corpus, dict, glean, checkStructure, xref, stats; 41 tests, vitest + strict tsc) with thin CLI wrappers in `scripts/`. Run via npm: `npm run check-all`, `npm run glean -- <term> [--prefix]`, `npm run concord -- <word>`, `npm run dict-lint`, `npm run stats`, `npm test`. Old `scripts/dict-lint.js` pruned (superseded by `src/dict.ts` + `scripts/dict-lint.ts`). **Data unblocked 2026-07-24:** source corpora vendored locally (no API dependence) — `data/sources/oshb/` (OSHB/WLC OSIS XML, Strong's-tagged Hebrew, CC BY 4.0) and `data/sources/morphgnt/` (MorphGNT SBLGNT, lemma-tagged Greek; NOTE: Greek lemma strings, no Strong's — grk I1 keys on lemma text); provenance/SHAs in `data/sources/SOURCES.md`. Transliteration tables encoded as `data/translit-heb.json` / `translit-grk.json` — **status: provisional**, reconstructed from committed examples since the README table was never written; two flagged conflicts need ratification (tet/taw both '+'; upsilon vs eta both 'y'). Ingestion built: `npm run build-lemmas` (VerseMap.xml WLC→KJV remapping included; 35 verses remain uncovered — SBLGNT-omitted KJV verses like MATT/17:21 and a few WLC edge cases, reported by check-mapping as a coverage warning). `check-mapping` (I1 corpus side) live and in `check-all`: misses are errors for `applied` entries, warnings for `decided` (= imputation work-queue). Translit engine live: `src/translit.ts` + `npm run translit -- <heb|grk> <word>`, round-trips all attested examples. Still open: full-corpus check-translit sweep (needs per-token source alignment) and check-xref rendering compare (I5). Corpus ID quirk: NT epistles use suffix-numbered book codes (`THES/1/1:1`, book = `THES/1`); OT uses prefix (`1CHR`).

| Script | Purpose | Serves |
|---|---|---|
| `glean <lemma\|strongs>` | List every occurrence: coordinates, current rendering, form, context line | PR1.2 |
| `impute <lemma> <rendering>` | Apply rendering across all occurrences; emits diff for review, never auto-commits | PR1.6 |
| `check-mapping` | Verify DICT lemma→English is applied 1:1 corpus-wide | I1 |
| `check-collisions` | Invert DICT; report English words claimed by >1 lemma | I2 |
| `check-translit` | Regenerate transliterals from source spellings; diff against corpus | I3 |
| `check-structure` | Versification + schema validation | I4 |
| `check-xref` | Quotation-pair rendering consistency via xref.csv | I5 |
| `check-all` | Run every check; CI entry point | all |
| `dict-lint` | DICT format validation + commit-message provenance check | I6 |
| `translit <heb\|grk> <word>` | One-off transliteration via mapping tables | PR2 |
| `concord <english-word>` | Reverse concordance: where does this English word appear, from which lemmas | PR4 |
| `build` | Regenerate CSV/JSON/graph outputs from canonical data | PR7 |
| `stats` | Progress dashboard: lemmas decided/applied, books passed, invariant status | — |
| `embed-db` | Build/refresh libsql verse-embedding DB (see below) | PR1.2–3, PR5 |

Prerequisite data work: **done** — DICT.txt migrated by hand to `dict.json` (2026-07-24; 30 entries: lemma, Strong's, transliteral, rendering, senses[], status, rationale). `scripts/dict-lint.js` guards it. DICT.txt retained as historical source; new decisions go in dict.json only. Source quirks preserved as entry notes rather than silently fixed (H210→H120, H3405→H3045 per their own URLs; bare G5281; duplicate Neighbor; theos double-claim).

## Rebuilding local datasets (all scripted — nothing manual, nothing API-driven at check time)

| Data | Kind | Rebuild command | Notes |
|---|---|---|---|
| `data/sources/**` | Vendored (committed) | `npm run fetch-sources` | Re-clones pinned SHAs from SOURCES.md; network only here |
| `data/lemmas.json` | Derived (gitignored) | `npm run build-lemmas` | coord → [H-strongs] (OT) / [greek lemma] (NT); deterministic from data/sources |
| `src/CHARIS.json` | Derived (gitignored) | `npm run build-app-data` | Viewer app's text; built from asset/bible.csv; CI rebuilds on every deploy |
| `embeddings.db` | Derived (gitignored) | `npm run embed-db` (future) | See Verse-embedding DB below |
| `npm run rebuild` | — | rebuilds all derived data | Extend as derived datasets are added |

Rules: derived files are never hand-edited and never source of truth (P9/I8); every derived dataset added later MUST come with its rebuild script and a row here. Known gap: 166 bible.csv verses lack lemma entries — KJV-vs-Hebrew versification offsets (e.g. GEN/31:55 = Heb 32:1); OSHB `VerseMap.xml` is vendored and awaits an ingestion mapping (TODO).

Viewer app (`src/`, React): **read-only by policy** — the in-app verse editor and save-to-JSON flow were removed (I8/P7: text edits go through dict.json + impute only). Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every master push (verify → build-app-data → app:build → Pages).

Transliteration tables `data/translit-heb.json` / `translit-grk.json`: **ratified 2026-07-24** (tet=`9`, upsilon=`u`); these are canonical data (hand-maintained, committed), not derived.

## Verse-embedding DB

libsql file (e.g. `embeddings.db`, gitignored). Derived state per P9/I8 — rebuildable from canonical JSON, never source of truth.

- One DB: `verses` table with `version` column (`ylt` | `charis`); embeddings keyed `(version, coord, content_hash)`. Stale-by-hash: after an imputation, only changed verses re-embed.
- libsql native vectors: `F32_BLOB(384)` column + `vector_top_k`; no extension.
- Embedder: **`Xenova/bge-small-en-v1.5`** (384 dims) via `@huggingface/transformers` (transformers.js) — pure Node/TS, fully local/offline after first model download, no native build step. Options `{ pooling: 'mean', normalize: true }`. Record `model_id` + dimensions in the table; one model only — mixed-model vectors are garbage. Note: raw-text cosine range is ~[0.33, 1.0], not [-1, 1]; calibrate any thresholds empirically.
- Uses: echo-audit candidate generation (undeclared allusions beyond xref.csv); YLT↔Charis per-verse distance as meaning-drift signal feeding verse-review; PR3 sense-clustering of occurrence contexts; semantic concordance. Later: coarser pericope/chapter granularity for echo-audit.
- Boundary rule: embeddings are **finders** (candidate generators for PR queues), never **checkers**. Invariants remain exact-match scripts.

## AI skills (judgment-heavy, human-approved output)

| Skill | Purpose | Serves |
|---|---|---|
| `gleaning` | Given a lemma + occurrence dump, produce usage analysis: semantic range, clusters, co-occurrence patterns, canonical echoes | PR1.2–3 |
| `rendering-proposal` | Propose candidate English renderings ranked by precision, conjugatability, non-collision; include the 50-cent options with definitions | PR1.4 |
| `sense-split` | Cluster occurrences into senses + adversarial collapse test | PR3 |
| `imputation` | Conjugate the decided rendering into each verse context, preserving word order; output per-verse diffs for `impute` script to stage | PR1.6 |
| `echo-audit` | Detect intra-canon allusions/quotations beyond xref.csv; flag renderings that break the echo | P2, I5 |
| `verse-review` | Spot-read changed verses: grammaticality, word-order fidelity, meaning drift vs. source | PR1.7, PR6 |
| `commit-scribe` | Draft the I6-compliant commit message from the DICT diff | I6 |

Skill conventions: each is a `.claude/skills/<name>/SKILL.md`; inputs are script outputs (glean dumps, diffs), never raw whim; every skill output is a proposal — a human (or the invariant checks) gates application. Determinism boundary: if a task can be a script, it is a script; AI only where judgment about meaning is required.

## Suggested layout

```
scripts/        # deterministic tools above
.claude/skills/ # AI skills above
dict.json       # structured dictionary (successor to DICT.txt)
docs/           # PREMISES, INVARIANTS, PROCESSES, TOOLING
```

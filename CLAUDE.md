# Charis — agent instructions

Lexically-equivalent Bible translation. **Read `docs/README.md` first**;
precedence: PREMISES > INVARIANTS > PROCESSES > TOOLING > this file.

## Hard rules

- Rendering decisions (which English word for a lemma) are HUMAN-gated.
  Propose in dict.json as `candidate`; never promote to `decided` yourself.
- The writing pass is dict-driven and near-deterministic: judgment goes into
  dict.json (rendering, `forms`, senses); application goes through
  `npm run impute` and the `imputation` skill. Never free-hand translate.
- Never edit bible.csv without lemma justification from `data/lemmas.json`.
- One lemma per commit; commit message per I6 (lemma, old/new rendering,
  rationale, outstanding count).
- `npm run verify` (tests + typecheck + check-all) must pass before commit —
  enforced by `.githooks/pre-commit` (`git config core.hooksPath .githooks`).
- Derived data (`data/lemmas.json`, `embeddings.db`) is gitignored and
  rebuilt by script; vendored sources (`data/sources/`) are committed and only
  changed via `npm run fetch-sources` SHA bumps.

## Tooling map

| Task | Command |
|---|---|
| find occurrences | `npm run glean -- <term> [--prefix]` / `npm run concord -- <word>` |
| apply rendering | `npm run impute -- <id> --replace a,b [--ambiguous H###] [--write]` |
| verify family word-order | `npm run check-alignment -- <id> <id> ...` |
| all invariants | `npm run check-all` (or `npm run verify` for full gate) |
| transliterate | `npm run translit -- <heb|grk> <word>` |
| rebuild derived data | `npm run rebuild` / `npm run build-lemmas` |
| progress | `npm run stats` |

Corpus quirks: NT epistle IDs embed the ordinal (`THES/1/1:1`); ~35 verses
lack lemma coverage (SBLGNT omissions etc.) — check-mapping reports them.

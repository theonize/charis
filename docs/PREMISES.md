# Premises

The axioms of the Charis translation. Everything else in `docs/` derives from these. If a proposed change conflicts with a premise, the change loses — or the premise is amended here, explicitly, in version control.

## P1 — Lexical equivalence (reversible)

Every English term in the text traces to exactly **one** source term, everywhere it occurs, modulo grammatical conjugation: from any English word, its original is recoverable. English → source is a function; this is the invariant that does not bend.

A *source term* is a Hebrew/Aramaic lemma together with the Greek lemma(s) that share its definition (P2) — e.g. `elohim` + `θεός`, `ruach` + `πνεῦμα`, `qadosh` + `hagios`. Every Greek lemma should have such a Hebrew pair; a Greek-only entry is a gap to close, not a resting state. A source term normally owns one English term (or one transliterated loanword). It **may** own more than one, provided none of them is owned by any other source term: the English vocabulary is partitioned by source, never shared. Each additional term is an enumerated alternate in the dictionary (DICT).

- **Identity is spelling.** An English term is its spelling, whatever its part of speech: *sin* has one original, noun or verb. Inflected forms belong to their headword's owner.
- **Binding.** Within one language, each English term is carried by at most one lemma, so reversibility holds per language. A source term may therefore group several lemmas of one language only if their terms differ: `hayah` owns *be* and *become*; εἰμί carries *be*, γίνομαι *become*.
- **Selection is data.** Which of a lemma's terms stands at each occurrence is recorded per occurrence in `assign.json`, never decided silently verse-by-verse.
- **Supplied words are marked.** English with no source lexeme (supplied copulas, articles, case prepositions) is outside P1 and must be marked `[like this]` — the machine analogue of italics — so that every unmarked word is reversible.

(Amended 2026-11-06: previously "one lemma ↔ one English lemma" with a sense-split exception. The revision keeps reversibility absolute and makes multiplicity on the source side explicit and bounded.)

## P2 — Canonical consistency

The canon is treated as a single, self-referential corpus. A rendering decision made in Genesis binds Revelation. Intra-canon allusion, quotation (esp. NT quoting LXX/Hebrew), and shared technical vocabulary must survive translation — if the original texts echo each other, the English must echo too.

## P3 — Precision over familiarity

When English offers a precise, rare word and a fuzzy, common word, take the precise one. "Fifty-cent words" are acceptable costs for exact meaning: *propitiation*, *paraclete*, *immutable*, *emanation*. The reader has a dictionary; the text should not lie to avoid sending them to it.

## P4 — Transliteration over lossy translation

Original words that are loanable are transliterated, not translated (Yahweh, shalom, aparxy). Hebrew via revised ASCII-friendly Michigan/Claremont; Greek via the project mapping in README. Rationale: spelling and word composition carry meaning; a derived English word is computable from the transliteral, not vice-versa.

## P5 — Source-text fidelity of form

Preserve original word order, via conjugation and punctuation, as far as English tolerates. Structure is signal.

## P6 — Info-tech framing is legitimate

The corpus is treated as a system: words are identifiers, usage is cross-referenced, meaning is resolved by scope and reference, not tradition. Concepts from information theory, systems, and philosophy (state, covenant-as-protocol, name-as-identifier, type/antitype) are valid analytic and lexical tools when they sharpen rather than distort.

## P7 — Process is the product

Version control gives dependability and visibility. Every rendering decision is a commit with rationale; the diff history *is* the translation's apparatus. No decision lives only in someone's head.

## P8 — Base text

Initial basis is Young's Literal Translation (public domain, already word-order-faithful), corrected against the original-language texts. YLT is scaffolding, not authority.

## P9 — Machine-first structure

Output formats are simple and parsable (CSV/JSON, one verse per record). Tradition baggage (verse-formatting conventions, red letters, section headings) is excluded from canonical data; presentation layers may add it.

## P10 — Open source

CC BY-SA 4.0. All data, mappings, and tooling public.

# Premises

The axioms of the Charis translation. Everything else in `docs/` derives from these. If a proposed change conflicts with a premise, the change loses — or the premise is amended here, explicitly, in version control.

## P1 — Lexical equivalence

One original-language lemma maps to one English lemma (or one transliterated loanword), everywhere it occurs, modulo grammatical conjugation. Translation is a function, not an art of local paraphrase. Where a lemma genuinely carries distinct senses, the split is documented in the dictionary (DICT) as separate, enumerated sense entries — never decided silently verse-by-verse.

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

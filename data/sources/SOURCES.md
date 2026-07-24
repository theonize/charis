# Source corpora (local copies — no API dependence)

Vendored 2026-07-24. These are read-only reference data; never edit in place. Re-vendor by shallow-cloning and copying the same paths.

## oshb/ — Open Scriptures Hebrew Bible (WLC + morphology)

- Upstream: https://github.com/openscriptures/morphhb — commit `3d15126fb1ef74867fc1434be1942e837932691f`
- Copied: `wlc/*.xml` (OSIS, one file per book, Strong's-tagged lemmas), `README.md`
- License: text is WLC (public domain); lemma/morphology data CC BY 4.0 (see README.md)
- Serves: I1 check-mapping left-hand side (Hebrew), I3 source spellings

## morphgnt/ — MorphGNT SBLGNT

- Upstream: https://github.com/morphgnt/sblgnt — commit `aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d`
- Copied: `*-morphgnt.txt` (one per NT book; columns: bcv, pos, parse, text, word, normalized, lemma), `LICENSE.md`, `README.md`
- License: SBLGNT text under SBLGNT EULA (free use); MorphGNT analysis CC BY-SA 3.0
- Serves: I1 check-mapping left-hand side (Greek), I3 source spellings
- Caveat: MorphGNT provides Greek lemma strings, NOT Strong's numbers. Greek-side I1 keys on lemma text; dict.json grk lemmas carry both `strongs` and `lemma` to bridge.

## Book-code mapping

OSHB file names (`Gen.xml`, `1Chr.xml`) and MorphGNT book numbers (61=Matt … 87=Rev) differ from Charis codes (BOOK.txt, e.g. `ISAH`, `THES/1`). The ingestion script owns that mapping; nothing here is renamed.

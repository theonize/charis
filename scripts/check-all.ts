// CI entry point — every invariant check that has an implementation.
// Not yet covered: check-translit corpus sweep (I3 — needs per-token source alignment), check-xref rendering compare (I5).
import fs from 'node:fs'
import path from 'node:path'
import { loadDict, lintDict } from '../src/dict.js'
import { loadBibleCsv } from '../src/corpus.js'
import { checkStructure } from '../src/checkStructure.js'
import { checkMapping } from '../src/checkMapping.js'
import { loadXrefCsv } from '../src/xref.js'
import { BIBLE_CSV, DICT_PATH, ROOT, XREF_CSV, report } from './lib.js'

let ok = true

const lint = lintDict(loadDict(DICT_PATH))
ok = report('dict-lint (I1 dict-side, I2, I6)', lint.errors, lint.warnings) && ok

const structure = checkStructure(loadBibleCsv(BIBLE_CSV))
ok = report('check-structure (I4)', structure.errors, structure.warnings) && ok

const LEMMAS = path.join(ROOT, 'data', 'lemmas.json')
if (fs.existsSync(LEMMAS)) {
  const mapping = checkMapping(loadDict(DICT_PATH), loadBibleCsv(BIBLE_CSV), JSON.parse(fs.readFileSync(LEMMAS, 'utf8')))
  ok = report('check-mapping (I1 corpus side)', mapping.errors, mapping.warnings) && ok
} else {
  console.log('check-mapping: SKIPPED — data/lemmas.json missing (run: npm run build-lemmas)')
}

const xref = loadXrefCsv(XREF_CSV)
console.log(`xref: ${xref.pairs.length} pairs parsed, ${xref.skipped.length} rows skipped (cross-chapter ranges — no silent caps)`)

console.log(ok ? '\ncheck-all: PASS' : '\ncheck-all: FAIL')
process.exit(ok ? 0 : 1)

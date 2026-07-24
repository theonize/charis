// check-alignment <entry-id> [<entry-id> ...] — word-level I1 for a lemma family
// sharing an English history (e.g. el eloah elohim). Only verses containing 2+
// family lemmas are judged (single-lemma verses are check-mapping's job).
import fs from 'node:fs'
import path from 'node:path'
import { loadDict } from '../tool/dict.js'
import { loadBibleCsv } from '../tool/corpus.js'
import { formatCoord } from '../tool/coords.js'
import { checkAlignment } from '../tool/checkAlignment.js'
import { BIBLE_CSV, DICT_PATH, ROOT, report } from './lib.js'

const ids = process.argv.slice(2).filter(a => !a.startsWith('--'))
if (ids.length < 2) {
  console.error('usage: npm run check-alignment -- <entry-id> <entry-id> [...]')
  process.exit(2)
}

const dict = loadDict(DICT_PATH)
const family = new Map<string, string>()
for (const id of ids) {
  const e = dict.entries.find(x => x.id === id)
  if (!e?.rendering) {
    console.error(`entry "${id}" missing or has no rendering`)
    process.exit(2)
  }
  for (const l of e.lemmas) {
    const key = l.lang === 'grk' ? l.lemma : l.strongs
    if (key) family.set(key, e.rendering)
  }
}

const lemmas: Record<string, string[]> = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', 'lemmas.json'), 'utf8'),
)

const errors: string[] = []
let judged = 0
for (const v of loadBibleCsv(BIBLE_CSV)) {
  const src = lemmas[formatCoord(v.coord)]
  if (!src) continue
  if (src.filter(l => family.has(l)).length < 2) continue
  judged++
  const r = checkAlignment(v, src, family)
  if (!r.ok) errors.push(`${formatCoord(v.coord)}: ${r.problem}`)
}

console.log(`check-alignment [${ids.join(', ')}]: ${judged} multi-lemma verses judged`)
process.exit(report('check-alignment', errors, []) ? 0 : 1)

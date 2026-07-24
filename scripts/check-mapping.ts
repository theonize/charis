// I1 corpus side — decided/applied dict renderings verified against data/lemmas.json.
// Run `npm run build-lemmas` first if data/lemmas.json is missing.
import fs from 'node:fs'
import path from 'node:path'
import { loadDict } from '../tool/dict.js'
import { loadBibleCsv } from '../tool/corpus.js'
import { checkMapping } from '../tool/checkMapping.js'
import { BIBLE_CSV, DICT_PATH, ROOT, report } from './lib.js'

const LEMMAS = path.join(ROOT, 'data', 'lemmas.json')
if (!fs.existsSync(LEMMAS)) {
  console.error('data/lemmas.json missing — run: npm run build-lemmas')
  process.exit(2)
}

const { errors, warnings } = checkMapping(
  loadDict(DICT_PATH),
  loadBibleCsv(BIBLE_CSV),
  JSON.parse(fs.readFileSync(LEMMAS, 'utf8')),
)
process.exit(report('check-mapping', errors, warnings) ? 0 : 1)

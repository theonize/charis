// Rebuild src/CHARIS.json (DERIVED, gitignored) — the viewer app's data —
// from asset/bible.csv. Run before app:build; CI does this in the deploy action.
import fs from 'node:fs'
import path from 'node:path'
import { loadBibleCsv } from '../tool/corpus.js'
import { toAppJson, buildBookNames } from '../tool/appData.js'
import { BIBLE_CSV, ROOT } from './lib.js'

const names = buildBookNames(
  JSON.parse(fs.readFileSync(path.join(ROOT, 'asset', 'json', 'books.json'), 'utf8')),
  fs.readFileSync(path.join(ROOT, 'asset', 'BOOK.txt'), 'utf8'),
)

const out = toAppJson(loadBibleCsv(BIBLE_CSV), names)
const dest = path.join(ROOT, 'src', 'CHARIS.json')
fs.writeFileSync(dest, JSON.stringify(out))
console.log(`build-app-data: ${Object.keys(out).length} books → ${dest} (${(fs.statSync(dest).size / 1e6).toFixed(1)} MB)`)

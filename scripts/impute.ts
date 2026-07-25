// impute <entry-id> --replace <t1,t2|old=new> [--ambiguous H410,H433] [--write]
// PR1.6 — apply a decided rendering across all lemma-matched verses in bible.csv.
// Dry-run by default: prints the diff. --write rewrites bible.csv (changed rows only,
// legacy unquoted-text row style preserved). Never commits — review the git diff.
import fs from 'node:fs'
import path from 'node:path'
import { loadDict } from '../tool/dict.js'
import { loadBibleCsv } from '../tool/corpus.js'
import { imputeRendering } from '../tool/impute.js'
import { formatCoord } from '../tool/coords.js'
import { BIBLE_CSV, DICT_PATH, ROOT } from './lib.js'

const args = process.argv.slice(2)
const write = args.includes('--write')
const flag = (name: string) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const entryId = args.filter(a => !a.startsWith('--') && a !== flag('--replace') && a !== flag('--ambiguous'))[0]
const replace = flag('--replace')?.split(',')

if (!entryId || !replace?.length) {
  console.error('usage: npm run impute -- <entry-id> --replace God,gods [--ambiguous H410,H433] [--write]')
  console.error('       a replace term may target its own form: --replace prepared=created,preparing=creating')
  process.exit(2)
}

const dict = loadDict(DICT_PATH)
const entry = dict.entries.find(e => e.id === entryId)
if (!entry) {
  console.error(`no dict entry "${entryId}"`)
  process.exit(2)
}
if (entry.status === 'candidate' || !entry.rendering) {
  console.error(`entry "${entryId}" is not decided — decide the rendering first (PR1.5)`)
  process.exit(2)
}

// An explicit `old=new` target that is not a declared form would be invisible to
// check-mapping (it matches entry.forms exactly), so the entry must declare it first.
if (entry.forms?.length) {
  const declared = new Set(entry.forms.map(f => f.toLowerCase()))
  const undeclared = replace
    .filter(t => t.includes('='))
    .map(t => t.slice(t.indexOf('=') + 1).trim())
    .filter(f => f && !declared.has(f.toLowerCase()))
  if (undeclared.length) {
    console.error(`entry "${entryId}" does not declare form(s): ${[...new Set(undeclared)].join(', ')}`)
    console.error(`declared forms: ${entry.forms.join(', ')}`)
    console.error('add them to the entry\'s forms array first (PR1.5) — check-mapping matches forms exactly')
    process.exit(2)
  }
}

const lemmas = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'lemmas.json'), 'utf8'))
const corpus = loadBibleCsv(BIBLE_CSV)
const keys = entry.lemmas.map(l => (l.lang === 'grk' ? l.lemma : l.strongs)).filter((k): k is string => !!k)

const r = imputeRendering(corpus, lemmas, {
  keys,
  replace,
  rendering: entry.rendering,
  ambiguousWith: flag('--ambiguous')?.split(',') ?? [],
})

for (const c of r.changed.slice(0, 10))
  console.log(`${formatCoord(c.coord)}\n  - ${c.before}\n  + ${c.after}`)
if (r.changed.length > 10) console.log(`  ... and ${r.changed.length - 10} more`)
console.log(`\nimpute ${entryId}: ${r.changed.length} verses changed, ${r.ambiguous.length} ambiguous (skipped), ${r.residue.length} residue (no replace-term found)`)
if (r.ambiguous.length) console.log('ambiguous:', r.ambiguous.slice(0, 20).map(v => formatCoord(v.coord)).join(' '), r.ambiguous.length > 20 ? '...' : '')
if (r.residue.length) console.log('residue:', r.residue.slice(0, 20).map(v => formatCoord(v.coord)).join(' '), r.residue.length > 20 ? '...' : '')

if (!write) {
  console.log('\ndry-run — pass --write to apply')
  process.exit(0)
}

const byId = new Map(r.changed.map(c => [formatCoord(c.coord), c]))
const raw = fs.readFileSync(BIBLE_CSV, 'utf8')
const eol = raw.includes('\r\n') ? '\r\n' : '\n'
const lines = raw.split(/\r?\n/)
const out = lines.map(line => {
  const comma = line.indexOf(',')
  if (comma === -1) return line
  const id = line.replace(/^﻿/, '').slice(0, line.indexOf(','))
  const c = byId.get(id)
  if (!c) return line
  let pos = 0
  for (let i = 0; i < 5; i++) pos = line.indexOf(',', pos) + 1
  return line.slice(0, pos) + c.after
})
fs.writeFileSync(BIBLE_CSV, out.join(eol))
console.log(`wrote ${r.changed.length} rows to bible.csv — review with git diff`)

// Rebuild data/lemmas.json (DERIVED — never hand-edit) from the vendored
// source corpora in data/sources/. Deterministic; safe to re-run anytime.
// Output: { "<coord>": [ "H7225", ... heb strongs ] | [ "βίβλος", ... grk lemmas ] }
import fs from 'node:fs'
import path from 'node:path'
import { formatCoord } from '../src/coords.js'
import { parseOshbXml, parseMorphGnt, parseVerseMap, oshbBookToCharis, morphGntFileToCharis } from '../src/sources.js'
import { ROOT } from './lib.js'

const OSHB_DIR = path.join(ROOT, 'data', 'sources', 'oshb', 'wlc')
const GNT_DIR = path.join(ROOT, 'data', 'sources', 'morphgnt')
const OUT = path.join(ROOT, 'data', 'lemmas.json')

const table: Record<string, string[]> = {}
let verseCount = 0
let remapped = 0
let dropped = 0

// bible.csv follows KJV versification; WLC differs in ~2k verses (VerseMap.xml).
const verseMap = parseVerseMap(fs.readFileSync(path.join(OSHB_DIR, 'VerseMap.xml'), 'utf8'))

for (const file of fs.readdirSync(OSHB_DIR).filter(f => f.endsWith('.xml'))) {
  const base = file.replace(/\.xml$/, '')
  if (base === 'VerseMap') continue
  const book = oshbBookToCharis(base)
  for (const v of parseOshbXml(fs.readFileSync(path.join(OSHB_DIR, file), 'utf8'), book)) {
    let id = formatCoord(v.coord)
    const entry = verseMap.get(id)
    if (entry) {
      if (entry.kjv === null) {
        // No KJV counterpart (Psalm title verses): merge into verse 1 of the chapter.
        dropped++
        id = `${v.coord.book}/${v.coord.chapter}:1`
        table[id] = [...v.words.map(w => w.strongs!), ...(table[id] ?? [])]
        verseCount++
        continue
      }
      id = entry.kjv
      remapped++
    }
    table[id] = [...(table[id] ?? []), ...v.words.map(w => w.strongs!)]
    verseCount++
  }
}

for (const file of fs.readdirSync(GNT_DIR).filter(f => /^\d+-.*\.txt$/.test(f))) {
  const book = morphGntFileToCharis(Number(file.slice(0, 2)))
  for (const v of parseMorphGnt(fs.readFileSync(path.join(GNT_DIR, file), 'utf8'), book)) {
    table[formatCoord(v.coord)] = v.words.map(w => w.lemma)
    verseCount++
  }
}

fs.writeFileSync(OUT, JSON.stringify(table))
console.log(`build-lemmas: ${verseCount} verses (${remapped} remapped WLC→KJV, ${dropped} title-verses merged) → ${OUT} (${(fs.statSync(OUT).size / 1e6).toFixed(1)} MB)`)

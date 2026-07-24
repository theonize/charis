import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const DATA = path.join(here, '..', 'data')

interface HebLetter {
  hebrew: string
  ascii: string
  finals?: string[]
}
interface GrkLetter {
  greek: string
  ascii: string
  finals?: string[]
}

function loadTable<T>(file: string): { status: string; letters: T[] } {
  return JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8'))
}

const SHIN_DOT = 'ׁ'
const SIN_DOT = 'ׂ'
const HEB_MARKS = /[֑-ׇ]/g

let hebMap: Map<string, string> | null = null
function hebrewMap(): Map<string, string> {
  if (hebMap) return hebMap
  hebMap = new Map()
  for (const l of loadTable<HebLetter>('translit-heb.json').letters) {
    // Table keys for shin/sin carry the dot; normalize to base+dot forms.
    const base = l.hebrew.normalize('NFD').replace(HEB_MARKS, '')
    if (l.hebrew.normalize('NFD').includes(SHIN_DOT)) hebMap.set('ש' + SHIN_DOT, l.ascii)
    else if (l.hebrew.normalize('NFD').includes(SIN_DOT)) hebMap.set('ש' + SIN_DOT, l.ascii)
    else hebMap.set(base, l.ascii)
    for (const f of l.finals ?? []) hebMap.set(f, l.ascii)
  }
  return hebMap
}

/** Consonantal transliteration per data/translit-heb.json (ratified). Points/cantillation dropped; shin/sin dots consulted before stripping. */
export function translitHebrew(word: string): string {
  const map = hebrewMap()
  // Keep shin/sin dots as part of the letter; strip all other marks.
  const chars = word.normalize('NFD')
  let out = ''
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]!
    if (/[֑-ׇ]/.test(c)) continue
    let key = c
    if (c === 'ש') {
      const next = chars.slice(i + 1).match(/^[֑-ׇ]*/)?.[0] ?? ''
      if (next.includes(SIN_DOT)) key = 'ש' + SIN_DOT
      else key = 'ש' + SHIN_DOT // bare shin defaults to shin
    }
    const ascii = map.get(key)
    if (ascii !== undefined) out += ascii
  }
  return out
}

const ROUGH = '̔'
const GRK_MARKS = /[̀-ͯͅ]/g

let grkMap: Map<string, string> | null = null
function greekMap(): Map<string, string> {
  if (grkMap) return grkMap
  grkMap = new Map()
  for (const l of loadTable<GrkLetter>('translit-grk.json').letters) {
    grkMap.set(l.greek, l.ascii)
    for (const f of l.finals ?? []) grkMap.set(f, l.ascii)
  }
  return grkMap
}

/** Transliteration per data/translit-grk.json (ratified). Diacritics dropped; rough breathing → leading 'h'; case preserved. */
export function translitGreek(word: string): string {
  const map = greekMap()
  const chars = word.normalize('NFD')
  let out = ''
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]!
    if (GRK_MARKS.test(c)) {
      GRK_MARKS.lastIndex = 0
      if (c === ROUGH) {
        // h precedes the vowel just emitted
        const last = out.slice(-1)
        const isUpper = last === last.toUpperCase() && last !== last.toLowerCase()
        out = out.slice(0, -last.length) + (isUpper ? 'H' + last.toLowerCase() : 'h' + last)
      }
      continue
    }
    GRK_MARKS.lastIndex = 0
    const lower = c.toLowerCase()
    const ascii = map.get(lower)
    if (ascii === undefined) continue
    out += c !== lower ? ascii[0]!.toUpperCase() + ascii.slice(1) : ascii
  }
  return out
}

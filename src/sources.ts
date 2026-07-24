import type { Coord } from './coords.js'

export interface SourceWord {
  /** Strong's number (Hebrew only — MorphGNT carries no Strong's). */
  strongs?: string
  /** Raw OSHB lemma attr (heb) or normalized Greek lemma (grk). */
  lemma: string
}

export interface SourceVerse {
  coord: Coord
  words: SourceWord[]
}

// OSHB file basename → Charis book code (BOOK.txt).
const OSHB_BOOKS: Record<string, string> = {
  Gen: 'GEN', Exod: 'EX', Lev: 'LEV', Num: 'NUM', Deut: 'DEUT',
  Josh: 'JOSH', Judg: 'JUDG', Ruth: 'RUTH',
  '1Sam': '1SAM', '2Sam': '2SAM', '1Kgs': '1KGS', '2Kgs': '2KGS',
  '1Chr': '1CHR', '2Chr': '2CHR', Ezra: 'EZRA', Neh: 'NEHE', Esth: 'ESTH',
  Job: 'JOB', Ps: 'PSLM', Prov: 'PROV', Eccl: 'ECCL', Song: 'SONG',
  Isa: 'ISAH', Jer: 'JERM', Lam: 'LAMN', Ezek: 'EZEK', Dan: 'DAN',
  Hos: 'HSEA', Joel: 'JOEL', Amos: 'AMOS', Obad: 'OBAD', Jonah: 'JNAH',
  Mic: 'MCAH', Nah: 'NHUM', Hab: 'HBAK', Zeph: 'ZEPH', Hag: 'HAG',
  Zech: 'ZECH', Mal: 'MAL',
}

// MorphGNT file number (61–87) → Charis book code.
const MORPHGNT_BOOKS = [
  'MATT', 'MARK', 'LUKE', 'JOHN', 'ACTS', 'ROM', '1COR', '2COR', 'GAL',
  'EPH', 'PHP', 'COL', 'THES/1', 'THES/2', 'TIM/1', 'TIM/2', 'TTUS',
  'PHLM', 'HEB', 'JAM', 'PETE/1', 'PETE/2', 'JOHN/1', 'JOHN/2', 'JOHN/3',
  'JUDE', 'RVEL',
]

export function oshbBookToCharis(name: string): string {
  const code = OSHB_BOOKS[name]
  if (!code) throw new Error(`unknown OSHB book: "${name}"`)
  return code
}

export function morphGntFileToCharis(fileNum: number): string {
  const code = MORPHGNT_BOOKS[fileNum - 61]
  if (!code) throw new Error(`unknown MorphGNT file number: ${fileNum}`)
  return code
}

export interface VerseMapEntry {
  /** Charis-coded KJV coordinate id, or null when the WLC verse has no KJV counterpart (e.g. Psalm titles, kjv verse 0). */
  kjv: string | null
  type: 'full' | 'partial'
}

const VERSEMAP_RE = /<verse wlc="([^"]+)" kjv="([^"]+)" type="(full|partial)"\/>/g

function osisToCharisId(osis: string): string {
  const [book, ch, vs] = osis.split('.')
  return `${oshbBookToCharis(book!)}/${Number(ch)}:${Number(vs)}`
}

/**
 * Parse OSHB VerseMap.xml: WLC↔KJV versification differences.
 * Returns WLC coord id (Charis codes) → KJV coord id. bible.csv follows KJV
 * versification, so lemma ingestion remaps WLC coords through this table.
 */
export function parseVerseMap(xml: string): Map<string, VerseMapEntry> {
  const map = new Map<string, VerseMapEntry>()
  for (const m of xml.matchAll(VERSEMAP_RE)) {
    const kjvVerse = Number(m[2]!.split('.')[2])
    map.set(osisToCharisId(m[1]!), {
      kjv: kjvVerse === 0 ? null : osisToCharisId(m[2]!),
      type: m[3] as 'full' | 'partial',
    })
  }
  return map
}

const VERSE_RE = /<verse osisID="[^".]+\.(\d+)\.(\d+)">([\s\S]*?)<\/verse>/g
const W_RE = /<w [^>]*lemma="([^"]+)"[^>]*>/g
const STRONGS_NUM_RE = /(\d+)/g

/**
 * Extract per-verse Strong's from an OSHB WLC OSIS file.
 * Lemma attrs carry prefix morphemes ("b/7225", "c/d/776") and variant
 * suffixes ("1254 a") — the trailing number is the word's Strong's.
 */
export function parseOshbXml(xml: string, charisBook: string): SourceVerse[] {
  const verses: SourceVerse[] = []
  for (const vm of xml.matchAll(VERSE_RE)) {
    const words: SourceWord[] = []
    for (const wm of vm[3]!.matchAll(W_RE)) {
      const lemma = wm[1]!
      const nums = lemma.match(STRONGS_NUM_RE)
      if (!nums) continue
      words.push({ strongs: `H${nums[nums.length - 1]}`, lemma })
    }
    verses.push({
      coord: { book: charisBook, chapter: Number(vm[1]), verse: Number(vm[2]) },
      words,
    })
  }
  return verses
}

/**
 * Parse a MorphGNT book file: "bbccvv pos parse text word normalized lemma".
 * Greek has lemma strings only — no Strong's.
 */
export function parseMorphGnt(content: string, charisBook: string): SourceVerse[] {
  const verses: SourceVerse[] = []
  let current: SourceVerse | null = null
  for (const line of content.split(/\r?\n/)) {
    if (!line.trim()) continue
    const cols = line.split(/\s+/)
    const bcv = cols[0]!
    const lemma = cols[cols.length - 1]!
    const chapter = Number(bcv.slice(2, 4))
    const verse = Number(bcv.slice(4, 6))
    if (!current || current.coord.chapter !== chapter || current.coord.verse !== verse) {
      current = { coord: { book: charisBook, chapter, verse }, words: [] }
      verses.push(current)
    }
    current.words.push({ lemma })
  }
  return verses
}

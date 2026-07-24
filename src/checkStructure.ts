import { formatCoord } from './coords.js'
import type { Verse } from './corpus.js'

export interface CheckResult {
  errors: string[]
  warnings: string[]
}

/**
 * I4 — structural integrity: every verse once, chapters/verses continuous
 * within their book, chapters start at verse 1, no silently-empty verses.
 * Order-independent: verses are grouped by coordinate, not file order.
 */
export function checkStructure(corpus: Verse[]): CheckResult {
  const errors: string[] = []
  const warnings: string[] = []

  const seen = new Set<string>()
  const books = new Map<string, Map<number, Set<number>>>()

  for (const v of corpus) {
    const id = formatCoord(v.coord)
    if (seen.has(id)) errors.push(`duplicate verse ${id}`)
    seen.add(id)
    let chapters = books.get(v.coord.book)
    if (!chapters) books.set(v.coord.book, (chapters = new Map()))
    let verses = chapters.get(v.coord.chapter)
    if (!verses) chapters.set(v.coord.chapter, (verses = new Set()))
    verses.add(v.coord.verse)
    if (!v.text.trim()) warnings.push(`empty verse ${id}`)
  }

  for (const [book, chapters] of books) {
    const chNums = [...chapters.keys()].sort((a, b) => a - b)
    let expectedCh = 1
    for (const ch of chNums) {
      if (ch !== expectedCh)
        errors.push(`${book}: chapter gap — expected chapter ${expectedCh}, found ${ch}`)
      expectedCh = ch + 1
      const vsNums = [...chapters.get(ch)!].sort((a, b) => a - b)
      if (vsNums[0] !== 1)
        errors.push(`${book}/${ch}: does not start at verse 1`)
      let expectedVs = vsNums[0]!
      for (const vs of vsNums) {
        if (vs !== expectedVs)
          errors.push(`${book}/${ch}: verse gap — missing verse ${expectedVs}`)
        expectedVs = vs + 1
      }
    }
  }

  return { errors, warnings }
}

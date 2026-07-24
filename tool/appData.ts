import type { Verse } from './corpus.js'

export type AppJson = Record<string, string[][]>

/**
 * Convert the corpus to the viewer app's data shape:
 * { "Genesis": [ [v1, v2, ...], ...chapters ] } — chapters and verses
 * 0-indexed (the app renders index+1). Gaps are filled with '' so verse
 * numbering stays aligned.
 */
export function toAppJson(corpus: Verse[], names: Map<string, string>): AppJson {
  const out: AppJson = {}
  for (const v of corpus) {
    const name = names.get(v.coord.book)
    if (!name) throw new Error(`unknown book code: "${v.coord.book}"`)
    const book = (out[name] ??= [])
    const chapter = (book[v.coord.chapter - 1] ??= [])
    while (chapter.length < v.coord.verse - 1) chapter.push('')
    chapter[v.coord.verse - 1] = v.text
  }
  return out
}

/** Join asset/json/books.json (full name → number) with asset/BOOK.txt ("<num> <code>" lines) into code → full name. */
export function buildBookNames(
  booksJson: Record<string, number>,
  bookTxt: string,
): Map<string, string> {
  const numToName = new Map(Object.entries(booksJson).map(([name, num]) => [num, name]))
  const map = new Map<string, string>()
  for (const line of bookTxt.split(/\r?\n/)) {
    const m = /^(\d+)\s+(\S+)/.exec(line.trim())
    if (!m) continue
    const name = numToName.get(Number(m[1]))
    if (name) map.set(m[2]!, name)
  }
  // bible.csv uses EX where BOOK.txt says EXO
  const exodus = map.get('EXO')
  if (exodus && !map.has('EX')) map.set('EX', exodus)
  return map
}

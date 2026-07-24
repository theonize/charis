export interface Coord {
  book: string
  chapter: number
  verse: number
}

// Book codes: OT-style prefix numbers ("1CHR") or NT-epistle suffix segment ("THES/1").
const CSV_ID = /^([1-3]?[A-Z]+(?:\/[1-3])?)\/(\d+):(\d+)$/
const XREF_REF = /^([1-3]?[A-Za-z]+)\.(\d+)\.(\d+)$/

export function parseCsvId(id: string): Coord {
  const m = CSV_ID.exec(id)
  if (!m) throw new Error(`malformed verse id: "${id}"`)
  return { book: m[1]!, chapter: Number(m[2]), verse: Number(m[3]) }
}

function parseSingleXref(ref: string): Coord {
  const m = XREF_REF.exec(ref)
  if (!m) throw new Error(`malformed xref ref: "${ref}"`)
  return { book: m[1]!.toUpperCase(), chapter: Number(m[2]), verse: Number(m[3]) }
}

/** Parse an xref.csv reference ("Gen.1.1" or range "Prov.8.22-Prov.8.30") into inclusive coords. */
export function parseXrefRef(ref: string): Coord[] {
  const dash = ref.indexOf('-')
  if (dash === -1) return [parseSingleXref(ref)]
  const from = parseSingleXref(ref.slice(0, dash))
  const to = parseSingleXref(ref.slice(dash + 1))
  if (from.book !== to.book || from.chapter !== to.chapter)
    throw new Error(`unsupported cross-chapter range: "${ref}"`)
  const coords: Coord[] = []
  for (let v = from.verse; v <= to.verse; v++)
    coords.push({ book: from.book, chapter: from.chapter, verse: v })
  return coords
}

export function formatCoord(c: Coord): string {
  return `${c.book}/${c.chapter}:${c.verse}`
}

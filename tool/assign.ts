import fs from 'node:fs'
import { headwords, lemmaKey, lemmaTerms, type Dict, type Entry } from './dict.js'
import type { CheckResult } from './checkStructure.js'

/**
 * assign.json — per-occurrence selection of an entry's English terms (P1, PR3.4).
 *
 *   assignments[entryId][verseId] = [term, term, ...]
 *
 * One term per occurrence of the entry's lemmas in that verse, in source order
 * (the order of data/lemmas.json). Verses not listed take each occurrence's
 * default: the lemma's first bound term, else the entry's primary rendering.
 * Like dict.json renderings, assignments are human-gated: for a candidate entry
 * they are proposals.
 */
export interface Assign {
  version: number
  note?: string
  assignments: Record<string, Record<string, string[]>>
}

export const emptyAssign = (): Assign => ({ version: 1, assignments: {} })

export function loadAssign(filePath: string): Assign {
  if (!fs.existsSync(filePath)) return emptyAssign()
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as Assign
}

interface Occurrence {
  key: string
  /** Terms this occurrence's lemma may take. */
  allowed: string[]
  default: string | null
}

/** The entry's lemma occurrences in a verse, in source order. */
function occurrences(e: Entry, sourceLemmas: string[]): Occurrence[] {
  const byKey = new Map(e.lemmas.map(l => [lemmaKey(l), l]))
  const out: Occurrence[] = []
  for (const k of sourceLemmas) {
    const l = byKey.get(k)
    if (!l) continue
    const allowed = lemmaTerms(e, l)
    out.push({ key: k, allowed, default: l.terms ? allowed[0]! : e.rendering?.toLowerCase() ?? null })
  }
  return out
}

/**
 * Expected English term at each occurrence of the entry in the verse —
 * the assignment if one is recorded, else each occurrence's default.
 */
export function expectedTerms(e: Entry, verseId: string, sourceLemmas: string[], assign: Assign): (string | null)[] {
  const listed = assign.assignments[e.id]?.[verseId]
  const occ = occurrences(e, sourceLemmas)
  return listed && listed.length === occ.length ? listed.map(t => t.toLowerCase()) : occ.map(o => o.default)
}

/** Structural check of assign.json against dict.json and data/lemmas.json. */
export function checkAssign(dict: Dict, assign: Assign, lemmas: Record<string, string[]>): CheckResult {
  const errors: string[] = []
  const warnings: string[] = []
  const entries = new Map(dict.entries.map(e => [e.id, e]))

  for (const [id, verses] of Object.entries(assign.assignments ?? {})) {
    const e = entries.get(id)
    if (!e) {
      errors.push(`assign "${id}": no such dict entry`)
      continue
    }
    if (headwords(e).length < 2)
      warnings.push(`assign "${id}": entry owns one headword — nothing to select`)

    for (const [verseId, terms] of Object.entries(verses)) {
      const tag = `assign "${id}" ${verseId}`
      if (!Array.isArray(terms) || terms.some(t => typeof t !== 'string' || !t)) {
        errors.push(`${tag}: must be an array of non-empty term strings`)
        continue
      }
      const source = lemmas[verseId]
      if (!source) {
        errors.push(`${tag}: verse has no lemma data`)
        continue
      }
      const occ = occurrences(e, source)
      if (occ.length === 0) {
        errors.push(`${tag}: verse contains none of the entry's lemmas`)
        continue
      }
      if (terms.length !== occ.length) {
        errors.push(`${tag}: ${terms.length} terms for ${occ.length} occurrence(s) of ${[...new Set(occ.map(o => o.key))].join('/')}`)
        continue
      }
      terms.forEach((t, i) => {
        const o = occ[i]!
        if (!o.allowed.includes(t.toLowerCase()))
          errors.push(`${tag}: occurrence ${i + 1} (${o.key}) assigned "${t}", allowed: ${o.allowed.join(', ')}`)
      })
      if (terms.every((t, i) => t.toLowerCase() === occ[i]!.default))
        warnings.push(`${tag}: every occurrence assigned its default — redundant`)
    }
  }
  return { errors, warnings }
}

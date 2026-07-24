import { formatCoord, type Coord } from './coords.js'
import type { Verse } from './corpus.js'

export interface ImputeOptions {
  /** Source-lemma keys selecting target verses (Strong's for heb, lemma string for grk). */
  keys: string[]
  /** English terms currently in the text to replace (whole-word, case-insensitive). */
  replace: string[]
  rendering: string
  /** Sibling lemmas whose presence makes string replacement unsafe (same English word from another lemma) — verse is skipped and reported. */
  ambiguousWith?: string[]
}

export interface ImputeChange {
  coord: Coord
  before: string
  after: string
}

export interface ImputeResult {
  changed: ImputeChange[]
  /** Lemma-matched verses skipped due to ambiguous sibling lemmas — need manual/AI pass (PR1.7). */
  ambiguous: Verse[]
  /** Lemma-matched verses where no replace-term was found — need manual/AI pass. */
  residue: Verse[]
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * PR1.6 — mechanically impute a decided rendering across every verse whose
 * source lemmas include the entry's keys. Pure: returns changes, writes nothing.
 * Case is preserved per token (capitalized source → capitalized rendering).
 */
export function imputeRendering(
  corpus: Verse[],
  lemmas: Record<string, string[]>,
  opts: ImputeOptions,
): ImputeResult {
  const keys = new Set(opts.keys)
  const ambiguous = new Set(opts.ambiguousWith ?? [])
  const re = new RegExp(`\\b(${opts.replace.map(escapeRe).join('|')})\\b`, 'gi')

  const result: ImputeResult = { changed: [], ambiguous: [], residue: [] }

  for (const v of corpus) {
    const source = lemmas[formatCoord(v.coord)]
    if (!source || !source.some(l => keys.has(l))) continue
    if (source.some(l => ambiguous.has(l))) {
      result.ambiguous.push(v)
      continue
    }
    let touched = false
    const after = v.text.replace(re, m => {
      touched = true
      const upper = m[0]! === m[0]!.toUpperCase()
      return upper
        ? opts.rendering[0]!.toUpperCase() + opts.rendering.slice(1)
        : opts.rendering.toLowerCase()
    })
    if (!touched) result.residue.push(v)
    else if (after !== v.text) result.changed.push({ coord: v.coord, before: v.text, after })
  }

  return result
}

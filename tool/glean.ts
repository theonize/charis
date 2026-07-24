import type { Coord } from './coords.js'
import type { Verse } from './corpus.js'

export interface GleanHit {
  coord: Coord
  text: string
  count: number
}

export interface GleanOptions {
  /** Match word stems: term matches any word beginning with it (conjugation sweep). */
  prefix?: boolean
  caseSensitive?: boolean
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Whole-word occurrence search over a verse corpus (PR1.2).
 * Surface-text only until a lemma-tagged corpus exists.
 */
export function glean(corpus: Verse[], term: string, opts: GleanOptions = {}): GleanHit[] {
  const body = escapeRe(term) + (opts.prefix ? '\\w*' : '')
  const re = new RegExp(`\\b${body}\\b`, opts.caseSensitive ? 'g' : 'gi')
  const hits: GleanHit[] = []
  for (const v of corpus) {
    const matches = v.text.match(re)
    if (matches) hits.push({ coord: v.coord, text: v.text, count: matches.length })
  }
  return hits
}

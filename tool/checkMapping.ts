import { formatCoord } from './coords.js'
import { lexicalText, type Verse } from './corpus.js'
import { lemmaKey, termForms, type Dict, type Entry } from './dict.js'
import { emptyAssign, expectedTerms, type Assign } from './assign.js'
import type { CheckResult } from './checkStructure.js'

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Matcher for one headword: its declared forms exactly, else stem prefix. */
function termMatcher(e: Entry, term: string): RegExp {
  const forms = termForms(e, term)
  if (forms.length) return new RegExp(`\\b(${forms.map(escapeRe).join('|')})\\b`, 'i')
  return new RegExp(`\\b${escapeRe(term.split(/\s+/)[0]!)}\\w*`, 'i')
}

/**
 * I1 corpus side — for every dict entry that has been decided/applied: each
 * verse whose source lemmas include one of the entry's lemmas must contain the
 * term expected at each occurrence — per assign.json, else the occurrence's
 * default (lemma's bound term / primary rendering). Supplied `[...]` text never
 * counts. Misses are errors for `applied`, warnings for `decided` (imputation in
 * progress). Candidates are skipped.
 *
 * `lemmas` is the derived data/lemmas.json table: coord id → source lemma list.
 */
export function checkMapping(
  dict: Dict,
  corpus: Verse[],
  lemmas: Record<string, string[]>,
  assign: Assign = emptyAssign(),
): CheckResult {
  const errors: string[] = []
  const warnings: string[] = []

  const verseById = new Map(corpus.map(v => [formatCoord(v.coord), v]))

  let uncovered = 0
  for (const v of corpus) if (!lemmas[formatCoord(v.coord)]) uncovered++
  if (uncovered > 0)
    warnings.push(`${uncovered} corpus verses have no lemma data (versification/source gaps) — I1 blind there`)

  for (const e of dict.entries) {
    if (e.status === 'candidate' || !e.rendering) continue
    const keys = new Set(e.lemmas.map(lemmaKey).filter((k): k is string => !!k))
    if (keys.size === 0) continue

    for (const [id, sourceLemmas] of Object.entries(lemmas)) {
      if (!sourceLemmas.some(sl => keys.has(sl))) continue
      const verse = verseById.get(id)
      if (!verse) continue // verse ids outside this corpus slice
      const text = lexicalText(verse.text)
      const expected = new Set(expectedTerms(e, id, sourceLemmas, assign).filter((t): t is string => !!t))
      for (const term of expected) {
        if (termMatcher(e, term).test(text)) continue
        const msg = `${id}: contains ${[...keys].join('/')} but not "${term}" (entry ${e.id})`
        if (e.status === 'applied') errors.push(msg)
        else warnings.push(msg)
      }
    }
  }

  return { errors, warnings }
}

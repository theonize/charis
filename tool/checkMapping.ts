import { formatCoord } from './coords.js'
import type { Verse } from './corpus.js'
import type { Dict } from './dict.js'
import type { CheckResult } from './checkStructure.js'

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * I1 corpus side — for every dict entry that has been decided/applied:
 * each verse whose source lemmas include the entry's Strong's (heb) or
 * lemma string (grk) must contain a conjugation (stem prefix) of the
 * rendering. Misses are errors for `applied`, warnings for `decided`
 * (imputation in progress). Candidates are skipped.
 *
 * `lemmas` is the derived data/lemmas.json table: coord id → source lemma list.
 */
export function checkMapping(
  dict: Dict,
  corpus: Verse[],
  lemmas: Record<string, string[]>,
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
    const stemRe = e.forms?.length
      ? new RegExp(`\\b(${e.forms.map(escapeRe).join('|')})\\b`, 'i')
      : new RegExp(`\\b${escapeRe(e.rendering.split(/\s+/)[0]!)}\\w*`, 'i')
    const keys = new Set(
      e.lemmas.map(l => (l.lang === 'grk' ? l.lemma : l.strongs)).filter((k): k is string => !!k),
    )
    if (keys.size === 0) continue

    for (const [id, sourceLemmas] of Object.entries(lemmas)) {
      if (!sourceLemmas.some(sl => keys.has(sl))) continue
      const verse = verseById.get(id)
      if (!verse) continue // verse ids outside this corpus slice
      if (stemRe.test(verse.text)) continue
      const msg = `${id}: contains ${[...keys].join('/')} but not "${e.rendering}" (entry ${e.id})`
      if (e.status === 'applied') errors.push(msg)
      else warnings.push(msg)
    }
  }

  return { errors, warnings }
}

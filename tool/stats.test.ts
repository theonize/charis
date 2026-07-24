import { describe, expect, test } from 'vitest'
import { dictStats } from './stats.js'
import type { Dict } from './dict.js'

const dict = {
  version: 1,
  entries: [
    { id: 'a', status: 'decided', rendering: 'x', lemmas: [{ lang: 'heb', strongs: 'H1', translit: null, lemma: null }], senses: [], rationale: 'r', refs: [], notes: [], decided: null },
    { id: 'b', status: 'candidate', rendering: null, lemmas: [{ lang: 'grk', strongs: null, translit: null, lemma: 'b' }], senses: [], rationale: null, refs: [], notes: [], decided: null },
    { id: 'c', status: 'candidate', rendering: 'y', lemmas: [{ lang: 'grk', strongs: 'G2', translit: null, lemma: 'c' }], senses: [], rationale: null, refs: [], notes: [], decided: null },
  ],
} as Dict

describe('dictStats', () => {
  test('counts entries by status', () => {
    const s = dictStats(dict)
    expect(s.byStatus).toEqual({ candidate: 2, decided: 1, applied: 0 })
  })

  test('counts missing strongs and missing renderings', () => {
    const s = dictStats(dict)
    expect(s.missingStrongs).toBe(1)
    expect(s.missingRendering).toBe(1)
  })
})

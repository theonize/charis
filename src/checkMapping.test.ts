import { describe, expect, test } from 'vitest'
import { checkMapping } from './checkMapping.js'
import type { Dict } from './dict.js'
import type { Verse } from './corpus.js'

const v = (book: string, ch: number, vs: number, text: string): Verse => ({
  coord: { book, chapter: ch, verse: vs },
  bookNum: 1,
  text,
})

const corpus: Verse[] = [
  v('GEN', 1, 1, 'The firstfruits: created Elohiym the heavens and the earth.'),
  v('GEN', 1, 2, 'and the earth was waste'),
  v('PS', 30, 4, 'Sing to Yahweh, ye saints of His.'),
]

const lemmas: Record<string, string[]> = {
  'GEN/1:1': ['H7225', 'H1254', 'H430'],
  'GEN/1:2': ['H776'],
  'PS/30:4': ['H2623', 'H3068'],
}

const entry = (over: object) => ({
  id: 'x', rendering: 'x', status: 'applied', senses: [], rationale: 'r',
  refs: [], notes: [], decided: null, lemmas: [], ...over,
})

const dict = (...entries: object[]) => ({ version: 1, entries } as unknown as Dict)

describe('checkMapping (I1)', () => {
  test('applied entry present everywhere its strongs occurs → no errors', () => {
    const d = dict(entry({ id: 'firstfruit', rendering: 'firstfruit', lemmas: [{ lang: 'heb', strongs: 'H7225', translit: null, lemma: null }] }))
    const r = checkMapping(d, corpus, lemmas)
    expect(r.errors).toEqual([])
  })

  test('applied entry missing where its strongs occurs → error naming the verse', () => {
    const d = dict(entry({ id: 'chasid', rendering: 'devoted', lemmas: [{ lang: 'heb', strongs: 'H2623', translit: null, lemma: null }] }))
    const r = checkMapping(d, corpus, lemmas)
    expect(r.errors.some(e => /PS\/30:4/.test(e) && /chasid|devoted/.test(e))).toBe(true)
  })

  test('decided (not yet applied) entry misses are warnings, not errors', () => {
    const d = dict(entry({ id: 'chasid', rendering: 'devoted', status: 'decided', lemmas: [{ lang: 'heb', strongs: 'H2623', translit: null, lemma: null }] }))
    const r = checkMapping(d, corpus, lemmas)
    expect(r.errors).toEqual([])
    expect(r.warnings.some(w => /PS\/30:4/.test(w))).toBe(true)
  })

  test('rendering matches conjugations via stem prefix', () => {
    const d = dict(entry({ id: 'firstfruit', rendering: 'firstfruit', lemmas: [{ lang: 'heb', strongs: 'H7225', translit: null, lemma: null }] }))
    // corpus has "firstfruits" (plural) — must count as present
    expect(checkMapping(d, corpus, lemmas).errors).toEqual([])
  })

  test('explicit forms match exactly — stem-mismatch form still counts as present', () => {
    const corpus2 = [v('JOB', 1, 1, 'the fire shall be quenched tonight')]
    const lem = { 'JOB/1:1': ['H3518'] }
    const d = dict(entry({ id: 'kabah', rendering: 'quench', forms: ['quench', 'quenched', 'quenching'], lemmas: [{ lang: 'heb', strongs: 'H3518', translit: null, lemma: null }] }))
    expect(checkMapping(d, corpus2, lem).errors).toEqual([])
  })

  test('with forms declared, a non-listed conjugation is a miss', () => {
    const corpus2 = [v('JOB', 1, 1, 'the fire is quenchable')]
    const lem = { 'JOB/1:1': ['H3518'] }
    const d = dict(entry({ id: 'kabah', rendering: 'quench', forms: ['quench', 'quenched'], lemmas: [{ lang: 'heb', strongs: 'H3518', translit: null, lemma: null }] }))
    expect(checkMapping(d, corpus2, lem).errors.some(e => /JOB\/1:1/.test(e))).toBe(true)
  })

  test('candidate entries are skipped entirely', () => {
    const d = dict(entry({ id: 'chasid', rendering: 'devoted', status: 'candidate', lemmas: [{ lang: 'heb', strongs: 'H2623', translit: null, lemma: null }] }))
    const r = checkMapping(d, corpus, lemmas)
    expect(r.errors).toEqual([])
    expect(r.warnings).toEqual([])
  })

  test('verses with no lemma data are reported once as coverage warning, not per-entry', () => {
    const d = dict(entry({ id: 'firstfruit', rendering: 'firstfruit', lemmas: [{ lang: 'heb', strongs: 'H7225', translit: null, lemma: null }] }))
    const r = checkMapping(d, [...corpus, v('GEN', 1, 3, 'no lemma data here')], lemmas)
    expect(r.warnings.filter(w => /no lemma data/.test(w))).toHaveLength(1)
  })
})

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

  describe('alternates and assignments', () => {
    const corpus2 = [v('GEN', 12, 1, 'Go from thy land'), v('GEN', 1, 2, 'and the earth was waste')]
    const lem = { 'GEN/12:1': ['H776'], 'GEN/1:2': ['H776'] }
    const senses = [{ id: 'land', definition: 'd', rendering: 'land', definingRefs: ['GEN/12:1'] }]
    const erets = dict(entry({ id: 'erets', rendering: 'earth', senses, lemmas: [{ lang: 'heb', strongs: 'H776', translit: null, lemma: null }] }))

    test('an alternate counts where assign.json selects it', () => {
      const assign = { version: 1, assignments: { erets: { 'GEN/12:1': ['land'] } } }
      expect(checkMapping(erets, corpus2, lem, assign).errors).toEqual([])
    })

    test('unassigned verse expects the primary — an alternate there is a miss', () => {
      expect(checkMapping(erets, corpus2, lem).errors.some(e => /GEN\/12:1.*"earth"/.test(e))).toBe(true)
    })

    test('a lemma bound to one term expects that term', () => {
      const corpus3 = [v('JOHN', 1, 14, 'the Word became flesh')]
      const d = dict(entry({
        id: 'hayah', rendering: 'be',
        senses: [{ id: 'become', definition: 'd', rendering: 'become', definingRefs: ['JOHN/1:14'], forms: ['become', 'became'] }],
        lemmas: [
          { lang: 'heb', strongs: 'H1961', translit: null, lemma: null },
          { lang: 'grk', strongs: 'G1096', translit: null, lemma: 'γίνομαι', terms: ['become'] },
        ],
      }))
      expect(checkMapping(d, corpus3, { 'JOHN/1:14': ['γίνομαι'] }).errors).toEqual([])
    })

    test('supplied [bracketed] text never satisfies a lemma', () => {
      const corpus4 = [v('GEN', 1, 2, 'and the [earth] was waste')]
      expect(checkMapping(erets, corpus4, { 'GEN/1:2': ['H776'] }).errors.length).toBe(1)
    })
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

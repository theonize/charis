import { describe, expect, test } from 'vitest'
import { imputeRendering } from './impute.js'
import type { Verse } from './corpus.js'

const v = (book: string, ch: number, vs: number, text: string): Verse => ({
  coord: { book, chapter: ch, verse: vs },
  bookNum: 1,
  text,
})

const corpus: Verse[] = [
  v('GEN', 1, 1, 'In the beginning God created the heaven and the earth.'),
  v('GEN', 1, 27, 'And God said, I am the God of gods.'),
  v('PS', 30, 4, 'Sing praise, ye saints.'),
  v('EX', 15, 11, 'Who is like thee, O God, among the gods?'),
  v('GEN', 5, 5, 'already sings of Elohiym here.'),
]

const lemmas: Record<string, string[]> = {
  'GEN/1:1': ['H7225', 'H1254', 'H430'],
  'GEN/1:27': ['H430'],
  'PS/30:4': ['H2623'],
  'EX/15:11': ['H430', 'H410'],
  'GEN/5:5': ['H430'],
}

const opts = {
  keys: ['H430'],
  replace: ['God', 'gods', 'Elohiym'],
  rendering: 'Elohim',
  ambiguousWith: ['H410', 'H433'],
}

describe('imputeRendering', () => {
  test('replaces whole-word source terms only in lemma-matched verses', () => {
    const r = imputeRendering(corpus, lemmas, opts)
    const gen11 = r.changed.find(c => c.coord.book === 'GEN' && c.coord.verse === 1)!
    expect(gen11.after).toBe('In the beginning Elohim created the heaven and the earth.')
  })

  test('preserves case: God→Elohim, gods→elohim', () => {
    const r = imputeRendering(corpus, lemmas, opts)
    const gen127 = r.changed.find(c => c.coord.chapter === 1 && c.coord.verse === 27)!
    expect(gen127.after).toBe('And Elohim said, I am the Elohim of elohim.')
  })

  test('does not touch verses without the lemma', () => {
    const r = imputeRendering(corpus, lemmas, opts)
    expect(r.changed.some(c => c.coord.book === 'PS')).toBe(false)
  })

  test('skips verses also containing ambiguous sibling lemmas, reporting them', () => {
    const r = imputeRendering(corpus, lemmas, opts)
    expect(r.changed.some(c => c.coord.book === 'EX')).toBe(false)
    expect(r.ambiguous.map(a => a.coord.book)).toContain('EX')
  })

  test('normalizes variant spellings already imputed (Elohiym → Elohim)', () => {
    const r = imputeRendering(corpus, lemmas, opts)
    const gen55 = r.changed.find(c => c.coord.chapter === 5)!
    expect(gen55.after).toBe('already sings of Elohim here.')
  })

  test('lemma-matched verses with no replaceable term are reported as residue', () => {
    const extra = [...corpus, v('JOB', 1, 1, 'a verse mentioning the Almighty only')]
    const r = imputeRendering(extra, { ...lemmas, 'JOB/1:1': ['H430'] }, opts)
    expect(r.residue.map(x => x.coord.book)).toContain('JOB')
  })
})

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

// Verbs: one lemma is one English word, but that word inflects. A single
// rendering string cannot serve "prepared"→created and "preparing"→creating,
// so replace terms may name their target form explicitly as `old=new`.
describe('imputeRendering — per-form targets (verbs)', () => {
  const verbCorpus: Verse[] = [
    v('GEN', 1, 1, 'In beginning prepared Elohim the heavens.'),
    v('GEN', 1, 21, 'And Elohim prepareth the great monsters.'),
    v('ISAH', 45, 7, 'Forming light, and preparing darkness.'),
    v('ISAH', 40, 28, 'Yahweh, Preparer of the ends of the earth.'),
    v('PSLM', 89, 47, 'Wherefore in vain hast Thou created all the sons of men?'),
  ]
  const verbLemmas: Record<string, string[]> = {
    'GEN/1:1': ['H1254'],
    'GEN/1:21': ['H1254'],
    'ISAH/45:7': ['H1254'],
    'ISAH/40:28': ['H1254'],
    'PSLM/89:47': ['H1254'],
  }
  const verbOpts = {
    keys: ['H1254'],
    replace: [
      'prepared=created',
      'prepareth=createth',
      'preparing=creating',
      'preparer=Creator',
    ],
    rendering: 'create',
  }

  test('maps each source token to its own target form', () => {
    const r = imputeRendering(verbCorpus, verbLemmas, verbOpts)
    const by = (book: string, verse: number) =>
      r.changed.find(c => c.coord.book === book && c.coord.verse === verse)!.after
    expect(by('GEN', 1)).toBe('In beginning created Elohim the heavens.')
    expect(by('GEN', 21)).toBe('And Elohim createth the great monsters.')
    expect(by('ISAH', 7)).toBe('Forming light, and creating darkness.')
  })

  test('preserves leading case per token, including capitalized participles', () => {
    const r = imputeRendering(verbCorpus, verbLemmas, verbOpts)
    const isah4028 = r.changed.find(c => c.coord.book === 'ISAH' && c.coord.verse === 28)!
    expect(isah4028.after).toBe('Yahweh, Creator of the ends of the earth.')
  })

  test('a bare replace term still falls back to the entry rendering', () => {
    const r = imputeRendering(
      [v('EZEK', 21, 19, 'a station prepare thou')],
      { 'EZEK/21:19': ['H1254'] },
      { ...verbOpts, replace: ['prepare'] },
    )
    expect(r.changed[0]!.after).toBe('a station create thou')
  })

  test('verses already carrying a correct form are residue, not changes', () => {
    const r = imputeRendering(verbCorpus, verbLemmas, verbOpts)
    expect(r.residue.map(x => x.coord.book)).toContain('PSLM')
    expect(r.changed.some(c => c.coord.book === 'PSLM')).toBe(false)
  })

  test('mixed bare and paired terms coexist', () => {
    const r = imputeRendering(
      [v('GEN', 2, 3, 'which Elohim had prepared, and did prepare again')],
      { 'GEN/2:3': ['H1254'] },
      { ...verbOpts, replace: ['prepared=created', 'prepare'] },
    )
    expect(r.changed[0]!.after).toBe('which Elohim had created, and did create again')
  })
})

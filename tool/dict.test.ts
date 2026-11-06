import { describe, expect, test } from 'vitest'
import { lintDict, type Dict } from './dict.js'

const entry = (over: object) => ({
  id: 'sample',
  rendering: 'sample',
  status: 'candidate',
  lemmas: [{ lang: 'heb', strongs: 'H1', translit: null, lemma: 'x' }],
  senses: [],
  rationale: null,
  refs: [],
  notes: [],
  decided: null,
  ...over,
})

const dict = (...entries: object[]): Dict =>
  ({ version: 1, entries } as unknown as Dict)

describe('lintDict schema errors', () => {
  test('clean dict yields no errors', () => {
    const r = lintDict(dict(entry({})))
    expect(r.errors).toEqual([])
  })

  test('bad status is an error', () => {
    const r = lintDict(dict(entry({ status: 'done' })))
    expect(r.errors.some(e => /status/.test(e))).toBe(true)
  })

  test('decided entry without rationale is an error (I6)', () => {
    const r = lintDict(dict(entry({ status: 'decided' })))
    expect(r.errors.some(e => /rationale/.test(e))).toBe(true)
  })

  test('bad strongs format is an error', () => {
    const r = lintDict(dict(entry({ lemmas: [{ lang: 'heb', strongs: 'X99', translit: null, lemma: null }] })))
    expect(r.errors.length).toBeGreaterThan(0)
  })
})

describe('forms field', () => {
  test('entry may carry explicit conjugation forms', () => {
    const r = lintDict(dict(entry({ forms: ['quench', 'quenched', 'quenching'] })))
    expect(r.errors).toEqual([])
  })

  test('non-array forms is a schema error', () => {
    const r = lintDict(dict(entry({ forms: 'quenched' })))
    expect(r.errors.length).toBeGreaterThan(0)
  })
})

describe('lintDict cross-field rules', () => {
  test('duplicate ids are an error', () => {
    const r = lintDict(dict(entry({}), entry({ rendering: 'other' })))
    expect(r.errors.some(e => /duplicate id/i.test(e))).toBe(true)
  })

  test('same strongs claimed twice is an error (I1)', () => {
    const r = lintDict(dict(entry({}), entry({ id: 'two', rendering: 'other' })))
    expect(r.errors.some(e => /H1.*claimed/i.test(e))).toBe(true)
  })

  test('greek lemma with H-number is an error', () => {
    const r = lintDict(dict(entry({ lemmas: [{ lang: 'grk', strongs: 'H7', translit: null, lemma: null }] })))
    expect(r.errors.some(e => /grk.*H7|H7.*grk/i.test(e))).toBe(true)
  })

  const grk2 = [{ lang: 'grk', strongs: 'G2', translit: null, lemma: null }]
  const sense = (rendering: string) => ({ id: rendering, definition: 'd', rendering, definingRefs: ['GEN/1:1'] })

  test('rendering collision across entries is an error — I2 is absolute', () => {
    const r = lintDict(dict(entry({}), entry({ id: 'two', lemmas: grk2 })))
    expect(r.errors.some(e => /"sample".*already owned by "sample"/.test(e))).toBe(true)
  })

  test('collision is case-insensitive', () => {
    const r = lintDict(dict(entry({}), entry({ id: 'two', rendering: 'Sample', lemmas: grk2 })))
    expect(r.errors.some(e => /I2/.test(e))).toBe(true)
  })

  test('a listed form colliding with another entry is an error', () => {
    const r = lintDict(dict(
      entry({ rendering: 'create', forms: ['create', 'creation'] }),
      entry({ id: 'two', rendering: 'creation', lemmas: grk2 }),
    ))
    expect(r.errors.some(e => /"creation".*I2/.test(e))).toBe(true)
  })

  test('one source term may own several English terms (alternates via senses)', () => {
    const r = lintDict(dict(entry({ rendering: 'earth', senses: [sense('land')] })))
    expect(r.errors).toEqual([])
  })

  test('an alternate colliding with another entry is an error', () => {
    const r = lintDict(dict(
      entry({ rendering: 'earth', senses: [sense('land')] }),
      entry({ id: 'two', rendering: 'land', lemmas: grk2 }),
    ))
    expect(r.errors.some(e => /"land".*I2/.test(e))).toBe(true)
  })

  test('hebrew + greek correspondent in one entry is one source term', () => {
    const r = lintDict(dict(entry({ lemmas: [{ lang: 'heb', strongs: 'H1', translit: null, lemma: 'x' }, ...grk2] })))
    expect(r.errors).toEqual([])
  })

  test('two lemmas of one language in an entry is an error (P1)', () => {
    const r = lintDict(dict(entry({ lemmas: [
      { lang: 'heb', strongs: 'H1', translit: null, lemma: 'x' },
      { lang: 'heb', strongs: 'H3', translit: null, lemma: 'y' },
    ] })))
    expect(r.errors.some(e => /2 heb lemmas/.test(e))).toBe(true)
  })

  test('lemma with neither name nor translit is a warning', () => {
    const r = lintDict(dict(entry({ lemmas: [{ lang: 'grk', strongs: 'G9', translit: null, lemma: null }] })))
    expect(r.warnings.some(w => /neither lemma nor translit/i.test(w))).toBe(true)
  })

  test('missing strongs is a warning, not an error', () => {
    const r = lintDict(dict(entry({ lemmas: [{ lang: 'heb', strongs: null, translit: null, lemma: 'y' }] })))
    expect(r.errors).toEqual([])
    expect(r.warnings.some(w => /strongs/i.test(w))).toBe(true)
  })
})

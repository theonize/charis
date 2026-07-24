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

  test('rendering collision across entries is a warning (I2)', () => {
    const r = lintDict(dict(
      entry({}),
      entry({ id: 'two', lemmas: [{ lang: 'grk', strongs: 'G2', translit: null, lemma: null }] }),
    ))
    expect(r.warnings.some(w => /collision|also used/i.test(w))).toBe(true)
    expect(r.errors).toEqual([])
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

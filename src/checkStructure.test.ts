import { describe, expect, test } from 'vitest'
import { checkStructure } from './checkStructure.js'
import type { Verse } from './corpus.js'

const v = (book: string, ch: number, vs: number, text = 'word', bookNum = 1): Verse => ({
  coord: { book, chapter: ch, verse: vs },
  bookNum,
  text,
})

describe('checkStructure', () => {
  test('clean continuous corpus has no problems', () => {
    const r = checkStructure([v('GEN', 1, 1), v('GEN', 1, 2), v('GEN', 2, 1)])
    expect(r.errors).toEqual([])
  })

  test('detects duplicate verse', () => {
    const r = checkStructure([v('GEN', 1, 1), v('GEN', 1, 1)])
    expect(r.errors.some(e => /duplicate/i.test(e))).toBe(true)
  })

  test('detects verse gap within a chapter', () => {
    const r = checkStructure([v('GEN', 1, 1), v('GEN', 1, 3)])
    expect(r.errors.some(e => /gap|missing/i.test(e))).toBe(true)
  })

  test('detects chapter gap within a book', () => {
    const r = checkStructure([v('GEN', 1, 1), v('GEN', 3, 1)])
    expect(r.errors.some(e => /chapter/i.test(e))).toBe(true)
  })

  test('detects chapter not starting at verse 1', () => {
    const r = checkStructure([v('GEN', 1, 2)])
    expect(r.errors.some(e => /verse 1/i.test(e))).toBe(true)
  })

  test('flags empty verse text as warning', () => {
    const r = checkStructure([v('GEN', 1, 1, '')])
    expect(r.warnings.some(w => /empty/i.test(w))).toBe(true)
  })
})

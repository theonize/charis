import { describe, expect, test } from 'vitest'
import { toAppJson, buildBookNames } from './appData.js'
import type { Verse } from './corpus.js'

const v = (book: string, ch: number, vs: number, text: string): Verse => ({
  coord: { book, chapter: ch, verse: vs },
  bookNum: 1,
  text,
})

const names = new Map([
  ['GEN', 'Genesis'],
  ['THES/1', '1 Thessalonians'],
])

describe('toAppJson', () => {
  test('produces book-name-keyed, 0-indexed chapter/verse arrays', () => {
    const out = toAppJson(
      [v('GEN', 1, 1, 'first'), v('GEN', 1, 2, 'second'), v('GEN', 2, 1, 'ch2')],
      names,
    )
    expect(out['Genesis']![0]).toEqual(['first', 'second'])
    expect(out['Genesis']![1]).toEqual(['ch2'])
  })

  test('maps suffix-numbered book codes through the name table', () => {
    const out = toAppJson([v('THES/1', 1, 1, 'thess')], names)
    expect(out['1 Thessalonians']![0]).toEqual(['thess'])
  })

  test('unknown book code throws rather than silently dropping text', () => {
    expect(() => toAppJson([v('XX', 1, 1, 'x')], names)).toThrow(/unknown/i)
  })
})

describe('buildBookNames', () => {
  test('joins books.json (name->num) with BOOK.txt (num code) into code->name', () => {
    const map = buildBookNames(
      { Genesis: 1, '1 Thessalonians': 52 },
      '1 GEN\n52 THES/1\n',
    )
    expect(map.get('GEN')).toBe('Genesis')
    expect(map.get('THES/1')).toBe('1 Thessalonians')
  })

  test('aliases EX to BOOK.txt\'s EXO (bible.csv uses EX)', () => {
    const map = buildBookNames({ Exodus: 2 }, '2 EXO\n')
    expect(map.get('EX')).toBe('Exodus')
  })
})

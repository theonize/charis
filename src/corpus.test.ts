import { describe, expect, test } from 'vitest'
import { parseBibleCsv, type Verse } from './corpus.js'

const SAMPLE = [
  '﻿ID,book,bk,ch,vs,field',
  'GEN/1:1,GEN,1,1,1,The firsfruits: created Elohiym the heavens and the earth.',
  'GEN/1:2,GEN,1,2,2,"and the earth, it was waste and void"',
  'GEN/1:3,GEN,1,1,3,and Elohiym said let light be and light is.',
].join('\n')

describe('parseBibleCsv', () => {
  test('parses verses with coord and text', () => {
    const verses = parseBibleCsv(SAMPLE)
    expect(verses).toHaveLength(3)
    const v = verses[0] as Verse
    expect(v.coord).toEqual({ book: 'GEN', chapter: 1, verse: 1 })
    expect(v.text).toBe('The firsfruits: created Elohiym the heavens and the earth.')
    expect(v.bookNum).toBe(1)
  })

  test('strips BOM and header row', () => {
    const verses = parseBibleCsv(SAMPLE)
    expect(verses[0]!.coord.book).toBe('GEN')
  })

  test('handles quoted text containing commas', () => {
    const verses = parseBibleCsv(SAMPLE)
    expect(verses[1]!.text).toBe('and the earth, it was waste and void')
  })

  test('handles unquoted text containing commas (legacy rows)', () => {
    const verses = parseBibleCsv('ID,book,bk,ch,vs,field\nGEN/2:1,GEN,1,2,1,alpha, beta, gamma')
    expect(verses[0]!.text).toBe('alpha, beta, gamma')
  })

  test('skips blank lines', () => {
    const verses = parseBibleCsv(SAMPLE + '\n\n')
    expect(verses).toHaveLength(3)
  })
})

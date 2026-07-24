import { describe, expect, test } from 'vitest'
import { parseCsvId, parseXrefRef, formatCoord, type Coord } from './coords.js'

describe('parseCsvId', () => {
  test('parses bible.csv ID "GEN/1:1"', () => {
    expect(parseCsvId('GEN/1:1')).toEqual({ book: 'GEN', chapter: 1, verse: 1 })
  })

  test('parses multi-digit chapter/verse "PS/119:176"', () => {
    expect(parseCsvId('PS/119:176')).toEqual({ book: 'PS', chapter: 119, verse: 176 })
  })

  test('parses suffix-numbered book id "THES/1/1:1" (1 Thessalonians)', () => {
    expect(parseCsvId('THES/1/1:1')).toEqual({ book: 'THES/1', chapter: 1, verse: 1 })
  })

  test('round-trips suffix-numbered book through formatCoord', () => {
    expect(formatCoord(parseCsvId('JOHN/3/1:14'))).toBe('JOHN/3/1:14')
  })

  test('rejects malformed id', () => {
    expect(() => parseCsvId('GEN-1-1')).toThrow(/malformed/i)
  })
})

describe('parseXrefRef', () => {
  test('parses single ref "Gen.1.1"', () => {
    expect(parseXrefRef('Gen.1.1')).toEqual([{ book: 'GEN', chapter: 1, verse: 1 }])
  })

  test('parses range "Prov.8.22-Prov.8.30" inclusively', () => {
    const coords = parseXrefRef('Prov.8.22-Prov.8.30')
    expect(coords).toHaveLength(9)
    expect(coords[0]).toEqual({ book: 'PROV', chapter: 8, verse: 22 })
    expect(coords[8]).toEqual({ book: 'PROV', chapter: 8, verse: 30 })
  })

  test('parses numbered book "1Cor.13.4"', () => {
    expect(parseXrefRef('1Cor.13.4')).toEqual([{ book: '1COR', chapter: 13, verse: 4 }])
  })
})

describe('formatCoord', () => {
  test('formats to canonical bible.csv ID form', () => {
    const c: Coord = { book: 'GEN', chapter: 1, verse: 1 }
    expect(formatCoord(c)).toBe('GEN/1:1')
  })
})

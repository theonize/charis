import { describe, expect, test } from 'vitest'
import { parseXrefCsv } from './xref.js'

const SAMPLE = [
  '﻿From Verse,To Verse',
  'Gen.1.1,Prov.8.22-Prov.8.30',
  'Gen.1.1,Ps.102.25',
  'Gen.1.1,Gen.2.4-Gen.3.1',
].join('\n')

describe('parseXrefCsv', () => {
  test('parses pairs, expanding same-chapter ranges', () => {
    const { pairs } = parseXrefCsv(SAMPLE)
    const first = pairs[0]!
    expect(first.from).toEqual([{ book: 'GEN', chapter: 1, verse: 1 }])
    expect(first.to).toHaveLength(9)
  })

  test('single-verse pair parses to one coord each side', () => {
    const { pairs } = parseXrefCsv(SAMPLE)
    expect(pairs[1]!.to).toEqual([{ book: 'PS', chapter: 102, verse: 25 }])
  })

  test('cross-chapter ranges are skipped with a note, not fatal', () => {
    const { pairs, skipped } = parseXrefCsv(SAMPLE)
    expect(pairs).toHaveLength(2)
    expect(skipped).toHaveLength(1)
    expect(skipped[0]).toMatch(/Gen\.2\.4/)
  })
})

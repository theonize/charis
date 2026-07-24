import { describe, expect, test } from 'vitest'
import { checkAlignment } from './checkAlignment.js'
import type { Verse } from './corpus.js'

const v = (text: string): Verse => ({
  coord: { book: 'JOSH', chapter: 22, verse: 22 },
  bookNum: 6,
  text,
})

// Family: source lemma key → rendering (the El/Eloah/Elohim case)
const family = new Map([
  ['H410', 'El'],
  ['H433', 'Eloah'],
  ['H430', 'Elohim'],
])

describe('checkAlignment', () => {
  test('token order matching source lemma order passes', () => {
    const r = checkAlignment(v('El Elohim Yahweh is knowing'), ['H410', 'H430', 'H3068'], family)
    expect(r.ok).toBe(true)
  })

  test('swapped tokens fail with a describing message', () => {
    const r = checkAlignment(v('Elohim El Yahweh is knowing'), ['H410', 'H430', 'H3068'], family)
    expect(r.ok).toBe(false)
    expect(r.problem).toMatch(/expected "El".*found "Elohim"/i)
  })

  test('token count below lemma count fails', () => {
    const r = checkAlignment(v('El only here'), ['H410', 'H430'], family)
    expect(r.ok).toBe(false)
    expect(r.problem).toMatch(/2 .*lemmas.*1 .*tokens/i)
  })

  test('extra family token beyond lemma count fails', () => {
    const r = checkAlignment(v('El Elohim and Elohim again'), ['H410', 'H430'], family)
    expect(r.ok).toBe(false)
  })

  test('matching is case-insensitive on tokens (elohim = Elohim)', () => {
    const r = checkAlignment(v('to the elohim of El'), ['H430', 'H410'], family)
    expect(r.ok).toBe(true)
  })

  test('non-family lemmas and words are ignored', () => {
    const r = checkAlignment(v('and Eloah spake wonders'), ['H1696', 'H433', 'H6381'], family)
    expect(r.ok).toBe(true)
  })
})

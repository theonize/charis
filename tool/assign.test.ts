import { describe, expect, test } from 'vitest'
import { checkAssign, expectedTerms, type Assign } from './assign.js'
import type { Dict, Entry } from './dict.js'

const hayah = {
  id: 'hayah', rendering: 'be', status: 'candidate', rationale: null, refs: [], notes: [], decided: null,
  senses: [{ id: 'become', definition: 'd', rendering: 'become', definingRefs: ['GEN/2:7'] }],
  lemmas: [
    { lang: 'heb', strongs: 'H1961', translit: null, lemma: 'hayah' },
    { lang: 'grk', strongs: 'G1510', translit: null, lemma: 'εἰμί', terms: ['be'] },
    { lang: 'grk', strongs: 'G1096', translit: null, lemma: 'γίνομαι', terms: ['become'] },
  ],
} as unknown as Entry

const dict = { version: 1, entries: [hayah] } as unknown as Dict
const lemmas = { 'GEN/2:7': ['H3335', 'H1961', 'H1961'], 'JOHN/1:14': ['λόγος', 'γίνομαι'], 'GEN/1:1': ['H7225'] }
const assign = (verses: Record<string, string[]>): Assign => ({ version: 1, assignments: { hayah: verses } })

describe('expectedTerms', () => {
  test('unassigned occurrences take the default: primary, or the lemma\'s bound term', () => {
    expect(expectedTerms(hayah, 'GEN/2:7', lemmas['GEN/2:7'], assign({}))).toEqual(['be', 'be'])
    expect(expectedTerms(hayah, 'JOHN/1:14', lemmas['JOHN/1:14'], assign({}))).toEqual(['become'])
  })

  test('an assignment selects per occurrence, in source order', () => {
    expect(expectedTerms(hayah, 'GEN/2:7', lemmas['GEN/2:7'], assign({ 'GEN/2:7': ['be', 'become'] }))).toEqual(['be', 'become'])
  })
})

describe('checkAssign', () => {
  test('valid assignment passes', () => {
    expect(checkAssign(dict, assign({ 'GEN/2:7': ['be', 'become'] }), lemmas).errors).toEqual([])
  })

  test('unknown entry is an error', () => {
    const r = checkAssign(dict, { version: 1, assignments: { nope: {} } }, lemmas)
    expect(r.errors.some(e => /no such dict entry/.test(e))).toBe(true)
  })

  test('term count must equal occurrence count', () => {
    const r = checkAssign(dict, assign({ 'GEN/2:7': ['become'] }), lemmas)
    expect(r.errors.some(e => /1 terms for 2 occurrence/.test(e))).toBe(true)
  })

  test('verse without the entry\'s lemmas is an error', () => {
    const r = checkAssign(dict, assign({ 'GEN/1:1': ['be'] }), lemmas)
    expect(r.errors.some(e => /none of the entry's lemmas/.test(e))).toBe(true)
  })

  test('a term outside the occurrence\'s binding is an error', () => {
    const r = checkAssign(dict, assign({ 'JOHN/1:14': ['be'] }), lemmas)
    expect(r.errors.some(e => /γίνομαι.*assigned "be"/.test(e))).toBe(true)
  })

  test('non-array assignment is an error, not a crash', () => {
    const r = checkAssign(dict, assign({ 'GEN/2:7': 'become' as unknown as string[] }), lemmas)
    expect(r.errors.some(e => /array of non-empty term strings/.test(e))).toBe(true)
  })

  test('an all-default assignment is flagged redundant', () => {
    const r = checkAssign(dict, assign({ 'GEN/2:7': ['be', 'be'] }), lemmas)
    expect(r.warnings.some(w => /redundant/.test(w))).toBe(true)
  })
})

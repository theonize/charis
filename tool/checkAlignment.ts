import type { Verse } from './corpus.js'

export interface AlignmentResult {
  ok: boolean
  problem?: string
}

/**
 * Word-level I1 for lemma families sharing an English history (El/Eloah/Elohim).
 * Uses lemma ORDER from data/lemmas.json (build-lemmas preserves source word
 * order): the sequence of family renderings in the verse text must equal the
 * sequence of family lemmas in the source. This is the verifier that makes
 * hand/AI edits of ambiguous verses checkable.
 */
export function checkAlignment(
  verse: Verse,
  sourceLemmas: string[],
  family: Map<string, string>,
): AlignmentResult {
  const expected = sourceLemmas.filter(l => family.has(l)).map(l => family.get(l)!)

  const renderings = [...new Set(family.values())]
  const re = new RegExp(`\\b(${renderings.join('|')})\\b`, 'gi')
  const found = verse.text.match(re) ?? []

  if (expected.length !== found.length)
    return {
      ok: false,
      problem: `${expected.length} family lemmas but ${found.length} family tokens in text`,
    }

  for (let i = 0; i < expected.length; i++) {
    if (expected[i]!.toLowerCase() !== found[i]!.toLowerCase())
      return {
        ok: false,
        problem: `position ${i + 1}: expected "${expected[i]}" (source order), found "${found[i]}"`,
      }
  }

  return { ok: true }
}

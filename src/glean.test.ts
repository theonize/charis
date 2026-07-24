import { describe, expect, test } from 'vitest'
import { glean } from './glean.js'
import type { Verse } from './corpus.js'

const v = (book: string, ch: number, vs: number, text: string): Verse => ({
  coord: { book, chapter: ch, verse: vs },
  bookNum: 1,
  text,
})

const CORPUS: Verse[] = [
  v('GEN', 1, 1, 'The firstfruits: created Elohiym the heavens and the earth.'),
  v('GEN', 1, 3, 'and Elohiym said let light be and light is.'),
  v('PS', 30, 4, 'Sing to Yahweh, ye devoted ones of His.'),
  v('MATT', 1, 1, 'A record of the generation of Yeshua.'),
]

describe('glean', () => {
  test('finds whole-word matches with coords', () => {
    const hits = glean(CORPUS, 'Elohiym')
    expect(hits.map(h => `${h.coord.book}/${h.coord.chapter}:${h.coord.verse}`))
      .toEqual(['GEN/1:1', 'GEN/1:3'])
  })

  test('is case-insensitive by default', () => {
    expect(glean(CORPUS, 'elohiym')).toHaveLength(2)
  })

  test('matches whole words only — "light" does not match "lights"', () => {
    expect(glean([v('X', 1, 1, 'the lights above')], 'light')).toHaveLength(0)
  })

  test('conjugations flag matches word stems — "devoted" matches "devoted ones"', () => {
    const hits = glean(CORPUS, 'devoted', { prefix: true })
    expect(hits).toHaveLength(1)
  })

  test('reports every occurrence position within a verse', () => {
    const hits = glean([v('X', 1, 1, 'light against light')], 'light')
    expect(hits[0]!.count).toBe(2)
  })

  test('regex metacharacters in the term are treated literally', () => {
    expect(() => glean(CORPUS, 'a.b(c')).not.toThrow()
  })
})

import { describe, expect, test } from 'vitest'
import { translitHebrew, translitGreek } from './translit.js'

describe('translitHebrew', () => {
  test('transliterates pointed ראשית to RA$\'+ (attested example)', () => {
    expect(translitHebrew('רֵאשִׁ֖ית')).toBe("RA$'+")
  })

  test('transliterates אלהים to ALH\'M (attested example)', () => {
    expect(translitHebrew('אֱלֹהִ֑ים')).toBe("ALH'M")
  })

  test('final forms map like medial: מ and ם both M', () => {
    expect(translitHebrew('מם')).toBe('MM')
  })

  test('distinguishes shin from sin despite point stripping', () => {
    expect(translitHebrew('שׁ')).toBe('$')
    expect(translitHebrew('שׂ')).toBe('&')
  })

  test('tet maps to ratified 9', () => {
    expect(translitHebrew('ט')).toBe('9')
  })
})

describe('translitGreek', () => {
  test('transliterates τηρέω to tyrew (attested example)', () => {
    expect(translitGreek('τηρέω')).toBe('tyrew')
  })

  test('transliterates ἀπαρχή to aparxy (attested example)', () => {
    expect(translitGreek('ἀπαρχή')).toBe('aparxy')
  })

  test('rough breathing becomes leading h', () => {
    expect(translitGreek('ὑπόστασις')).toBe('hupostasis')
  })

  test('digraph letters: θ→th, ψ→ps, ξ→ks', () => {
    expect(translitGreek('θξψ')).toBe('thksps')
  })

  test('final sigma maps like medial', () => {
    expect(translitGreek('λόγος')).toBe('logos')
  })

  test('preserves capitalization', () => {
    expect(translitGreek('Ἰησοῦς')).toBe('Iysous')
  })
})

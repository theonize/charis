import { describe, expect, test } from 'vitest'
import {
  parseOshbXml,
  parseMorphGnt,
  parseVerseMap,
  oshbBookToCharis,
  morphGntFileToCharis,
} from './sources.js'

const OSHB_SAMPLE = `
<verse osisID="Gen.1.1">
  <w lemma="b/7225" n="1.0" morph="HR/Ncfsa" id="01xeN">בְּ/רֵאשִׁ֖ית</w>
  <w lemma="1254 a" morph="HVqp3ms" id="01Nvk">בָּרָ֣א</w>
  <w lemma="430" n="1" morph="HNcmpa" id="01TyA">אֱלֹהִ֑ים</w>
</verse>
<verse osisID="Gen.1.2">
  <w lemma="c/d/776" morph="HC/Td/Ncbsa" id="02abc">הָאָ֗רֶץ</w>
</verse>
`

describe('parseOshbXml', () => {
  test('extracts strongs per verse, stripping prefixes and variant suffixes', () => {
    const verses = parseOshbXml(OSHB_SAMPLE, 'GEN')
    expect(verses).toHaveLength(2)
    expect(verses[0]).toEqual({
      coord: { book: 'GEN', chapter: 1, verse: 1 },
      words: [
        { strongs: 'H7225', lemma: 'b/7225' },
        { strongs: 'H1254', lemma: '1254 a' },
        { strongs: 'H430', lemma: '430' },
      ],
    })
  })

  test('multi-prefix lemma "c/d/776" yields the final number', () => {
    const verses = parseOshbXml(OSHB_SAMPLE, 'GEN')
    expect(verses[1]!.words).toEqual([{ strongs: 'H776', lemma: 'c/d/776' }])
  })
})

const MORPHGNT_SAMPLE = [
  '010101 N- ----NSF- Βίβλος Βίβλος βίβλος βίβλος',
  '010101 N- ----GSF- γενέσεως γενέσεως γενέσεως γένεσις',
  '010201 N- ----NSM- Ἀβραὰμ Ἀβραὰμ Ἀβραάμ Ἀβραάμ',
].join('\n')

describe('parseMorphGnt', () => {
  test('groups lemma words by verse coordinate', () => {
    const verses = parseMorphGnt(MORPHGNT_SAMPLE, 'MATT')
    expect(verses).toHaveLength(2)
    expect(verses[0]).toEqual({
      coord: { book: 'MATT', chapter: 1, verse: 1 },
      words: [{ lemma: 'βίβλος' }, { lemma: 'γένεσις' }],
    })
    expect(verses[1]!.coord).toEqual({ book: 'MATT', chapter: 2, verse: 1 })
  })
})

describe('parseVerseMap', () => {
  const VERSEMAP_SAMPLE = `
<book osisID="Gen">
  <verse wlc="Gen.32.1" kjv="Gen.31.55" type="full"/>
  <verse wlc="Gen.32.2" kjv="Gen.32.1" type="full"/>
  <verse wlc="Ps.3.1" kjv="Ps.3.0" type="partial"/>
</book>
`
  test('maps WLC coord ids to KJV coord ids (Charis codes)', () => {
    const map = parseVerseMap(VERSEMAP_SAMPLE)
    expect(map.get('GEN/32:1')).toEqual({ kjv: 'GEN/31:55', type: 'full' })
    expect(map.get('GEN/32:2')).toEqual({ kjv: 'GEN/32:1', type: 'full' })
  })

  test('kjv verse 0 (Psalm titles) maps to null target', () => {
    const map = parseVerseMap(VERSEMAP_SAMPLE)
    expect(map.get('PSLM/3:1')).toEqual({ kjv: null, type: 'partial' })
  })
})

describe('book code mapping', () => {
  test('maps OSHB file names to Charis codes', () => {
    expect(oshbBookToCharis('Gen')).toBe('GEN')
    expect(oshbBookToCharis('Exod')).toBe('EX')
    expect(oshbBookToCharis('Ps')).toBe('PSLM')
    expect(oshbBookToCharis('Isa')).toBe('ISAH')
    expect(oshbBookToCharis('1Sam')).toBe('1SAM')
  })

  test('maps MorphGNT file numbers to Charis codes including suffix-numbered epistles', () => {
    expect(morphGntFileToCharis(61)).toBe('MATT')
    expect(morphGntFileToCharis(73)).toBe('THES/1')
    expect(morphGntFileToCharis(83)).toBe('JOHN/1')
    expect(morphGntFileToCharis(87)).toBe('RVEL')
  })

  test('unknown book codes throw rather than silently skip', () => {
    expect(() => oshbBookToCharis('Nope')).toThrow(/unknown/i)
    expect(() => morphGntFileToCharis(99)).toThrow(/unknown/i)
  })
})

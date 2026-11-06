import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Ajv2020 } from 'ajv/dist/2020.js'
import addFormatsModule from 'ajv-formats'

const addFormats = addFormatsModule as unknown as typeof addFormatsModule.default

export type Status = 'candidate' | 'decided' | 'applied'
export type Lang = 'heb' | 'grk' | 'arc'

export interface Lemma {
  lang: Lang
  strongs: string | null
  translit: string | null
  lemma: string | null
  /**
   * English terms (headwords of this entry) this lemma carries. Omitted = all of
   * the entry's headwords. Required when the entry holds several lemmas of one
   * language: each headword binds to at most one lemma per language (P1).
   */
  terms?: string[]
}

export interface Sense {
  id: string
  definition: string
  rendering: string | null
  definingRefs: string[]
  adjudication?: string | null
  /** Explicit conjugation forms of this alternate (exact-match, like Entry.forms). */
  forms?: string[]
}

export interface Entry {
  id: string
  rendering: string | null
  status: Status
  lemmas: Lemma[]
  senses: Sense[]
  rationale: string | null
  /** Explicit conjugation forms; when present, matching is exact-form, not prefix-stem. */
  forms?: string[]
  refs: string[]
  notes: string[]
  decided: string | null
}

export interface Dict {
  version: number
  entries: Entry[]
}

export interface LintResult {
  errors: string[]
  warnings: string[]
}

const here = path.dirname(fileURLToPath(import.meta.url))
const SCHEMA_PATH = path.join(here, '..', 'scripts', 'dict.schema.json')

import type { ValidateFunction } from 'ajv'

let compiled: ValidateFunction | null = null

function schemaValidator(): ValidateFunction {
  if (!compiled) {
    const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'))
    const ajv = new Ajv2020({ allErrors: true, strict: false })
    addFormats(ajv)
    compiled = ajv.compile(schema)
  }
  return compiled
}

/**
 * Every English term an entry owns (P1/I2): primary rendering, listed forms,
 * and each sense (alternate) rendering — lowercased, deduplicated.
 */
export function ownedTerms(e: Entry): string[] {
  const terms = [e.rendering, ...(e.forms ?? []), ...(e.senses ?? []).flatMap(s => [s.rendering, ...(s.forms ?? [])])]
  return [...new Set(terms.filter((t): t is string => !!t).map(t => t.toLowerCase()))]
}

/** Declared exact forms of a headword (primary's `forms` or a sense's `forms`); empty = stem-prefix matching. */
export function termForms(e: Entry, term: string): string[] {
  const t = term.toLowerCase()
  if (t === e.rendering?.toLowerCase()) return e.forms ?? []
  return e.senses.find(s => s.rendering?.toLowerCase() === t)?.forms ?? []
}

/** Corpus key for a lemma in data/lemmas.json: Strong's for heb/arc, lemma string for grk. */
export function lemmaKey(l: Lemma): string | null {
  return l.lang === 'grk' ? l.lemma : l.strongs
}

/** Headwords an entry owns: primary rendering, then each sense (alternate) rendering — the assignable terms. */
export function headwords(e: Entry): string[] {
  const terms = [e.rendering, ...(e.senses ?? []).map(s => s.rendering)]
  return [...new Set(terms.filter((t): t is string => !!t).map(t => t.toLowerCase()))]
}

/** Headwords a given lemma of the entry carries (its `terms` binding, else all headwords). */
export function lemmaTerms(e: Entry, l: Lemma): string[] {
  return l.terms ? l.terms.map(t => t.toLowerCase()) : headwords(e)
}

/** Schema validation (draft 2020-12) + cross-field rules JSON Schema can't express. */
export function lintDict(dict: Dict): LintResult {
  const errors: string[] = []
  const warnings: string[] = []

  const validate = schemaValidator()
  if (!validate(dict)) {
    for (const e of (validate.errors ?? []) as { instancePath: string; message?: string }[])
      errors.push(`schema: ${e.instancePath || '/'} ${e.message ?? ''}`.trim())
  }

  const ids = new Set<string>()
  const strongsOwner = new Map<string, string>()
  const keyOwner = new Map<string, string>()
  const termOwner = new Map<string, string>()

  for (const e of dict.entries ?? []) {
    const tag = `entry "${e.id}"`

    if (ids.has(e.id)) errors.push(`${tag}: duplicate id`)
    ids.add(e.id)

    // P1 binding: within one language, each headword is carried by at most one lemma.
    // Several lemmas of a language are allowed only when each declares its `terms`.
    const own = new Set(headwords(e))
    const byLang = new Map<string, Lemma[]>()
    for (const l of e.lemmas ?? []) byLang.set(l.lang, [...(byLang.get(l.lang) ?? []), l])
    for (const [lang, ls] of byLang) {
      const bound = new Map<string, string>()
      for (const l of ls) {
        const name = l.lemma ?? l.strongs ?? '?'
        if (ls.length > 1 && !l.terms?.length)
          errors.push(`${tag}: ${ls.length} ${lang} lemmas — ${name} must declare its terms (each term binds to one lemma per language, P1)`)
        for (const t of l.terms?.map(x => x.toLowerCase()) ?? []) {
          if (!own.has(t)) errors.push(`${tag}: ${name} declares term "${t}", not a headword of this entry`)
          const prev = bound.get(t)
          if (prev) errors.push(`${tag}: term "${t}" bound to two ${lang} lemmas (${prev}, ${name}) — breaks reversibility (P1)`)
          else bound.set(t, name)
        }
      }
    }
    if (byLang.has('grk') && !byLang.has('heb') && !byLang.has('arc'))
      warnings.push(`${tag}: Greek lemma with no Hebrew pair — pair it where a Hebrew lemma shares its definition (P2)`)

    for (const l of e.lemmas ?? []) {
      const key = lemmaKey(l)
      if (key && l.lang === 'grk') {
        const prev = keyOwner.get(key)
        if (prev) errors.push(`${tag}: grk lemma ${key} already claimed by "${prev}"`)
        else keyOwner.set(key, e.id)
      }
      if (!l.lemma && !l.translit)
        warnings.push(`${tag}: neither lemma nor translit recorded`)
      if (l.strongs === null) {
        warnings.push(`${tag}: no strongs number recorded`)
        continue
      }
      const prefix = l.strongs[0]
      if (l.lang === 'grk' && prefix !== 'G')
        errors.push(`${tag}: grk lemma with ${l.strongs}`)
      if ((l.lang === 'heb' || l.lang === 'arc') && prefix !== 'H')
        errors.push(`${tag}: ${l.lang} lemma with ${l.strongs}`)
      const owner = strongsOwner.get(l.strongs)
      if (owner) errors.push(`${tag}: ${l.strongs} already claimed by "${owner}"`)
      else strongsOwner.set(l.strongs, e.id)
    }

    // I2 (absolute): an English term is owned by exactly one entry — no intentional-collision escape.
    for (const term of ownedTerms(e)) {
      const owner = termOwner.get(term)
      if (owner) errors.push(`${tag}: English term "${term}" already owned by "${owner}" (I2 collision)`)
      else termOwner.set(term, e.id)
    }
    if (!e.rendering && e.status === 'candidate')
      warnings.push(`${tag}: candidate with no provisional rendering`)
  }

  return { errors, warnings }
}

export function loadDict(filePath: string): Dict {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as Dict
}

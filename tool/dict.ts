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
}

export interface Sense {
  id: string
  definition: string
  rendering: string | null
  definingRefs: string[]
  adjudication?: string | null
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
  const terms = [e.rendering, ...(e.forms ?? []), ...(e.senses ?? []).map(s => s.rendering)]
  return [...new Set(terms.filter((t): t is string => !!t).map(t => t.toLowerCase()))]
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
  const termOwner = new Map<string, string>()

  for (const e of dict.entries ?? []) {
    const tag = `entry "${e.id}"`

    if (ids.has(e.id)) errors.push(`${tag}: duplicate id`)
    ids.add(e.id)

    // P1 source term = at most one lemma per language (Hebrew/Aramaic lemma + its one Greek correspondent).
    const langs = new Map<string, number>()
    for (const l of e.lemmas ?? []) langs.set(l.lang, (langs.get(l.lang) ?? 0) + 1)
    for (const [lang, n] of langs)
      if (n > 1) errors.push(`${tag}: ${n} ${lang} lemmas — a source term holds at most one lemma per language (P1)`)

    for (const l of e.lemmas ?? []) {
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

import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
export const DICT_PATH = path.join(ROOT, 'dict.json')
export const BIBLE_CSV = path.join(ROOT, 'bible.csv')
export const XREF_CSV = path.join(ROOT, 'xref.csv')

export function report(name: string, errors: string[], warnings: string[]): boolean {
  for (const w of warnings) console.log(`WARN  ${w}`)
  for (const e of errors) console.log(`ERROR ${e}`)
  console.log(`${name}: ${errors.length} errors, ${warnings.length} warnings`)
  return errors.length === 0
}

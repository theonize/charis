import fs from 'node:fs'
import { parseXrefRef, type Coord } from './coords.js'

export interface XrefPair {
  from: Coord[]
  to: Coord[]
}

export interface XrefResult {
  pairs: XrefPair[]
  /** Rows we could not expand (e.g. cross-chapter ranges) — logged, not fatal (no silent caps). */
  skipped: string[]
}

export function parseXrefCsv(content: string): XrefResult {
  const lines = content.replace(/^﻿/, '').split(/\r?\n/)
  const pairs: XrefPair[] = []
  const skipped: string[] = []
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue
    const comma = line.indexOf(',')
    if (comma === -1) {
      skipped.push(line)
      continue
    }
    try {
      pairs.push({
        from: parseXrefRef(line.slice(0, comma).trim()),
        to: parseXrefRef(line.slice(comma + 1).trim()),
      })
    } catch {
      skipped.push(line)
    }
  }
  return { pairs, skipped }
}

export function loadXrefCsv(path: string): XrefResult {
  return parseXrefCsv(fs.readFileSync(path, 'utf8'))
}

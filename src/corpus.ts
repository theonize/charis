import fs from 'node:fs'
import { parseCsvId, type Coord } from './coords.js'

export interface Verse {
  coord: Coord
  bookNum: number
  text: string
}

/**
 * Parse bible.csv content: ID,book,bk,ch,vs,field
 * The text field may be quoted (commas inside) or unquoted legacy rows where
 * everything after the 5th comma is text.
 */
export function parseBibleCsv(content: string): Verse[] {
  const lines = content.replace(/^﻿/, '').split(/\r?\n/)
  const verses: Verse[] = []
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue
    const parts = splitRow(line)
    const [id, , bk, , , ...rest] = parts
    verses.push({
      coord: parseCsvId(id!),
      bookNum: Number(bk),
      text: rest.join(','),
    })
  }
  return verses
}

/** Split a row on the first 5 commas; unquote the remainder if quoted. */
function splitRow(line: string): string[] {
  const head: string[] = []
  let pos = 0
  for (let i = 0; i < 5; i++) {
    const comma = line.indexOf(',', pos)
    if (comma === -1) throw new Error(`malformed csv row: "${line}"`)
    head.push(line.slice(pos, comma))
    pos = comma + 1
  }
  let text = line.slice(pos)
  if (text.startsWith('"') && text.endsWith('"'))
    text = text.slice(1, -1).replace(/""/g, '"')
  return [...head, text]
}

export function loadBibleCsv(path: string): Verse[] {
  return parseBibleCsv(fs.readFileSync(path, 'utf8'))
}

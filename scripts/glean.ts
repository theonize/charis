// glean <term> [--prefix] — every occurrence in bible.csv with coordinates (PR1.2).
import { loadBibleCsv } from '../tool/corpus.js'
import { formatCoord } from '../tool/coords.js'
import { glean } from '../tool/glean.js'
import { BIBLE_CSV } from './lib.js'

const args = process.argv.slice(2)
const prefix = args.includes('--prefix')
const term = args.filter(a => !a.startsWith('--'))[0]
if (!term) {
  console.error('usage: npm run glean -- <term> [--prefix]')
  process.exit(2)
}

const hits = glean(loadBibleCsv(BIBLE_CSV), term, { prefix })
for (const h of hits) console.log(`${formatCoord(h.coord)}\t${h.count}\t${h.text}`)
console.log(`\n${hits.length} verses, ${hits.reduce((n, h) => n + h.count, 0)} occurrences of "${term}"${prefix ? ' (prefix)' : ''}`)

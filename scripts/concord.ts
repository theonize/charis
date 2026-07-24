// concord <english-word> — reverse concordance summary: where it appears, per book (PR4).
import { loadBibleCsv } from '../tool/corpus.js'
import { glean } from '../tool/glean.js'
import { BIBLE_CSV } from './lib.js'

const term = process.argv[2]
if (!term) {
  console.error('usage: npm run concord -- <word>')
  process.exit(2)
}

const hits = glean(loadBibleCsv(BIBLE_CSV), term)
const byBook = new Map<string, number>()
for (const h of hits) byBook.set(h.coord.book, (byBook.get(h.coord.book) ?? 0) + h.count)
for (const [book, n] of byBook) console.log(`${book}\t${n}`)
console.log(`\n"${term}": ${hits.reduce((n, h) => n + h.count, 0)} occurrences in ${hits.length} verses across ${byBook.size} books`)

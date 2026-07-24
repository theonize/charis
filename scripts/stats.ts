import { loadDict } from '../src/dict.js'
import { dictStats } from '../src/stats.js'
import { loadBibleCsv } from '../src/corpus.js'
import { BIBLE_CSV, DICT_PATH } from './lib.js'

const s = dictStats(loadDict(DICT_PATH))
const corpus = loadBibleCsv(BIBLE_CSV)
console.log(`dict: ${s.total} entries — ${s.byStatus.applied} applied, ${s.byStatus.decided} decided, ${s.byStatus.candidate} candidate`)
console.log(`gaps: ${s.missingStrongs} entries missing Strong's, ${s.missingRendering} missing rendering`)
console.log(`corpus: ${corpus.length} verses (bible.csv)`)

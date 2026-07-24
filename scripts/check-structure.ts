import { loadBibleCsv } from '../tool/corpus.js'
import { checkStructure } from '../tool/checkStructure.js'
import { BIBLE_CSV, report } from './lib.js'

const { errors, warnings } = checkStructure(loadBibleCsv(BIBLE_CSV))
process.exit(report('check-structure', errors, warnings) ? 0 : 1)

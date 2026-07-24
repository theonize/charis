import { loadDict, lintDict } from '../src/dict.js'
import { DICT_PATH, report } from './lib.js'

const { errors, warnings } = lintDict(loadDict(process.argv[2] ?? DICT_PATH))
process.exit(report('dict-lint', errors, warnings) ? 0 : 1)

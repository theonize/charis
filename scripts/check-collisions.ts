// I2 — English rendering collisions across dict entries (subset of dict-lint, focused view).
import { loadDict, lintDict } from '../src/dict.js'
import { DICT_PATH, report } from './lib.js'

const { warnings } = lintDict(loadDict(DICT_PATH))
const collisions = warnings.filter(w => /also used by/.test(w))
process.exit(report('check-collisions', collisions, []) ? 0 : 1)

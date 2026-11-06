// I2 — English-term ownership across dict entries (subset of dict-lint, focused view).
// Absolute: every term an entry owns (rendering, forms, sense renderings) belongs to that entry alone.
import { loadDict, lintDict } from '../tool/dict.js'
import { DICT_PATH, report } from './lib.js'

const { errors } = lintDict(loadDict(DICT_PATH))
const collisions = errors.filter(e => /I2 collision/.test(e))
process.exit(report('check-collisions', collisions, []) ? 0 : 1)

// assign.json — per-occurrence alternate selection, checked against dict.json + data/lemmas.json (P1, PR3.4).
import fs from 'node:fs'
import path from 'node:path'
import { loadDict } from '../tool/dict.js'
import { checkAssign, loadAssign } from '../tool/assign.js'
import { ASSIGN_PATH, DICT_PATH, ROOT, report } from './lib.js'

const lemmas = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'lemmas.json'), 'utf8'))
const { errors, warnings } = checkAssign(loadDict(DICT_PATH), loadAssign(ASSIGN_PATH), lemmas)
process.exit(report('check-assign', errors, warnings) ? 0 : 1)

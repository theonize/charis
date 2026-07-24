// translit <heb|grk> <word> — one-off transliteration via the ratified tables (PR2).
import { translitHebrew, translitGreek } from '../src/translit.js'

const [lang, word] = process.argv.slice(2)
if (!word || (lang !== 'heb' && lang !== 'grk')) {
  console.error('usage: npm run translit -- <heb|grk> <word>')
  process.exit(2)
}
console.log(lang === 'heb' ? translitHebrew(word) : translitGreek(word))

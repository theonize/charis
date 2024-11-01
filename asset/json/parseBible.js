const Text = require('./ylt.raw.json')
const fs = require('fs')

const Bible = []

let I = 0

for (const packet of Text) {
	const field = packet.field

	const verse = {
		id: field[0],
		book: field[1],
		chapter: field[2],
		verse: field[3],
		text: field[4],
	}

	if (!Bible[verse.book]) {
		Bible[verse.book] = ['']		
	}
	const Book = Bible[verse.book]

	if (!Book[verse.chapter]) {
		Book[verse.chapter] = ['']		
	}
	const Chapter = Book[verse.chapter]

	Chapter[verse.verse] = verse.text
}

fs.writeFileSync('./src/ylt.json', JSON.stringify(Bible))
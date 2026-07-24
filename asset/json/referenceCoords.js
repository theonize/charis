const books = require('./books.json')

module.exports = function(reference) {
	const ref = reference.split(' ')
	const chapterVerse = ref[ref.length-1]
	const chapter = chapterVerse.split(':')[0]
	const verse = chapterVerse.split(':')[1]

	ref.pop()
	const bookName = ref.join(' ')
	const book = books[bookName]

	return [book,chapter,verse]
}
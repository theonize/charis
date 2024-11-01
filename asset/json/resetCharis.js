const books = require('./books.json')
const sourceFile = './charis.json'

const Bible = []
const fs = require('fs')
const KJV = require('kjv/json/verses-1769.json')
const referenceCoords = require('./referenceCoords')

const verses = Object.keys(KJV)
for (const reference of verses) {
	const [book,chapter,verse] = referenceCoords(reference)

	if (!Bible[book]) Bible[book] = []
	if (!Bible[book][chapter]) Bible[book][chapter] = []

	Bible[book][chapter][verse] = KJV[reference]
}

fs.writeFileSync(sourceFile, JSON.stringify(Bible))
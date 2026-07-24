const sourceFile = './charis.json'

const Bible = require(sourceFile)
const fs = require('fs')
const KJV = require('kjv/json/verses-1769.json')
const referenceCoords = require('./referenceCoords')

module.exports = {
	save: function() {
		fs.writeFileSync(sourceFile, JSON.stringify(Bible,null,2))
	},
	update: function(reference,target,change) {
		try {
			if (reference && target.length && change.length) {
				const [book,chapter,verse] = referenceCoords(reference)

				const oldText = KJV[reference]
				const searchExp = new RegExp(target, 'gi')

				Bible[book][chapter][verse] = oldText.replace(searchExp, change)

				console.log(`changing ${book} ${chapter}:${verse} => ${Bible[book][chapter][verse]}`)
			}
		} catch (error) {
			console.error(error)
		}
	}
}
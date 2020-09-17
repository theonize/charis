const fileName = './charis.json'

const Bible = require(fileName)
const fs = require('fs')

const book = process.argv[2]
const chapter = process.argv[3]
const verse = process.argv[4]
const target = process.argv[5]
const change = process.argv[6]

module.exports = {
	save: function() {
		fs.writeFileSync(fileName, JSON.stringify(Bible,null,2))
	},
	update: function(book,chapter,verse,target,change) {
		try {
			if (target.length && change.length) {
				const oldText = Bible[book][chapter][verse]
				const searchExp = new RegExp(target, 'gi')
				
				console.log(oldText)
				Bible[book][chapter][verse] = oldText.replace(searchExp, change)
				
				console.log(`changing ${book} ${chapter}:${verse} => ${Bible[book][chapter][verse]}`)
			}
		} catch (error) {
			console.error(error)
		}
	}
}
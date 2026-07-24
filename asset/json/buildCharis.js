const fs = require('fs')
const glob = require('glob')
const source = require('./ylt.json')
const updater = require('./updateCharis')
const modFile = process.argv[2]

/**
 * a mod-file is a json encoded array of arrays
 * each sub-array is: 
 * 	[Int, Int, Int, Str, Str]
 *  [Book, Chapter, Verse, OldText, NewText]
 */
glob('./mod/*.json', (err,files)=>{
	for (const file of files) {
		let mod = require(file)

		for (const thing of mod) updater.update(...thing)
	}
})

updater.save()
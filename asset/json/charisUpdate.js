const fs = require('fs')
const updater = require('./updateCharis')
const modFile = process.argv[2]

/**
 * a mod-file is a json encoded array of arrays
 * each sub-array is: 
 * 	[Int, Int, Int, Str, Str]
 *  [Book, Chapter, Verse, OldText, NewText]
 */
let mod

fs.readFile

for (const thing of mod) updater.update(...thing)

updater.save()
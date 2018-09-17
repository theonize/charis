const fs = require('fs')
let data = fs.readFileSync('output')


data = data.toString().split('\n')

for (let record of data) {
    fields = record.split(',')

    let book = fields[0]
    let prevBook
    let bookNum = fields[1]
    let chapter = fields[2]
    let verseNum = fields[3]
    let verse = fields[4]
    let currFile = './' + book + '/' + chapter

    if (book !== prevBook) fs.mkdirSync(book)

    if (chapter !== prevChapter) fs.mkdirSync(currFile)

    fs.appendFileSync(currFile, verse)


    prevBook = book
    prevChapter = chapter
}

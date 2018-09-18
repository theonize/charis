const fs = require('fs')
const path = require('path')

let data = fs.readFileSync('output')
let subdirectory = 'testdir'


if (!fs.existsSync(subdirectory))
    fs.mkdirSync(subdirectory)

data = data.toString().split('\n')

const touch = (filename, callback) => {
    fs.openSync(filename, 'w', (err, fd) => {
        err ? callback(err) : fs.closeSync(fd, callback)
    })
}


for (let record of data) {
    fields = record.split(',')

    let book = fields[0]
    let prevBook
    let bookNum = fields[1]
    let chapter = fields[2]
    let prevChapter
    let verseNum = fields[3]
    let verse = fields[4]

    let directory = `./${subdirectory}/${bookNum}`
    let currFile = `${directory}/${chapter}`


    if (book !== prevBook)
        if (!fs.existsSync(directory))
            fs.mkdirSync(directory)


   fs.appendFileSync(currFile, verse)


    prevBook = book
    prevChapter = chapter
}

const fs = require('fs')
const path = require('path')

const directoryPath = path.resolve(process.argv[2])
const outputFilePath = path.resolve(process.argv[3])


function mergeJsonFiles(dirPath) {
    const mergedData = {}
    
    fs.readdirSync(dirPath).forEach(file => {
        const filePath = path.join(dirPath, file)
        
        if (path.extname(file) === '.json') {
            const fileName = path.basename(file, '.json')
            
            const fileContent = fs.readFileSync(filePath, 'utf8')
            mergedData[fileName] = JSON.parse(fileContent)
        }
    })
    
    fs.writeFileSync(outputFilePath, JSON.stringify(mergedData, null, 2))
    console.log(`Merged JSON saved to ${outputFilePath}`)
}

mergeJsonFiles(directoryPath)

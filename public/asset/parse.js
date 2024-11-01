const fs = require('fs');
const path = require('path');

// Load the main JSON file from command-line arguments
const inputFile = path.resolve(process.argv[2]); // Path to the large JSON file
const outputDirectory = path.resolve(process.argv[3]); // Directory to save smaller JSON files

// Ensure the output directory exists
if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory, { recursive: true });
}

// Read and parse the large JSON file
fs.readFile(inputFile, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }
  
  let jsonData;
  try {
    jsonData = JSON.parse(data);
  } catch (parseError) {
    console.error('Error parsing JSON:', parseError);
    return;
  }

  // Iterate over each key in the JSON object
  for (const [key, value] of Object.entries(jsonData)) {
    // Create a new file for each key with the key as the filename
    const outputFilePath = path.join(outputDirectory, `${key}.json`);
    
    fs.writeFile(outputFilePath, JSON.stringify(value, null, 2), 'utf8', (writeError) => {
      if (writeError) {
        console.error(`Error writing file ${outputFilePath}:`, writeError);
      } else {
        console.log(`File written: ${outputFilePath}`);
      }
    });
  }
});

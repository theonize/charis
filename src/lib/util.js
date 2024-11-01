export async function loadEnglish() {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/asset/NET.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error loading JSON:", error)
    throw error
  }
}


export async function loadOriginal() {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/asset/OG.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error loading JSON:", error)
    throw error
  }
}


export async function saveEnglish(data) {
  try {
    if ('showSaveFilePicker' in window) {
      const options = {
        suggestedName: 'eng.json',
        types: [
          {
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] },
          },
        ],
      }
      
      const handle = await window.showSaveFilePicker(options)
      const writable = await handle.createWritable()
      
      await writable.write(JSON.stringify(data, null, 2))
      await writable.close()
      
      alert("Data saved successfully!")
    } else {
      alert("File System Access API is not supported in this browser.")
    }
  } catch (error) {
    console.error("Error saving JSON:", error)
    throw error
  }
}

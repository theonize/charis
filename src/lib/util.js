// Viewer-only: text edits go through the translation tooling (dict.json +
// npm run impute), never through the app. See CLAUDE.md / docs/PROCESSES.md.

export async function loadEnglish(abortSignal) {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/asset/NET.json`, {signal: abortSignal})

    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error loading JSON:", error)
    throw error
  }
}


export async function loadOriginal(abortSignal) {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/asset/OG.json`, {signal: abortSignal})

    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error loading JSON:", error)
    throw error
  }
}

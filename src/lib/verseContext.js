import React, { createContext, useContext, useEffect, useState } from 'react'

const VerseContext = createContext()


export const VerseProvider = ({ children }) => {
  const [book, setBook] = useState()
  const [chapter, setChapter] = useState()
  const [verse, setVerse] = useState(null)
  
  
  useEffect(() => {
    if (book) {
      setChapter(null)
    }
  }, [book])
  
  
  return (
    <VerseContext.Provider value={{ 
      book, setBook,
      chapter, setChapter,
      verse, setVerse,
    }}>
      {children}
    </VerseContext.Provider>
  )
}


export const useBible = () => useContext(VerseContext)
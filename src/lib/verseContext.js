import React, { createContext, useState, useContext } from 'react'

const VerseContext = createContext()


export const VerseProvider = ({ children }) => {
  const [book, setBook] = useState()
  const [verse, setVerse] = useState(null)
  
  
  return (
    <VerseContext.Provider value={{ 
      book, setBook,
      verse, setVerse,
    }}>
      {children}
    </VerseContext.Provider>
  )
}


export const useBible = () => useContext(VerseContext)
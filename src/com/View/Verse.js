import {useEffect, useState} from 'react'
import { useBible } from '../../lib/verseContext'


export default function Verse({ chapter, index, children }) {
  const { verse, setVerse } = useBible()
  const [classes, setClasses] = useState()
  
  
  const handleHover = event=>{
    setVerse({ chapter, verse: index })
  }
  
  
  const handleLeave = event=>{
    setVerse(null)
  }
  
  
  useEffect(() => {
    let result = 'verse'
    
    if (
      chapter && index && verse
      && (chapter === verse.chapter)
      && (index === verse.verse)
    ) result += ' active'
    
    setClasses(result)
  }, [chapter, index, verse])
  
  
  return (
    <span
      className={classes}
      data-chapter={chapter}
      data-verse={index}
      onMouseEnter={handleHover}
      onMouseLeave={handleLeave}
    >
      {children}
    </span>
  )
}
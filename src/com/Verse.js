import {useEffect, useState} from 'react'
import { useBible } from '../lib/verseContext'


export default function Verse({
  chapter,
  children,
  data,
  index, 
}) {
  const { book, verse, setVerse } = useBible()
  
  const [classes, setClasses] = useState()
  const [showEditor, setshowEditor] = useState(false)
  const [thisn, setThisn] = useState()
  
  
  const handleSave = event=>{
    data[book][chapter][index-1] = thisn
    setshowEditor(false)
  }
  
  
  const handleClick = event=>{
    setshowEditor(!showEditor)
  }
  
  
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
  
  
  useEffect(() => {
    setThisn(children)
  }, [children])
  
  
  let result = [<span
    className={classes}
    data-chapter={chapter}
    data-verse={index}
    onMouseEnter={handleHover}
    onMouseLeave={handleLeave}
    onClick={handleClick}
  >
    {children}
  </span>]
  
  if (showEditor) result.push(<div className='edit container'>
    <textarea
      value={thisn}
      onChange={E=>setThisn(E.target.value)}
    />
    
    <button className='save button' onClick={handleSave}> 💾 </button>
  </div>)
  
  return result
}
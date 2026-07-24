import React from 'react'
import {useBible} from '../lib/verseContext'
import {saveEnglish} from '../lib/util'


export default function Selector({data}) {
  const {
    book, setBook,
    chapter, setChapter,
    verse,
  } = useBible()
  
  
  const handleSave = () => {
    saveEnglish(data)
  }
  
  if (data) return <div className='selector container'>
    <select onChange={E=>setBook(E.target.value)} value={book}>
      <option>Choose a book</option>
      
      {Object.keys(data).map((book,I)=><option key={I}>{book}</option>)}
    </select>
    
    {book && <>
      <select onChange={E=>setChapter(E.target.value)} value={chapter}>
        <option>Choose a chapter</option>
        
        {book && data[book].map((_,I)=><option
          key={I}
          value={I}
          >{I+1}</option>)}
      </select>
      
      <button onClick={handleSave}>Save Changes</button>
    </> }
    
    {verse && <span className="tooltip">
      Chapter: {+verse.chapter+1}, Verse: {verse.verse}
    </span> }
  </div>
}
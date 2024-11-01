import React from 'react'
import { useBible } from '../lib/verseContext'


export default function Header() {
  const { verse } = useBible()
  
  
  return <>
    <h1>charis</h1>
    
    {verse && <div className="tooltip">
      Chapter: {verse.chapter}, Verse: {verse.verse}
    </div> }
  </>
}
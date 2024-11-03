import {useEffect, useState} from 'react'
import {loadEnglish, loadOriginal, saveEnglish} from '../lib/util'
import ViewBook from './View/Book'
import Second from './View/Second'
import {useBible} from '../lib/verseContext'

import dataEng from '../ENG.json'
import dataOrig from '../OG.json'


export default function Main() {
  const {book, setBook} = useBible()
  
  // const [dataEng, setDataEng] = useState()
  // const [dataOrig, setDataOrig] = useState()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState()
  
  const handleSave = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await saveEnglish(dataEng)
      alert("Data saved successfully!")
    } catch (err) {
      setError("Failed to save data.")
    } finally {
      setLoading(false)
    }
  }
  
  
  useEffect(() => {
    // const aborter = new AbortController()
    
    // loadData(aborter).catch(console.error)
    
    setLoading(false)
    
    // return () => aborter.abort()
  }, [])  
  
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      
      <button onClick={handleSave} disabled={loading || !dataEng}>
        Save English
      </button>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {dataEng && <div className='selector container'>
        <select onChange={E=>setBook(E.target.value)} value={book}>
          <option>Choose a book</option>
          
          {Object.keys(dataEng).map((book,I)=><option key={I}>{book}</option>)}
        </select>
      </div>}
      
      {book && dataEng && dataOrig && <div className="columnar">
        <Second data={dataEng} />
        
        <Second data={dataOrig} />
      </div>
      }
    </div>
  )
}
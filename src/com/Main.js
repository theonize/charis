import {useEffect, useState} from 'react'
import Chapter from './Chapter'
import Selector from './Selector'
import {useBible} from '../lib/verseContext'

import dataEng from '../ENG.json'
import dataOrig from '../OG.json'


export default function Main() {
  const {book, setBook} = useBible()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState()
  
  
  useEffect(() => {
    setLoading(false)
  }, [])  
  
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <Selector data={dataEng} />
      
      <div className="columnar">
        <Chapter data={dataEng} />
        <Chapter data={dataOrig} />
      </div>
    </div>
  )
}
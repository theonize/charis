import {useEffect, useState} from 'react'
import {loadEnglish, loadOriginal, saveEnglish} from '../lib/util'
import Data from './View/Main'
import Second from './View/Second'


export default function Main() {
  const [dataEng, setDataEng] = useState()
  const [dataOrig, setDataOrig] = useState()
  const [loading, setLoading] = useState(false)
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
  
  
  const loadData = async (aborter) => {
    setError(null)
    setLoading(true)
    
    loadEnglish(aborter.signal)
      .then(setDataEng)
      .catch(err => setError("Failed to load English data."))
      .finally(() => setLoading(false))
    
    loadOriginal(aborter.signal)
      .then(setDataOrig)
      .catch(err => setError("Failed to load Original data."))
      .finally(() => setLoading(false))
  }
  
  
  useEffect(() => {
    const aborter = new AbortController()
    
    loadData(aborter).catch(console.error)
    
    return () => aborter.abort()
  }, [])  
  
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      
      <button onClick={handleSave} disabled={loading || !dataEng}>
        Save English
      </button>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {dataEng && <div className="columnar">
        <Data data={dataEng} />
        
        <Second data={dataOrig} />
      </div>
      }
    </div>
  )
}
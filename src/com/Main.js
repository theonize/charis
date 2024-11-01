import {useState} from 'react'
import {loadEnglish, loadOriginal, saveEnglish} from '../lib/util'
import Data from './Viewer'


export default function Main() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const handleLoad = which=>{
    return async event=>{
      setLoading(true)
      setError(null)
      
      try {
        const jsonData = (which==='eng')? await loadEnglish(): await loadOriginal()
        setData(jsonData)
      } catch (err) {
        setError("Failed to load data.")
      } finally {
        setLoading(false)
      }
    }
  }
  
  const handleSave = async () => {
    setLoading(true)
    setError(null)
    try {
      await saveEnglish(data)
      alert("Data saved successfully!")
    } catch (err) {
      setError("Failed to save data.")
    } finally {
      setLoading(false)
    }
  }
  
  
  return (
    <div>
      <button onClick={handleLoad('eng')} disabled={loading}>
        Load English
      </button>
      
      <button onClick={handleLoad()} disabled={loading}>
        Load OG
      </button>
      
      <button onClick={handleSave} disabled={loading || !data}>
        Save English
      </button>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {data && <Data data={data} />}
    </div>
  )
}
import {useEffect, useState} from 'react'
import {useBible} from '../lib/verseContext'
import Verse from './Verse'


export default function Chapter({data}) {
  const {book, chapter} = useBible()
  
  const [thisn, setThisn] = useState()

  useEffect(() => {
    if (book && chapter && data) {
      setThisn(data[book][chapter])
    }
  }, [book, chapter, data])
  
  return <div className='view container'>
    {thisn && thisn.map((item, I)=><Verse
      chapter={chapter}
      data={data}
      index={I+1}
      key={I}
    >
      {item}
    </Verse>)}
  </div>
}

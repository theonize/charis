import {useState} from 'react'
import ViewBook from './Book'
import {useBible} from '../../lib/verseContext'


export default function Second({data}) {
  const {book, setBook} = useBible()
  
  
  if (data) return <div className='view container'>
    {book && <ViewBook data={data[book]} name={book} />}
  </div>
}
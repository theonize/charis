import {useState} from 'react'
import ViewBook from './Book'
import {useBible} from '../../lib/verseContext'


export default function Data({data}) {
  const {book, setBook} = useBible()
  
  
  const selectBook = E=>{
    setBook(E.target.value)
  }
  
  if (data) return <div className='view container'>
    <select onChange={selectBook} value={book}>
      <option>Choose a book</option>
      
      {Object.keys(data).map((book,I)=><option key={I}>{book}</option>)}
    </select>
    
    {book && <ViewBook data={data[book]} name={book} />}
  </div>
}
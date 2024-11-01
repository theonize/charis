import {useState} from 'react'
import ViewBook from './ViewBook'


export default function Data({data}) {
  const [book, setBook] = useState()
  
  if (data) return <div>
    <select onChange={E=>setBook(E.target.value)} value={book}>
      <option>Choose a book</option>
      
      {Object.keys(data).map((book,I)=><option key={I}>{book}</option>)}
    </select>
    
    {book && <ViewBook data={data[book]} name={book} />}
  </div>
}

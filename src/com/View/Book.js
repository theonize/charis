import React from 'react'
import Chapter from './Chapter'


export default function ViewBook({data, name}) {
  if (data) return <div>
    <h1>{name}</h1>
    
    <ol>
      {data.map((item, I) => <li key={I}>
        <Chapter chapter={I+1} data={item} />
      </li>)}
    </ol>
  </div>
}

import React from 'react'


export default function ViewBook({data, name}) {

  if (data) return <div>
    <h1>{name}</h1>

    <ol>
      {data.map((item, i) => <li key={i}>{item}</li>)}
    </ol>
  </div>
}

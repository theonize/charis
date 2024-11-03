import React from 'react'
import Verse from './Verse'


export default function Chapter({chapter, data}) {
  if (data?.map) return <div>
    {data.map((item, I)=><Verse
      chapter={chapter}
      index={I+1}
      key={I}
    >
      {item}
    </Verse>)}
  </div>
}
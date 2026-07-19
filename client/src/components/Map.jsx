import React from 'react'
export default function Map({zones=[]}){
  return (
    <div className="card">
      <h3 style={{padding:16}}>Live Crowd Heatmap</h3>
      <div style={{padding:16}}>
        <div style={{background:'#0d1220',height:360,borderRadius:14,position:'relative'}}>
          {zones.map(z=> (
            <div key={z._id} style={{position:'absolute',left:`${z.x}%`,top:`${z.y}%`,transform:'translate(-50%,-50%)',padding:10,background:'#ffffff08',borderRadius:12}}>{z.name}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

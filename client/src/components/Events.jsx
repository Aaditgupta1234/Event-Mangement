import React from 'react'
export default function Events({events=[]}){
  return (
    <div className="card">
      <h3 style={{padding:16}}>All Events</h3>
      <div style={{padding:16}}>
        {events.map(e=> (
          <div key={e._id} style={{display:'flex',justifyContent:'space-between',padding:12,marginBottom:8,background:'#0f1524',borderRadius:10}}>
            <div>
              <b>{e.title}</b>
              <div style={{color:'#adb6d9'}}>{e.time} · {e.venue}</div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <span className="pill">+{e.points} XP</span>
              <button className="btn">Add</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

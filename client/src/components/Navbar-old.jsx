import React from 'react'
export default function Navbar({user,setView,setUser}){
  return (
    <header style={{position:'sticky',top:0,background:'#0b0d12',padding:12,borderBottom:'1px solid #ffffff10'}}>
      <div style={{maxWidth:1200,margin:'0 auto',display:'flex',alignItems:'center',gap:12}}>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <div style={{width:34,height:34,borderRadius:8,background:'linear-gradient(90deg,#7c9cff,#6af2c6)'}}></div>
          <div style={{fontWeight:800}}>FestifyXR</div>
        </div>
        <nav style={{marginLeft:20,display:'flex',gap:8}}>
          <button onClick={()=>setView('home')}>Home</button>
          <button onClick={()=>setView('events')}>Events</button>
          <button onClick={()=>setView('map')}>Map</button>
          <button onClick={()=>setView('buddy')}>Buddy</button>
          <button onClick={()=>setView('leaderboard')}>Leaderboard</button>
        </nav>
        <div style={{marginLeft:'auto'}}>
          {user ? (
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#7c9cff,#6af2c6)',display:'flex',alignItems:'center',justifyContent:'center'}}>{user.name[0]}</div>
              <button onClick={()=>{ localStorage.removeItem('f_token'); localStorage.removeItem('f_user'); setUser(null); setView('home'); }}>Logout</button>
            </div>
          ) : (
            <button onClick={()=>setView('auth')}>Login</button>
          )}
        </div>
      </div>
    </header>
  )
}

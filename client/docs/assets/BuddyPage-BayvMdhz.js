import{u as E,r as i,g as k,d as $,j as s}from"./index-DUrJeW5y.js";function Y(){const{user:e}=E(),[c,p]=i.useState([{role:"assistant",text:`Hi ${e==null?void 0:e.name}! 👋 I'm your FestifyXR Assistant. I can help you with:

• 🎪 Finding events
• 🗺️ Navigation around campus
• 🏆 Tracking your XP and level
• 🎁 Reward recommendations

What would you like to know?`}]),[u,h]=i.useState(""),[x,m]=i.useState([]),[y,v]=i.useState([]);i.useEffect(()=>{f(),g()},[]);const g=async()=>{try{const n=await k();v(n.data.data||[])}catch(n){console.error("Error loading events:",n)}},f=async()=>{try{const n=await $();m(n.data.data||[])}catch(n){console.error("Error loading buddy responses:",n)}},w=[{text:"What is my XP?",emoji:"🏆"},{text:"What is my plan?",emoji:"📅"},{text:"How do I earn more XP?",emoji:"⭐"},{text:"What rewards can I redeem?",emoji:"🎁"}],r=(n=u)=>{if(!n.trim())return;const t={role:"user",text:n};p([...c,t]),h(""),setTimeout(()=>{const o=j(n);p(d=>[...d,{role:"assistant",text:o}])},500)},j=n=>{const t=n.toLowerCase();if(t.includes("my plan")||t.includes("my events")||t.includes("planned")||t.includes("what")&&t.includes("plan")){const o=localStorage.getItem(`planned_events_${e==null?void 0:e.id}`);if(!o)return`📅 You don't have any events in your plan yet!

Head over to the Events page to browse and add events to your plan. 🎪`;const d=JSON.parse(o),l=y.filter(a=>d.includes(a._id));if(l.length===0)return`📅 You don't have any events in your plan yet!

Head over to the Events page to browse and add events to your plan. 🎪`;const P=l.reduce((a,b)=>a+b.points,0);return`📅 Your Event Plan:

${l.slice(0,5).map(a=>`• ${a.title} - ${a.time} at ${a.venue} (+${a.points} XP)`).join(`
`)}${l.length>5?`

...and ${l.length-5} more events`:""}

🏆 Total potential XP: ${P}

Check the My Plan page for full details!`}if(t.includes("my xp")||t.includes("my stats")||t.includes("my level")||t.includes("what")&&t.includes("my")&&(t.includes("xp")||t.includes("level")))return`🏆 Hey ${e==null?void 0:e.name}!

Your current stats:
• XP: ${(e==null?void 0:e.xp)||0}
• Level: ${(e==null?void 0:e.level)||1}

Keep attending events and redeeming rewards to earn more XP! 🎉`;for(let o of x)if(t.includes(o.keyword.toLowerCase()))return o.response.replace("${user?.xp || 0}",(e==null?void 0:e.xp)||0).replace("${user?.level || 1}",(e==null?void 0:e.level)||1);return t.includes("event")||t.includes("happening")?`🎪 You can check all upcoming events in the Events tab! Here are some popular ones:

• DJ Night at Main Stage
• Tech Workshop in Lab 3
• Food Festival at Plaza

Head to the Events page to see the full schedule!`:t.includes("xp")||t.includes("points")||t.includes("earn")?`⭐ You can earn XP by:

• Attending events (20-50 XP each)
• Checking into zones (10 XP)
• Redeeming rewards with QR codes
• Completing challenges

You currently have ${(e==null?void 0:e.xp)||0} XP at Level ${(e==null?void 0:e.level)||1}!`:t.includes("map")||t.includes("navigate")?"🗺️ You can view the interactive campus map in the Map tab. It shows all zones and event locations. Just tap on any zone to see details!":t.includes("reward")||t.includes("redeem")?`🎁 Check out the Rewards page to see what you can redeem with your XP! We have:

• Merchandise
• Food vouchers
• Priority passes
• And more!

You have ${(e==null?void 0:e.xp)||0} XP to spend!`:`I'm here to help! Try asking me about:

• Events and schedules 🎪
• Earning XP and leveling up ⭐
• Campus navigation 🗺️
• Rewards and redemption 🎁
• Your plan and stats 📊

What would you like to know?`};return s.jsxs("div",{style:{padding:"20px",maxWidth:"900px",margin:"0 auto"},children:[s.jsx("div",{className:"card",style:{marginBottom:"20px"},children:s.jsxs("div",{style:{padding:"24px",textAlign:"center"},children:[s.jsx("h1",{style:{margin:"0 0 8px"},children:"🤖 FestifyXR Buddy"}),s.jsx("p",{style:{color:"#adb6d9",margin:0},children:"Your personal festival assistant"})]})}),s.jsxs("div",{className:"card",style:{marginBottom:"16px",height:"500px",display:"flex",flexDirection:"column"},children:[s.jsx("div",{style:{flex:1,padding:"20px",overflowY:"auto"},children:c.map((n,t)=>s.jsx("div",{style:{display:"flex",justifyContent:n.role==="user"?"flex-end":"flex-start",marginBottom:"16px"},children:s.jsx("div",{style:{maxWidth:"70%",padding:"12px 16px",borderRadius:"12px",background:n.role==="user"?"#7c9cff":"#161b2b",color:n.role==="user"?"#fff":"#eaf0ff",whiteSpace:"pre-wrap"},children:n.text})},t))}),s.jsx("div",{style:{padding:"12px 20px",borderTop:"1px solid #ffffff10"},children:s.jsx("div",{style:{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"12px"},children:w.map((n,t)=>s.jsxs("button",{className:"btn ghost",style:{fontSize:"13px"},onClick:()=>r(n.text),children:[n.emoji," ",n.text]},t))})}),s.jsxs("div",{style:{padding:"0 20px 20px",display:"flex",gap:"8px"},children:[s.jsx("input",{className:"input",type:"text",placeholder:"Ask me anything...",value:u,onChange:n=>h(n.target.value),onKeyPress:n=>n.key==="Enter"&&r(),style:{flex:1}}),s.jsx("button",{className:"btn",onClick:()=>r(),children:"Send"})]})]})]})}export{Y as default};

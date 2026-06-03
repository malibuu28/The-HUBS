'use client'
import{useState}from'react'
import{useDashboard}from'@/lib/useDashboard'
import{generateId,formatDate}from'@/lib/utils'

interface SocialStat{id:string;platform:string;icon:string;followers:number;date:string}
interface ContentIdea{id:string;text:string;platform:string;status:'idea'|'drafted'|'posted'}

export default function SocialMediaHub(){
const{data,update}=useDashboard()
const[activeTab,setActiveTab]=useState<'stats'|'ideas'|'calendar'>('stats')
const stats:(SocialStat[])=(data as any).socialStats||[]
const ideas:(ContentIdea[])=(data as any).contentIdeas||[]
const[statForm,setStatForm]=useState({platform:'Instagram',icon:'📸',followers:''})
const[ideaForm,setIdeaForm]=useState({text:'',platform:'Instagram'})
const[addingStat,setAddingStat]=useState(false)
const[addingIdea,setAddingIdea]=useState(false)
const[generating,setGenerating]=useState(false)

const PLATFORMS=[
{name:'Instagram',icon:'📸'},
{name:'TikTok',icon:'🎵'},
{name:'Facebook',icon:'👥'},
{name:'YouTube',icon:'▶️'},
{name:'Pinterest',icon:'📌'},
]

const latestStats=PLATFORMS.map(p=>{
const platformStats=stats.filter(s=>s.platform===p.name).sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime())
return{...p,current:platformStats[0]?.followers||0,prev:platformStats[1]?.followers||0}
})

const addStat=()=>{
if(!statForm.followers)return
const s:SocialStat={id:generateId(),platform:statForm.platform,icon:statForm.icon,followers:parseInt(statForm.followers),date:formatDate(new Date())}
update({socialStats:[...stats,s]}as any)
setStatForm({platform:'Instagram',icon:'📸',followers:''})
setAddingStat(false)
}

const addIdea=()=>{
if(!ideaForm.text.trim())return
const i:ContentIdea={id:generateId(),text:ideaForm.text,platform:ideaForm.platform,status:'idea'}
update({contentIdeas:[...ideas,i]}as any)
setIdeaForm({text:'',platform:'Instagram'})
setAddingIdea(false)
}

const updateIdeaStatus=(id:string,status:ContentIdea['status'])=>{
update({contentIdeas:ideas.map(i=>i.id===id?{...i,status}:i)}as any)
}

const deleteIdea=(id:string)=>{
update({contentIdeas:ideas.filter(i=>i.id!==id)}as any)
}

const generateIdeas=async()=>{
setGenerating(true)
try{
const res=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
system:'You are a social media expert for beauty and hair businesses.',
messages:[{role:'user',content:'Give me 5 specific TikTok/Instagram content ideas for a natural hair stylist who also sells Ayurvedic haircare products. Format as a numbered list, each idea on one line, no extra text.'}]
})})
const json=await res.json()
const text=json.content?.[0]?.text||''
const newIdeas=text.split('\n').filter((l:string)=>l.trim()&&l.match(/^\d/)).map((l:string)=>({
id:generateId(),
text:l.replace(/^\d+\.\s*/,'').trim(),
platform:'TikTok',
status:'idea' as const
}))
update({contentIdeas:[...ideas,...newIdeas]}as any)
}catch(e){}
setGenerating(false)
}

const STATUS_COLORS={idea:'bg-sand/20 text-warm',drafted:'bg-blush/20 text-blush',posted:'bg-sage/20 text-sage'}

return(
<div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/30">
<div className="flex items-center justify-between mb-4">
<div><h2 className="text-lg font-semibold text-deeper">Social Media Hub 📱</h2><p className="text-sm text-warm">Stats · Ideas · Content</p></div>
</div>

<div className="flex gap-1 mb-4 overflow-x-auto pb-1">
{(['stats','ideas','calendar'] as const).map(tab=>(
<button key={tab} onClick={()=>setActiveTab(tab)} className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${activeTab===tab?'bg-deeper text-white':'bg-cream/50 text-warm border border-sand/20'}`}>{tab}</button>
))}
</div>

{activeTab==='stats'&&(
<div className="space-y-3">
<div className="grid grid-cols-1 gap-3">
{latestStats.map(p=>{
const growth=p.current-p.prev
return(
<div key={p.name} className="bg-cream/50 rounded-xl p-3 border border-sand/20">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="text-xl">{p.icon}</span>
<span className="text-sm font-medium text-deeper">{p.name}</span>
</div>
<div className="text-right">
<p className="text-lg font-light text-deeper">{p.current.toLocaleString()}</p>
{growth!==0&&<p className={`text-xs ${growth>0?'text-sage':'text-blush'}`}>{growth>0?'+':''}{growth.toLocaleString()}</p>}
</div>
</div>
</div>
)
})}
</div>
{addingStat?(
<div className="bg-cream/50 rounded-xl p-3 space-y-2">
<select className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={statForm.platform} onChange={e=>{const p=PLATFORMS.find(p=>p.name===e.target.value);setStatForm({...statForm,platform:e.target.value,icon:p?.icon||'📱'})}}>
{PLATFORMS.map(p=><option key={p.name} value={p.name}>{p.icon} {p.name}</option>)}
</select>
<input type="number" placeholder="Current followers" className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={statForm.followers} onChange={e=>setStatForm({...statForm,followers:e.target.value})}/>
<div className="flex gap-2">
<button onClick={addStat} className="flex-1 bg-deeper text-white rounded-lg py-2 text-sm">Log Stats</button>
<button onClick={()=>setAddingStat(false)} className="flex-1 bg-cream border border-sand/30 text-warm rounded-lg py-2 text-sm">Cancel</button>
</div>
</div>
):(
<button onClick={()=>setAddingStat(true)} className="w-full border border-dashed border-sand rounded-xl py-3 text-sm text-warm">+ Log Followers</button>
)}
</div>
)}

{activeTab==='ideas'&&(
<div className="space-y-3">
<button onClick={generateIdeas} disabled={generating} className="w-full bg-deeper text-white rounded-xl py-3 text-sm font-medium">
{generating?'Generating ideas...':'✦ Generate AI Content Ideas'}
</button>
<div className="space-y-2">
{ideas.map(idea=>(
<div key={idea.id} className="bg-cream/50 rounded-xl p-3 border border-sand/20">
<div className="flex items-start justify-between gap-2 mb-2">
<p className="text-sm text-deeper flex-1">{idea.text}</p>
<button onClick={()=>deleteIdea(idea.id)} className="text-sand hover:text-blush text-xs flex-shrink-0">✕</button>
</div>
<div className="flex items-center gap-2">
<span className="text-xs text-warm">{idea.platform}</span>
<div className="flex gap-1 ml-auto">
{(['idea','drafted','posted'] as const).map(s=>(
<button key={s} onClick={()=>updateIdeaStatus(idea.id,s)} className={`text-xs px-2 py-0.5 rounded-full capitalize ${idea.status===s?STATUS_COLORS[s]:'bg-white text-sand border border-sand/20'}`}>{s}</button>
))}
</div>
</div>
</div>
))}
{ideas.length===0&&<p className="text-xs text-sand italic text-center py-4">No ideas yet — generate some above!</p>}
</div>
{addingIdea?(
<div className="bg-cream/50 rounded-xl p-3 space-y-2">
<input placeholder="Content idea..." className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={ideaForm.text} onChange={e=>setIdeaForm({...ideaForm,text:e.target.value})}/>
<select className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={ideaForm.platform} onChange={e=>setIdeaForm({...ideaForm,platform:e.target.value})}>
{PLATFORMS.map(p=><option key={p.name} value={p.name}>{p.icon} {p.name}</option>)}
</select>
<div className="flex gap-2">
<button onClick={addIdea} className="flex-1 bg-deeper text-white rounded-lg py-2 text-sm">Add Idea</button>
<button onClick={()=>setAddingIdea(false)} className="flex-1 bg-cream border border-sand/30 text-warm rounded-lg py-2 text-sm">Cancel</button>
</div>
</div>
):(
<button onClick={()=>setAddingIdea(true)} className="w-full border border-dashed border-sand rounded-xl py-3 text-sm text-warm">+ Add Idea Manually</button>
)}
</div>
)}

{activeTab==='calendar'&&(
<div className="space-y-2">
<p className="text-xs text-warm mb-3">Scheduled & posted content</p>
{ideas.filter(i=>i.status==='drafted'||i.status==='posted').map(idea=>(
<div key={idea.id} className={`rounded-xl p-3 border ${idea.status==='posted'?'bg-sage/10 border-sage/30':'bg-blush/10 border-blush/30'}`}>
<p className="text-sm text-deeper">{idea.text}</p>
<div className="flex items-center justify-between mt-1">
<span className="text-xs text-warm">{idea.platform}</span>
<span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[idea.status]}`}>{idea.status}</span>
</div>
</div>
))}
{ideas.filter(i=>i.status!=='idea').length===0&&<p className="text-xs text-sand italic text-center py-4">No drafted or posted content yet</p>}
</div>
)}
</div>
)
}

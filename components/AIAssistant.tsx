'use client'
import{useState}from'react'
import{useDashboard}from'@/lib/useDashboard'
import{formatDate,getDaysSince}from'@/lib/utils'
interface Message{role:'user'|'assistant';content:string}
export default function AIAssistant(){
const{data}=useDashboard()
const[open,setOpen]=useState(false)
const[messages,setMessages]=useState<Message[]>([])
const[input,setInput]=useState('')
const[loading,setLoading]=useState(false)
const buildContext=()=>{
const startDate=data.seventyFiveHolyStart||'2026-06-02'
const dayNumber=Math.min(getDaysSince(startDate)+1,75)
const today=formatDate(new Date())
const logs=data.habitLogs||[]
const holyHabits=(data as any).holyHabits||[]
const todayHabits=holyHabits.filter((h:any)=>logs.some((l:any)=>l.habitId===h.id&&l.date===today)).length
const debts=data.debts||[]
const totalDebt=debts.reduce((sum:number,d:any)=>sum+d.balance,0)
const sprints=(data as any).sprints||[]
const activeSprint=sprints[sprints.length-1]
const tasks=data.tasks||[]
const todayTasks=tasks.filter((t:any)=>t.createdAt===today)
const completedTasks=todayTasks.filter((t:any)=>t.completed).length
const income=(data as any).income||[]
const totalIncome=income.reduce((sum:number,i:any)=>sum+i.amount,0)
const hairIncome=income.filter((i:any)=>i.source==='hair').reduce((sum:number,i:any)=>sum+i.amount,0)
return`You are a personal life assistant for Shayonna, a hairstylist and entrepreneur. You think WITH her, not FOR her. Be warm, direct, faith-aligned, and concise. Today: ${today}. 75 Holy: Day ${dayNumber}, ${todayHabits} habits done. Tasks: ${completedTasks}/${todayTasks.length}. Debt: $${totalDebt.toLocaleString()}. Income: $${totalIncome.toLocaleString()} (Hair: $${hairIncome.toLocaleString()}). Sprint: ${activeSprint?activeSprint.title:'None'}. Focus: ${data.weeklyFocus||'Not set'}. She wants to leave her day job, runs Zoe haircare and Ayurvedic skincare lines, interested in forex trading. Never store conversations. Help with goals, hair business, content ideas, trading education, motivation, organizing thoughts.`
}
const send=async()=>{
if(!input.trim()||loading)return
const userMessage=input.trim()
setInput('')
const newMessages:Message[]=[...messages,{role:'user',content:userMessage}]
setMessages(newMessages)
setLoading(true)
try{
const response=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({system:buildContext(),messages:newMessages.map(m=>({role:m.role,content:m.content}))})})
const data=await response.json()
const reply=data.content?.[0]?.text||'Sorry, try again!'
setMessages([...newMessages,{role:'assistant',content:reply}])
}catch(error){
setMessages([...newMessages,{role:'assistant',content:'Something went wrong. Please try again!'}])
}finally{setLoading(false)}
}
return(
<>
<button onClick={()=>setOpen(!open)} className="fixed bottom-20 right-4 w-12 h-12 bg-deeper text-white rounded-full shadow-lg flex items-center justify-center text-xl z-20">{open?'✕':'✦'}</button>
{open&&(
<div className="fixed bottom-36 right-4 w-80 bg-white rounded-2xl shadow-xl border border-sand/30 z-20 flex flex-col" style={{height:'400px'}}>
<div className="p-4 border-b border-sand/20">
<h3 className="text-sm font-semibold text-deeper">Your AI Assistant ✦</h3>
<p className="text-xs text-warm">Thinks with you. Forgets your chats.</p>
</div>
<div className="flex-1 overflow-y-auto p-3 space-y-3">
{messages.length===0&&(
<div className="space-y-2">
<p className="text-xs text-warm text-center py-2">Ask me anything! Try:</p>
{["What should I focus on today?","Give me 3 TikTok ideas for my hair business","Explain forex trading simply","Help me organize my thoughts"].map(s=>(
<button key={s} onClick={()=>setInput(s)} className="w-full text-left text-xs bg-cream/50 rounded-xl p-2 border border-sand/20 text-warm">{s}</button>
))}
</div>
)}
{messages.map((msg,i)=>(
<div key={i} className={`flex ${msg.role==='user'?'justify-end':'justify-start'}`}>
<div className={`max-w-xs rounded-2xl px-3 py-2 text-sm ${msg.role==='user'?'bg-deeper text-white':'bg-cream/50 text-deeper border border-sand/20'}`}>{msg.content}</div>
</div>
))}
{loading&&(<div className="flex justify-start"><div className="bg-cream/50 rounded-2xl px-3 py-2 text-sm text-warm border border-sand/20">Thinking...</div></div>)}
</div>
<div className="p-3 border-t border-sand/20 flex gap-2">
<input className="flex-1 bg-cream/50 rounded-xl px-3 py-2 text-sm text-deeper border border-sand/20 focus:outline-none" placeholder="Ask anything

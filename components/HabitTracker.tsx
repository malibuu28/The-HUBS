'use client'
import{useState}from'react'
import{useDashboard}from'@/lib/useDashboard'
import{formatDate,generateId,getCurrentWeekDays}from'@/lib/utils'
import{format}from'date-fns'
const COLORS=[{name:'sage',bg:'bg-sage',light:'bg-sage/20',text:'text-sage'},{name:'blush',bg:'bg-blush',light:'bg-blush/20',text:'text-blush'},{name:'moss',bg:'bg-moss',light:'bg-moss/20',text:'text-moss'},{name:'warm',bg:'bg-warm',light:'bg-warm/20',text:'text-warm'},{name:'deeper',bg:'bg-deeper',light:'bg-deeper/20',text:'text-deeper'}]
interface Habit{id:string;label:string;icon:string;color:string}
export default function HabitTracker(){
const{data,update}=useDashboard()
const habits:Habit[]=(data as any).customHabits||[]
const logs=data.habitLogs||[]
const today=formatDate(new Date())
const weekDays=getCurrentWeekDays()
const[adding,setAdding]=useState(false)
const[form,setForm]=useState({label:'',icon:'⭐',color:'sage'})
const isChecked=(hId:string,date:string)=>logs.some(l=>l.habitId===hId&&l.date===date)
const toggle=(hId:string,date:string)=>{
const exists=isChecked(hId,date)
const newLogs=exists?logs.filter(l=>!(l.habitId===hId&&l.date===date)):[...logs,{habitId:hId,date}]
update({habitLogs:newLogs})
}
const addHabit=()=>{
if(!form.label.trim())return
const h:Habit={id:generateId(),label:form.label,icon:form.icon,color:form.color}
update({customHabits:[...habits,h]}as any)
setForm({label:'',icon:'⭐',color:'sage'})
setAdding(false)
}
const deleteHabit=(id:string)=>update({customHabits:habits.filter(h=>h.id!==id)}as any)
const getColor=(n:string)=>COLORS.find(c=>c.name===n)||COLORS[0]
return(
<div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/30">
<div className="flex items-center justify-between mb-4">
<div><h2 className="text-lg font-semibold text-deeper">Habit Tracker</h2><p className="text-sm text-warm">Your personal habits</p></div>
<span className="text-xs text-warm">{habits.length} habits</span>
</div>
{habits.length>0&&<div className="flex items-center mb-3">
<div className="w-32 flex-shrink-0"/>
<div className="flex-1 grid grid-cols-7 gap-0.5">
{weekDays.map(day=><div key={formatDate(day)} className="text-center"><p className="text-xs text-warm">{format(day,'EEE')[0]}</p><p className={`text-xs font-medium ${formatDate(day)===today?'text-deeper':'text-sand'}`}>{format(day,'d')}</p></div>)}
</div>
<div className="w-8 flex-shrink-0"/>
</div>}
<div className="space-y-3 mb-4">
{habits.map(habit=>{
const color=getColor(habit.color)
const score=weekDays.filter(d=>isChecked(habit.id,formatDate(d))).length
return(<div key={habit.id} className="flex items-center gap-2">
<div className="w-32 flex-shrink-0 flex items-center gap-2">
<span className="text-lg">{habit.icon}</span>
<div><p className="text-xs font-medium text-deeper leading-tight">{habit.label}</p><p className={`text-xs ${color.text}`}>{score}/7</p></div>
</div>
<div className="flex-1 grid grid-cols-7 gap-0.5">
{weekDays.map(day=>{
const dateStr=formatDate(day)
const checked=isChecked(habit.id,dateStr)
const isToday=dateStr===today
return(<button key={dateStr} onClick={()=>toggle(habit.id,dateStr)} className={`h-7 rounded-lg transition-all ${checked?`${color.bg} opacity-90`:isToday?`${color.light} border border-sand/30`:'bg-cream/50 border border-sand/20'}`}>
{checked&&<span className="text-white text-xs">✓</span>}
</button>)
})}
</div>
<button onClick={()=>deleteHabit(habit.id)} className="w-8 flex-shrink-0 text-sand hover:text-blush text-xs text-center">✕</button>
</div>)
})}
</div>
{habits.length===0&&!adding&&<p className="text-xs text-sand italic text-center py-4">Add habits to track them across the week</p>}
{adding?<div className="bg-cream/50 rounded-xl p-3 space-y-2">
<div className="flex gap-2">
<input placeholder="Emoji" className="w-14 border border-sand/30 rounded-lg px-2 py-2 text-sm text-center bg-white" value={form.icon} onChange={e=>setForm({...form,icon:e.target.value})}/>
<input placeholder="Habit name" className="flex-1 border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={form.label} onChange={e=>setForm({...form,label:e.target.value})}/>
</div>
<div className="flex gap-1">
{COLORS.map(c=><button key={c.name} onClick={()=>setForm({...form,color:c.name})} className={`flex-1 h-7 rounded-lg ${c.bg} ${form.color===c.name?'ring-2 ring-deeper ring-offset-1':'opacity-50'}`}/>)}
</div>
<div className="flex gap-2">
<button onClick={addHabit} className="flex-1 bg-deeper text-white rounded-lg py-2 text-sm">Add Habit</button>
<button onClick={()=>setAdding(false)} className="flex-1 bg-cream border border-sand/30 text-warm rounded-lg py-2 text-sm">Cancel</button>
</div>
</div>:<button onClick={()=>setAdding(true)} className="w-full border border-dashed border-sand rounded-xl py-3 text-sm text-warm hover:bg-cream/50 transition-all">+ Add Habit</button>}
</div>
)
}

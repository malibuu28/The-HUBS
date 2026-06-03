'use client'
import{useState}from'react'
import{useDashboard}from'@/lib/useDashboard'
import{generateId,getQuarterKey}from'@/lib/utils'
import DebtSnowball from'./DebtSnowball'
import ProductTracker from'./ProductTracker'
import SocialMediaHub from'./SocialMediaHub'

interface IncomeEntry{id:string;source:'salary'|'hair'|'other';amount:number;date:string;note:string}
interface BusinessGoal{id:string;quarterKey:string;text:string;completed:boolean}

export default function BusinessView(){
const{data,update}=useDashboard()
const[activeTab,setActiveTab]=useState<'overview'|'income'|'goals'|'debt'|'products'|'social'>('overview')
const income:IncomeEntry[]=(data as any).income||[]
const businessGoals:BusinessGoal[]=(data as any).businessGoals||[]
const quarterKey=getQuarterKey()
const[incomeForm,setIncomeForm]=useState({source:'hair' as IncomeEntry['source'],amount:'',note:''})
const[goalText,setGoalText]=useState('')

const currentQuarterGoals=businessGoals.filter(g=>g.quarterKey===quarterKey)
const totalIncome=income.reduce((sum,i)=>sum+i.amount,0)
const hairIncome=income.filter(i=>i.source==='hair').reduce((sum,i)=>sum+i.amount,0)
const salaryIncome=income.filter(i=>i.source==='salary').reduce((sum,i)=>sum+i.amount,0)

const addIncome=()=>{
if(!incomeForm.amount)return
const entry:IncomeEntry={id:generateId(),source:incomeForm.source,amount:parseFloat(incomeForm.amount),date:new Date().toISOString().split('T')[0],note:incomeForm.note}
update({income:[...income,entry]}as any)
setIncomeForm({source:'hair',amount:'',note:''})
}

const addGoal=()=>{
if(!goalText.trim())return
const goal:BusinessGoal={id:generateId(),quarterKey,text:goalText,completed:false}
update({businessGoals:[...businessGoals,goal]}as any)
setGoalText('')
}

const toggleGoal=(id:string)=>{
update({businessGoals:businessGoals.map(g=>g.id===id?{...g,completed:!g.completed}:g)}as any)
}

const SOURCE_LABELS={salary:{label:'Salary',icon:'💼'},hair:{label:'Hair Business',icon:'✂️'},other:{label:'Other',icon:'💰'}}

return(
<div className="space-y-4">
<div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/30">
<h2 className="text-lg font-semibold text-deeper mb-1">Business 💼</h2>
<p className="text-xs text-warm mb-4">Income · Debt · Products · Social · Goals</p>
<div className="flex gap-1 mb-4 overflow-x-auto pb-1">
{(['overview','income','goals','debt','products','social'] as const).map(tab=>(
<button key={tab} onClick={()=>setActiveTab(tab)} className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${activeTab===tab?'bg-deeper text-white':'bg-cream/50 text-warm border border-sand/20'}`}>{tab}</button>
))}
</div>

{activeTab==='overview'&&(
<div className="grid grid-cols-2 gap-3">
<div className="bg-cream/50 rounded-xl p-3 border border-sand/20"><p className="text-xs text-warm mb-1">Total Income</p><p className="text-xl font-light text-deeper">${totalIncome.toLocaleString()}</p></div>
<div className="bg-cream/50 rounded-xl p-3 border border-sand/20"><p className="text-xs text-warm mb-1">Hair Business</p><p className="text-xl font-light text-blush">${hairIncome.toLocaleString()}</p></div>
<div className="bg-cream/50 rounded-xl p-3 border border-sand/20"><p className="text-xs text-warm mb-1">Salary</p><p className="text-xl font-light text-sage">${salaryIncome.toLocaleString()}</p></div>
<div className="bg-cream/50 rounded-xl p-3 border border-sand/20"><p className="text-xs text-warm mb-1">Q Goals</p><p className="text-xl font-light text-moss">{currentQuarterGoals.filter(g=>g.completed).length}/{currentQuarterGoals.length}</p></div>
</div>
)}

{activeTab==='income'&&(
<div className="space-y-3">
<div className="space-y-2 mb-3">
{income.slice(-5).reverse().map(entry=>(
<div key={entry.id} className="flex items-center justify-between bg-cream/50 rounded-xl p-3 border border-sand/20">
<div className="flex items-center gap-2">
<span>{SOURCE_LABELS[entry.source].icon}</span>
<div><p className="text-sm text-deeper">{SOURCE_LABELS[entry.source].label}</p><p className="text-xs text-warm">{entry.date}{entry.note&&` · ${entry.note}`}</p></div>
</div>
<span className="text-sm font-medium text-deeper">+${entry.amount.toLocaleString()}</span>
</div>
))}
</div>
<div className="bg-cream/50 rounded-xl p-3 space-y-2">
<select className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={incomeForm.source} onChange={e=>setIncomeForm({...incomeForm,source:e.target.value as any})}>
{(Object.keys(SOURCE_LABELS) as IncomeEntry['source'][]).map(s=><option key={s} value={s}>{SOURCE_LABELS[s].label}</option>)}
</select>
<input type="number" placeholder="Amount" className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={incomeForm.amount} onChange={e=>setIncomeForm({...incomeForm,amount:e.target.value})}/>
<input placeholder="Note (optional)" className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={incomeForm.note} onChange={e=>setIncomeForm({...incomeForm,note:e.target.value})}/>
<button onClick={addIncome} className="w-full bg-deeper text-white rounded-lg py-2 text-sm">Log Income</button>
</div>
</div>
)}

{activeTab==='goals'&&(
<div className="space-y-3">
<p className="text-xs text-warm">{quarterKey} Goals</p>
<div className="space-y-2">
{currentQuarterGoals.map(goal=>(
<button key={goal.id} onClick={()=>toggleGoal(goal.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${goal.completed?'bg-moss/10 border border-moss/30':'bg-cream/50 border border-sand/20'}`}>
<div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${goal.completed?'bg-moss border-moss':'border-sand'}`}>
{goal.completed&&<span className="text-white text-xs">✓</span>}
</div>
<span className={`text-sm ${goal.completed?'text-moss line-through':'text-deeper'}`}>{goal.text}</span>
</button>
))}
</div>
<div className="flex gap-2">
<input placeholder="Add a business goal..." className="flex-1 border border-sand/30 rounded-xl px-3 py-2 text-sm text-deeper bg-cream/50" value={goalText} onChange={e=>setGoalText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addGoal()}/>
<button onClick={addGoal} className="bg-deeper text-white rounded-xl px-4 py-2 text-sm">+</button>
</div>
</div>
)}
</div>

{activeTab==='debt'&&<DebtSnowball/>}
{activeTab==='products'&&<ProductTracker/>}
{activeTab==='social'&&<SocialMediaHub/>}
</div>
)
}

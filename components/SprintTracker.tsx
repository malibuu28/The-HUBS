'use client'
import { useState } from 'react'
import { useDashboard } from '@/lib/useDashboard'
import { generateId, formatDate } from '@/lib/utils'

const CATEGORIES = ['Spirituality', 'Business', 'Personal Development', 'Health'] as const

interface Step {
  id: string
  text: string
  completed: boolean
}

interface Project {
  id: string
  title: string
  category: typeof CATEGORIES[number]
  steps: Step[]
  completed: boolean
}

interface Sprint {
  id: string
  title: string
  sprintNumber: number
  year: number
  startDate: string
  endDate: string
  projects: Project[]
}

export default function SprintTracker() {
  const { data, update } = useDashboard()
  const sprints: Sprint[] = (data as any).sprints || []
  const currentYear = new Date().getFullYear()
  const yearSprints = sprints.filter(s => s.year === currentYear)
  const [selectedSprint, setSelectedSprint] = useState<string | null>(
    yearSprints[yearSprints.length - 1]?.id || null
  )
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [addingProject, setAddingProject] = useState(false)
  const [addingStep, setAddingStep] = useState(false)
  const [projectForm, setProjectForm] = useState({ title: '', category: 'Business' as typeof CATEGORIES[number] })
  const [stepText, setStepText] = useState('')

  const SPRINT_DATES = [
    { num: 1, label: 'Sprint 1', start: `${currentYear}-01-01`, end: `${currentYear}-03-31` },
    { num: 2, label: 'Sprint 2', start: `${currentYear}-04-01`, end: `${currentYear}-06-30` },
    { num: 3, label: 'Sprint 3', start: `${currentYear}-07-01`, end: `${currentYear}-09-30` },
    { num: 4, label: 'Sprint 4', start: `${currentYear}-10-01`, end: `${currentYear}-12-31` },
  ]

  const activeSprint = sprints.find(s => s.id === selectedSprint) || null
  const activeProject = activeSprint?.projects.find(p => p.id === selectedProject) || null

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate)
    const today = new Date()
    return Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
  }

  const getCurrentSprintNum = () => {
    const month = new Date().getMonth() + 1
    return Math.ceil(month / 3)
  }

  const createSprint = (sprintDef: typeof SPRINT_DATES[0]) => {
    const exists = yearSprints.find(s => s.sprintNumber === sprintDef.num)
    if (exists) { setSelectedSprint(exists.id); return }
    const newSprint: Sprint = {
      id: generateId(),
      title: sprintDef.label,
      sprintNumber: sprintDef.num,
      year: currentYear,
      startDate: sprintDef.start,
      endDate: sprintDef.end,
      projects: [],
    }
    const updated = [...sprints, newSprint]
    update({ sprints: updated } as any)
    setSelectedSprint(newSprint.id)
  }

  const addProject = () => {
    if (!projectForm.title || !activeSprint) return
    if (activeSprint.projects.length >= 5) return
    const project: Project = {
      id: generateId(),
      title: projectForm.title,
      category: projectForm.category,
      steps: [],
      completed: false,
    }
    const updated = sprints.map(s =>
      s.id === activeSprint.id
        ? { ...s, projects: [...s.projects, project] }
        : s
    )
    update({ sprints: updated } as any)
    setProjectForm({ title: '', category: 'Business' })
    setAddingProject(false)
  }

  const addStep = () => {
    if (!stepText || !activeSprint || !activeProject) return
    if (activeProject.steps.length >= 5) return
    const step: Step = { id: generateId(), text: stepText, completed: false }
    const updated = sprints.map(s =>
      s.id === activeSprint.id
        ? {
            ...s,
            projects: s.projects.map(p =>
              p.id === activeProject.id
                ? { ...p, steps: [...p.steps, step] }
                : p
            ),
          }
        : s
    )
    update({ sprints: updated } as any)
    setStepText('')
    setAddingStep(false)
  }

  const toggleStep = (stepId: string) => {
    if (!activeSprint || !activeProject) return
    const updated = sprints.map(s =>
      s.id === activeSprint.id
        ? {
            ...s,
            projects: s.projects.map(p =>
              p.id === activeProject.id
                ? {
                    ...p,
                    steps: p.steps.map(st =>
                      st.id === stepId ? { ...st, completed: !st.completed } : st
                    ),
                  }
                : p
            ),
          }
        : s
    )
    update({ sprints: updated } as any)
  }

  const toggleProject = (projectId: string) => {
    if (!activeSprint) return
    const updated = sprints.map(s =>
      s.id === activeSprint.id
        ? {
            ...s,
            projects: s.projects.map(p =>
              p.id === projectId ? { ...p, completed: !p.completed } : p
            ),
          }
        : s
    )
    update({ sprints: updated } as any)
  }

  const currentSprintNum = getCurrentSprintNum()

  return (
    <div className="space-y-4">
      {/* Year overview - 4 sprints */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/30">
        <h2 className="text-lg font-semibold text-deeper mb-1">90-Day Sprints 🚀</h2>
        <p className="text-xs text-warm mb-4">{currentYear} · 4 Sprints · 12 Week Year</p>
        <div className="grid grid-cols-4 gap-2">
          {SPRINT_DATES.map(s => {
            const existing = yearSprints.find(ys => ys.sprintNumber === s.num)
            const isActive = selectedSprint === existing?.id
            const isCurrent = s.num === currentSprintNum
            const projectCount = existing?.projects.length || 0
            const completedCount = existing?.projects.filter(p => p.completed).length || 0
            return (
              <button
                key={s.num}
                onClick={() => createSprint(s)}
                className={`p-3 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-deeper text-white'
                    : isCurrent
                    ? 'bg-moss/20 border border-moss/40'
                    : 'bg-cream/50 border border-sand/20'
                }`}
              >
                <p className={`text-xs font-semibold ${isActive ? 'text-cream' : 'text-deeper'}`}>
                  Q{s.num}
                </p>
                <p className={`text-xs ${isActive ? 'text-cream/70' : 'text-warm'}`}>
                  {isCurrent ? '← now' : ''}
                </p>
                {existing && (
                  <p className={`text-xs mt-1 ${isActive ? 'text-cream/70' : 'text-sage'}`}>
                    {completedCount}/{projectCount} done
                  </p>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected sprint - projects */}
      {activeSprint && !activeProject && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/30">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-semibold text-deeper">{activeSprint.title}</h3>
            <span className="text-xs text-warm">{getDaysLeft(activeSprint.endDate)} days left</span>
          </div>
          <p className="text-xs text-warm mb-4">
            Up to 5 projects · tap a project to add steps
          </p>

          <div className="space-y-2 mb-3">
            {activeSprint.projects.map(project => {
              const stepsCompleted = project.steps.filter(s => s.completed).length
              const stepsTotal = project.steps.length
              return (
                <div key={project.id} className="bg-cream/50 rounded-xl border border-sand/20">
                  <div className="flex items-center gap-3 p-3">
                    <button
                      onClick={() => toggleProject(project.id)}
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        project.completed ? 'bg-moss border-moss' : 'border-sand'
                      }`}
                    >
                      {project.completed && <span className="text-white text-xs">✓</span>}
                    </button>
                    <button
                      onClick={() => setSelectedProject(project.id)}
                      className="flex-1 text-left"
                    >
                      <p className={`text-sm font-medium ${project.completed ? 'text-sage line-through' : 'text-deeper'}`}>
                        {project.title}
                      </p>
                      <p className="text-xs text-warm">
                        {project.category} · {stepsCompleted}/{stepsTotal} steps
                      </p>
                    </button>
                    <span className="text-xs text-sand">→</span>
                  </div>
                  {stepsTotal > 0 && (
                    <div className="px-3 pb-3">
                      <div className="w-full bg-white rounded-full h-1">
                        <div
                          className="bg-moss h-1 rounded-full transition-all"
                          style={{ width: `${stepsTotal > 0 ? (stepsCompleted / stepsTotal) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {activeSprint.projects.length < 5 && (
            addingProject ? (
              <div className="bg-cream/50 rounded-xl p-3 space-y-2">
                <input
                  placeholder="Project title..."
                  className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white"
                  value={projectForm.title}
                  onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
                />
                <select
                  className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white"
                  value={projectForm.category}
                  onChange={e => setProjectForm({ ...projectForm, category: e.target.value as any })}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="flex gap-2">
                  <button onClick={addProject} className="flex-1 bg-deeper text-white rounded-lg py-2 text-sm">Add</button>
                  <button onClick={() => setAddingProject(false)} className="flex-1 bg-cream text-warm rounded-lg py-2 text-sm border border-sand/30">Cancel</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingProject(true)}
                className="w-full border border-dashed border-sand rounded-xl py-3 text-sm text-warm"
              >
                + Add Project ({activeSprint.projects.length}/5)
              </button>
            )
          )}
        </div>
      )}

      {/* Selected project - steps */}
      {activeSprint && activeProject && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/30">
          <button
            onClick={() => setSelectedProject(null)}
            className="text-xs text-warm mb-3 flex items-center gap-1"
          >← Back to {activeSprint.title}</button>
          <h3 className="text-base font-semibold text-deeper mb-1">{activeProject.title}</h3>
          <p className="text-xs text-warm mb-4">{activeProject.category} · Up to 5 steps</p>

          <div className="space-y-2 mb-3">
            {activeProject.steps.map((step, i) => (
              <button
                key={step.id}
                onClick={() => toggleStep(step.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  step.completed ? 'bg-moss/10 border border-moss/30' : 'bg-cream/50 border border-sand/20'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                  step.completed ? 'bg-moss border-moss' : 'border-sand'
                }`}>
                  {step.completed && <span className="text-white text-xs">✓</span>}
                </div>
                <span className="text-xs text-warm mr-1">{i + 1}.</span>
                <span className={`text-sm flex-1 ${step.completed ? 'text-moss line-through' : 'text-deeper'}`}>
                  {step.text}
                </span>
              </button>
            ))}
          </div>

          {activeProject.steps.length < 5 && (
            addingStep ? (
              <div className="bg-cream/50 rounded-xl p-3 space-y-2">
                <input
                  placeholder="What's the next step?"
                  className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white"
                  value={stepText}
                  onChange={e => setStepText(e.target.value)}
                />
                <div className="flex gap-2">
                  <button onClick={addStep} className="flex-1 bg-deeper text-white rounded-lg py-2 text-sm">Add Step</button>
                  <button onClick={() => setAddingStep(false)} className="flex-1 bg-cream text-warm rounded-lg py-2 text-sm border border-sand/30">Cancel</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingStep(true)}
                className="w-full border border-dashed border-sand rounded-xl py-3 text-sm text-warm"
              >
                + Add Step ({activeProject.steps.length}/5)
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}

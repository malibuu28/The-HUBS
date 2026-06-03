export interface Task {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

export interface HabitLog {
  habitId: string
  date: string
}

export interface CustomHabit {
  id: string
  label: string
  icon: string
  color: string
  bg: string
  border: string
  goal: number
  section: 'daily' | 'devotional' | 'spiritual' | 'business'
}

export interface DebtItem {
  id: string
  name: string
  balance: number
  originalBalance: number
  minimumPayment: number
  interestRate: number
  color: string
}

export interface SprintGoal {
  id: string
  sprintKey: string
  category: 'Spirituality' | 'Business' | 'Personal Development' | 'Health'
  text: string
  completed: boolean
}

export interface Sprint {
  id: string
  sprintKey: string
  startDate: string
  endDate: string
  title: string
  goals: SprintGoal[]
}

export interface ProductItem {
  id: string
  name: string
  line: 'zoe' | 'skincare'
  phase: number
  status: 'idea' | 'formulating' | 'testing' | 'ready' | 'launched'
  notes: string
}

export interface BucketListItem {
  id: string
  text: string
  completed: boolean
  completedAt?: string
  category?: string
}

export interface BookItem {
  id: string
  title: string
  author: string
  coverId?: string
  status: 'reading' | 'completed' | 'wishlist'
  quarterKey: string
}

export interface QuarterlyGoal {
  id: string
  quarterKey: string
  category: 'Finance' | 'Health' | 'Business' | 'Personal'
  text: string
  completed: boolean
}

export interface DashboardData {
  tasks?: Task[]
  habitLogs?: HabitLog[]
  customHabits?: CustomHabit[]
  debts?: DebtItem[]
  sprints?: Sprint[]
  products?: ProductItem[]
  bucketList?: BucketListItem[]
  books?: BookItem[]
  quarterlyGoals?: QuarterlyGoal[]
  weeklyFocus?: string
  yearlyVision?: string
  seventyFiveHolyStart?: string
}

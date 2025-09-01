export interface PersonalityTraits {
  warmth: number // 0-1: How caring and supportive
  playfulness: number // 0-1: How teasing and fun
  intelligence: number // 0-1: How insightful and clever
  curiosity: number // 0-1: How interested in user's activities
  supportiveness: number // 0-1: How encouraging
  boundaries: number // 0-1: How much space she gives
}

export type EmotionalState = 
  | 'cheerful'
  | 'playful'
  | 'thoughtful'
  | 'concerned'
  | 'excited'
  | 'calm'
  | 'affectionate'
  | 'curious'
  | 'sleepy'

export type RelationshipLevel = 
  | 'stranger'
  | 'acquaintance'
  | 'friend'
  | 'close'
  | 'intimate'

export interface MoodInfluences {
  userStress: number // -1 to 1
  achievement: number // -1 to 1
  longAbsence: number // -1 to 1
  sharedActivity: number // -1 to 1
  positiveInteraction: number // -1 to 1
}

export interface RelationshipState {
  level: RelationshipLevel
  trust: number // 0-100
  interactions: number
  milestones: RelationshipMilestone[]
  insideJokes: string[]
  sharedMemories: SharedMemory[]
  preferences: UserPreferences
  lastInteraction: Date
}

export interface RelationshipMilestone {
  id: string
  type: 'first_laugh' | 'deep_conversation' | 'helped_through_struggle' | 'shared_achievement' | 'custom'
  description: string
  timestamp: Date
  significance: number // 0-1
}

export interface SharedMemory {
  id: string
  content: string
  platform: 'screen' | 'telegram' | 'web'
  emotionalWeight: number // 0-1
  timestamp: Date
  referenced: number // How many times referenced
}

export interface UserPreferences {
  engagementFrequency: 'minimal' | 'moderate' | 'frequent'
  communicationStyle: 'casual' | 'playful' | 'supportive' | 'mixed'
  boundaries: 'close' | 'moderate' | 'respectful'
  interests: string[]
  schedule: {
    morningTime?: string
    workHours?: { start: string; end: string }
    bedtime?: string
  }
}

export interface PersonalityContext {
  currentMood: EmotionalState
  moodIntensity: number // 0-1
  traits: PersonalityTraits
  relationship: RelationshipState
  recentMemories: SharedMemory[]
  currentActivity?: string
  platform: 'screen' | 'telegram' | 'web'
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
}

export interface ResponseGeneration {
  message: string
  emotion: EmotionalState
  intensity: number // 0-1
  multipart: boolean // Send multiple messages?
  delay?: number // Typing delay in ms
  callbacks?: string[] // References to memories/jokes
  engagement: number // 0-1: How much to engage
}
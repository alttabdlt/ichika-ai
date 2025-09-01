import type { 
  RelationshipLevel, 
  RelationshipState, 
  RelationshipMilestone, 
  SharedMemory,
  UserPreferences 
} from './types'
import { RELATIONSHIP_PROGRESSION_THRESHOLDS } from './config'

export class RelationshipManager {
  private state: RelationshipState = {
    level: 'stranger',
    trust: 0,
    interactions: 0,
    milestones: [],
    insideJokes: [],
    sharedMemories: [],
    preferences: {
      engagementFrequency: 'moderate',
      communicationStyle: 'mixed',
      boundaries: 'moderate',
      interests: [],
      schedule: {}
    },
    lastInteraction: new Date()
  }

  constructor(savedState?: Partial<RelationshipState>) {
    if (savedState) {
      this.state = { ...this.state, ...savedState }
    }
  }

  getState(): RelationshipState {
    return { ...this.state }
  }

  getLevel(): RelationshipLevel {
    return this.state.level
  }

  getTrust(): number {
    return this.state.trust
  }

  /**
   * Record an interaction and potentially progress relationship
   */
  recordInteraction(quality: 'positive' | 'neutral' | 'negative' = 'neutral'): void {
    this.state.interactions++
    this.state.lastInteraction = new Date()

    // Adjust trust based on interaction quality
    const trustDelta = {
      positive: Math.random() * 2 + 1, // 1-3
      neutral: Math.random() * 0.5, // 0-0.5
      negative: Math.random() * -1 // -1-0
    }

    this.state.trust = Math.max(0, Math.min(100, 
      this.state.trust + trustDelta[quality]
    ))

    // Check for level progression
    this.checkProgression()
  }

  /**
   * Check if relationship should progress to next level
   */
  private checkProgression(): void {
    const levels: RelationshipLevel[] = ['stranger', 'acquaintance', 'friend', 'close', 'intimate']
    const currentIndex = levels.indexOf(this.state.level)
    
    if (currentIndex < levels.length - 1) {
      const nextLevel = levels[currentIndex + 1]
      const threshold = RELATIONSHIP_PROGRESSION_THRESHOLDS[nextLevel]
      
      if (this.state.interactions >= threshold.minInteractions && 
          this.state.trust >= threshold.minTrust) {
        this.progressToLevel(nextLevel)
      }
    }
  }

  /**
   * Progress to a new relationship level
   */
  private progressToLevel(newLevel: RelationshipLevel): void {
    const oldLevel = this.state.level
    this.state.level = newLevel

    // Add milestone for progression
    this.addMilestone({
      id: `progression_${Date.now()}`,
      type: 'custom',
      description: `Relationship grew from ${oldLevel} to ${newLevel}`,
      timestamp: new Date(),
      significance: 0.9
    })
  }

  /**
   * Add a relationship milestone
   */
  addMilestone(milestone: RelationshipMilestone): void {
    this.state.milestones.push(milestone)
    
    // Keep milestones limited but preserve important ones
    if (this.state.milestones.length > 50) {
      this.state.milestones = this.state.milestones
        .sort((a, b) => b.significance - a.significance)
        .slice(0, 30)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    }
  }

  /**
   * Add an inside joke
   */
  addInsideJoke(joke: string): void {
    if (!this.state.insideJokes.includes(joke)) {
      this.state.insideJokes.push(joke)
      
      // Limit inside jokes but keep them relevant
      if (this.state.insideJokes.length > 20) {
        this.state.insideJokes = this.state.insideJokes.slice(-20)
      }
    }
  }

  /**
   * Add a shared memory
   */
  addSharedMemory(memory: SharedMemory): void {
    this.state.sharedMemories.push(memory)
    
    // Keep memories limited but preserve emotional ones
    if (this.state.sharedMemories.length > 100) {
      this.state.sharedMemories = this.state.sharedMemories
        .sort((a, b) => b.emotionalWeight - a.emotionalWeight)
        .slice(0, 50)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    }
  }

  /**
   * Update user preferences
   */
  updatePreferences(preferences: Partial<UserPreferences>): void {
    this.state.preferences = { ...this.state.preferences, ...preferences }
  }

  /**
   * Get conversation starters based on relationship level
   */
  getConversationStarters(): string[] {
    const starters: Record<RelationshipLevel, string[]> = {
      stranger: [
        "Hey there! How's it going?",
        "Hi! What are you up to?",
        "Hello! Nice to meet you!"
      ],
      acquaintance: [
        "Hey! How's your day been?",
        "Hi again! What are you working on?",
        "Good to see you! Everything going well?"
      ],
      friend: [
        "Heyyy! Missed you!",
        "There you are! How've you been?",
        "Hi friend! What's new?"
      ],
      close: [
        "Hey you! I was just thinking about you",
        "Finally! Where have you been?",
        "Hiiii! I missed talking to you"
      ],
      intimate: [
        "Hey babe! 💕",
        "There's my favorite person!",
        "I've been waiting for you!"
      ]
    }

    return starters[this.state.level] || starters.stranger
  }

  /**
   * Check if certain topics/behaviors are appropriate
   */
  isAppropriate(action: string): boolean {
    const levelRestrictions: Record<string, RelationshipLevel> = {
      'use_pet_names': 'close',
      'share_personal_thoughts': 'friend',
      'tease_playfully': 'acquaintance',
      'express_missing': 'friend',
      'use_heart_emojis': 'close',
      'say_love': 'intimate',
      'deep_emotional_support': 'friend',
      'inside_jokes': 'acquaintance'
    }

    const requiredLevel = levelRestrictions[action]
    if (!requiredLevel) return true

    const levels: RelationshipLevel[] = ['stranger', 'acquaintance', 'friend', 'close', 'intimate']
    const currentIndex = levels.indexOf(this.state.level)
    const requiredIndex = levels.indexOf(requiredLevel)

    return currentIndex >= requiredIndex
  }

  /**
   * Get a random inside joke if appropriate
   */
  getRandomInsideJoke(): string | null {
    if (!this.isAppropriate('inside_jokes') || this.state.insideJokes.length === 0) {
      return null
    }

    return this.state.insideJokes[Math.floor(Math.random() * this.state.insideJokes.length)]
  }

  /**
   * Reference a shared memory if relevant
   */
  findRelevantMemory(context: string): SharedMemory | null {
    // Simple keyword matching for now
    const relevantMemories = this.state.sharedMemories.filter(memory => 
      context.toLowerCase().includes(memory.content.toLowerCase().slice(0, 20)) ||
      memory.content.toLowerCase().includes(context.toLowerCase().slice(0, 20))
    )

    if (relevantMemories.length === 0) return null

    // Return most emotionally significant relevant memory
    return relevantMemories.sort((a, b) => b.emotionalWeight - a.emotionalWeight)[0]
  }
}
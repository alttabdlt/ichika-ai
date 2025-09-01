export * from './types'
export * from './config'
export * from './mood'
export * from './relationship'
export * from './responses'

import { MoodManager } from './mood'
import { RelationshipManager } from './relationship'
import { ResponseGenerator } from './responses'
import type { 
  PersonalityContext, 
  ResponseGeneration,
  PersonalityTraits,
  EmotionalState,
  RelationshipState,
  MoodInfluences
} from './types'
import { DEFAULT_PERSONALITY_TRAITS } from './config'

/**
 * Main PersonalityCore class that orchestrates all personality components
 */
export class PersonalityCore {
  private moodManager: MoodManager
  private relationshipManager: RelationshipManager
  private responseGenerator: ResponseGenerator
  private traits: PersonalityTraits

  constructor(
    initialState?: {
      mood?: EmotionalState
      relationship?: Partial<RelationshipState>
      traits?: Partial<PersonalityTraits>
    }
  ) {
    this.traits = { ...DEFAULT_PERSONALITY_TRAITS, ...initialState?.traits }
    this.moodManager = new MoodManager(initialState?.mood)
    this.relationshipManager = new RelationshipManager(initialState?.relationship)
    this.responseGenerator = new ResponseGenerator(this.moodManager, this.relationshipManager)
  }

  /**
   * Generate a personality-driven response
   */
  async generateResponse(
    message: string,
    context?: Partial<PersonalityContext>
  ): Promise<ResponseGeneration> {
    const fullContext: PersonalityContext = {
      currentMood: this.moodManager.getCurrentMood(),
      moodIntensity: this.moodManager.getMoodIntensity(),
      traits: this.traits,
      relationship: this.relationshipManager.getState(),
      recentMemories: [],
      platform: 'web',
      timeOfDay: this.getTimeOfDay(),
      ...context
    }

    const response = await this.responseGenerator.generateResponse(message, fullContext)
    
    // Record the interaction
    this.relationshipManager.recordInteraction('neutral')
    
    return response
  }

  /**
   * Process screen observation and decide on engagement
   */
  processScreenObservation(
    scene: string,
    userState: 'focused' | 'casual' | 'struggling' | 'celebrating'
  ): ResponseGeneration | null {
    const context: Partial<PersonalityContext> = {
      platform: 'screen',
      currentActivity: scene,
      currentMood: this.moodManager.getCurrentMood(),
      traits: this.traits
    }

    // Check if should engage
    if (!this.shouldEngageScreen(userState)) {
      return null
    }

    // Generate contextual comment
    const response = this.responseGenerator.generateResponse(scene, context)
    
    return response
  }

  /**
   * Update mood based on influences
   */
  updateMood(influences: Partial<MoodInfluences>): void {
    const newMood = this.moodManager.calculateMoodShift(influences)
    if (newMood !== this.moodManager.getCurrentMood()) {
      this.moodManager.transitionMood(newMood)
    }
  }

  /**
   * Add a shared memory
   */
  addMemory(content: string, platform: 'screen' | 'telegram' | 'web', emotionalWeight: number): void {
    this.relationshipManager.addSharedMemory({
      id: `mem_${Date.now()}`,
      content,
      platform,
      emotionalWeight,
      timestamp: new Date(),
      referenced: 0
    })
  }

  /**
   * Add relationship milestone
   */
  addMilestone(type: string, description: string, significance: number): void {
    this.relationshipManager.addMilestone({
      id: `milestone_${Date.now()}`,
      type: 'custom',
      description,
      timestamp: new Date(),
      significance
    })
  }

  /**
   * Get current state for persistence
   */
  getState(): {
    mood: EmotionalState
    moodIntensity: number
    relationship: RelationshipState
    traits: PersonalityTraits
  } {
    return {
      mood: this.moodManager.getCurrentMood(),
      moodIntensity: this.moodManager.getMoodIntensity(),
      relationship: this.relationshipManager.getState(),
      traits: this.traits
    }
  }

  /**
   * Determine if should engage based on screen state
   */
  private shouldEngageScreen(userState: string): boolean {
    if (userState === 'focused') {
      // Don't interrupt deep focus
      return false
    }
    
    if (userState === 'celebrating') {
      // Always celebrate with user
      return true
    }
    
    if (userState === 'struggling') {
      // Offer help based on mood
      return this.moodManager.shouldEngage({ platform: 'screen' })
    }
    
    // Default: check mood-based engagement
    return this.moodManager.shouldEngage({ platform: 'screen' })
  }

  /**
   * Get current time of day
   */
  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours()
    if (hour < 6) return 'night'
    if (hour < 12) return 'morning'
    if (hour < 18) return 'afternoon'
    if (hour < 22) return 'evening'
    return 'night'
  }
}
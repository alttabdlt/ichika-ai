import type { 
  PersonalityContext, 
  ResponseGeneration,
  EmotionalState 
} from './types'
import { 
  TIME_AWARE_GREETINGS, 
  ACTIVITY_RESPONSES,
  DEFAULT_PERSONALITY_TRAITS 
} from './config'
import { MoodManager } from './mood'
import { RelationshipManager } from './relationship'

export class ResponseGenerator {
  private moodManager: MoodManager
  private relationshipManager: RelationshipManager

  constructor(
    moodManager: MoodManager,
    relationshipManager: RelationshipManager
  ) {
    this.moodManager = moodManager
    this.relationshipManager = relationshipManager
  }

  /**
   * Generate a personality-driven response
   */
  async generateResponse(
    message: string,
    context: Partial<PersonalityContext>
  ): Promise<ResponseGeneration> {
    const mood = this.moodManager.getCurrentMood()
    const moodIntensity = this.moodManager.getMoodIntensity()
    const relationship = this.relationshipManager.getState()
    const traits = context.traits || DEFAULT_PERSONALITY_TRAITS

    // Determine response characteristics based on personality
    const shouldMultipart = this.shouldSendMultiple(mood, moodIntensity)
    const typingDelay = this.calculateTypingDelay(message.length, mood)
    const emotion = this.determineEmotion(message, context)
    const engagement = this.calculateEngagement(context, traits)

    // Build response content
    let response = await this.buildResponse(message, context)
    
    // Add personality modifiers
    response = this.applyPersonalityModifiers(response, mood, relationship.level)
    
    // Add callbacks if appropriate
    const callbacks = this.findCallbacks(message, context)

    return {
      message: response,
      emotion,
      intensity: moodIntensity,
      multipart: shouldMultipart,
      delay: typingDelay,
      callbacks,
      engagement
    }
  }

  /**
   * Build the core response based on context
   */
  private async buildResponse(
    message: string,
    context: Partial<PersonalityContext>
  ): Promise<string> {
    // Time-aware greetings
    if (this.isGreeting(message)) {
      return this.getTimeAwareGreeting(context.timeOfDay || 'afternoon')
    }

    // Activity-based responses
    if (context.currentActivity) {
      return this.getActivityResponse(context.currentActivity)
    }

    // Platform-specific styles
    if (context.platform === 'screen') {
      return this.generateScreenComment(context)
    }

    // Default conversational response (would integrate with LLM here)
    return this.generateConversationalResponse(message, context)
  }

  /**
   * Determine if message is a greeting
   */
  private isGreeting(message: string): boolean {
    const greetings = ['hi', 'hello', 'hey', 'morning', 'evening', 'sup', 'yo']
    const lower = message.toLowerCase()
    return greetings.some(g => lower.includes(g))
  }

  /**
   * Get time-appropriate greeting
   */
  private getTimeAwareGreeting(timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'): string {
    const greetings = TIME_AWARE_GREETINGS[timeOfDay]
    const relationship = this.relationshipManager.getLevel()
    
    // Modify based on relationship
    let greeting = greetings[Math.floor(Math.random() * greetings.length)]
    
    if (relationship === 'intimate') {
      greeting = greeting.replace('!', ' babe!')
    } else if (relationship === 'close') {
      greeting = greeting.replace('!', '! Missed you!')
    }
    
    return greeting
  }

  /**
   * Get activity-specific response
   */
  private getActivityResponse(activity: string): string {
    // Parse activity type and status
    if (activity.includes('gaming')) {
      if (activity.includes('victory')) {
        const responses = ACTIVITY_RESPONSES.gaming.victory
        return responses[Math.floor(Math.random() * responses.length)]
      }
      // Add more gaming conditions...
    }
    
    if (activity.includes('coding')) {
      if (activity.includes('error') || activity.includes('bug')) {
        const responses = ACTIVITY_RESPONSES.coding.debugging
        return responses[Math.floor(Math.random() * responses.length)]
      }
      // Add more coding conditions...
    }

    // Default activity acknowledgment
    return "I see what you're doing there!"
  }

  /**
   * Generate screen watching comment
   */
  private generateScreenComment(context: Partial<PersonalityContext>): string {
    const mood = this.moodManager.getCurrentMood()
    const relationship = this.relationshipManager.getLevel()
    
    // Build contextual comment
    let comment = "Watching you work is interesting"
    
    if (mood === 'playful') {
      comment = "Hehe, I see what you're doing"
    } else if (mood === 'supportive') {
      comment = "You're doing great!"
    }
    
    // Add relationship flavor
    if (relationship === 'intimate' || relationship === 'close') {
      comment += " 💕"
    }
    
    return comment
  }

  /**
   * Generate conversational response (simplified - would use LLM)
   */
  private generateConversationalResponse(
    message: string,
    context: Partial<PersonalityContext>
  ): string {
    const mood = this.moodManager.getCurrentMood()
    const relationship = this.relationshipManager.getLevel()
    
    // Simplified response generation
    // In production, this would call the LLM with personality prompt
    const baseResponses = {
      cheerful: "That sounds great!",
      playful: "Ooh interesting hehe",
      thoughtful: "Hmm, let me think about that...",
      concerned: "Are you okay? That sounds tough",
      excited: "OMG yes!!",
      calm: "I understand what you mean",
      affectionate: "Aww, you're sweet",
      curious: "Tell me more about that!",
      sleepy: "Mmm... *yawns* sorry, bit tired"
    }
    
    return baseResponses[mood] || "I'm listening..."
  }

  /**
   * Apply personality modifiers to response
   */
  private applyPersonalityModifiers(
    response: string,
    mood: EmotionalState,
    relationshipLevel: RelationshipLevel
  ): string {
    const moodMod = this.moodManager.getMoodModifier()
    
    // Apply mood modifiers
    if (moodMod.prefix) response = moodMod.prefix + response
    if (moodMod.suffix) response = response + moodMod.suffix
    if (moodMod.emoji && Math.random() < 0.5) response = response + ' ' + moodMod.emoji
    
    // Apply relationship modifiers
    if (relationshipLevel === 'intimate' && Math.random() < 0.3) {
      response = response.replace(/you/gi, 'babe')
    } else if (relationshipLevel === 'close' && Math.random() < 0.2) {
      response = response.replace(/you/gi, 'hun')
    }
    
    return response
  }

  /**
   * Determine if should send multiple messages
   */
  private shouldSendMultiple(mood: EmotionalState, intensity: number): boolean {
    const multipartMoods: EmotionalState[] = ['excited', 'playful', 'curious']
    return multipartMoods.includes(mood) && intensity > 0.7 && Math.random() < 0.4
  }

  /**
   * Calculate realistic typing delay
   */
  private calculateTypingDelay(messageLength: number, mood: EmotionalState): number {
    const baseDelay = messageLength * 50 // 50ms per character
    const moodMultiplier = mood === 'excited' ? 0.7 : mood === 'thoughtful' ? 1.3 : 1
    const variance = Math.random() * 500 - 250 // ±250ms variance
    
    return Math.max(500, Math.min(5000, baseDelay * moodMultiplier + variance))
  }

  /**
   * Determine emotion for response
   */
  private determineEmotion(message: string, context: Partial<PersonalityContext>): EmotionalState {
    // Use current mood as base
    const currentMood = this.moodManager.getCurrentMood()
    
    // Adjust based on message sentiment (simplified)
    if (message.includes('!') || message.includes('amazing')) {
      return 'excited'
    }
    if (message.includes('?')) {
      return 'curious'
    }
    if (message.includes('sad') || message.includes('tired')) {
      return 'concerned'
    }
    
    return currentMood
  }

  /**
   * Calculate engagement level
   */
  private calculateEngagement(
    context: Partial<PersonalityContext>,
    traits: typeof DEFAULT_PERSONALITY_TRAITS
  ): number {
    let engagement = 0.5 // Base engagement
    
    // Adjust based on traits
    engagement += traits.curiosity * 0.2
    engagement += traits.warmth * 0.1
    engagement -= traits.boundaries * 0.1
    
    // Adjust based on context
    if (context.currentActivity?.includes('struggle')) {
      engagement += 0.3 // More engaged when user needs help
    }
    
    return Math.max(0, Math.min(1, engagement))
  }

  /**
   * Find relevant callbacks/references
   */
  private findCallbacks(message: string, context: Partial<PersonalityContext>): string[] {
    const callbacks: string[] = []
    
    // Check for inside joke opportunity
    const joke = this.relationshipManager.getRandomInsideJoke()
    if (joke && Math.random() < 0.2) {
      callbacks.push(joke)
    }
    
    // Check for memory reference
    const memory = this.relationshipManager.findRelevantMemory(message)
    if (memory && Math.random() < 0.3) {
      callbacks.push(`Remember when ${memory.content}?`)
    }
    
    return callbacks
  }
}
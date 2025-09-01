import type { EmotionalState, MoodInfluences, PersonalityContext } from './types'
import { MOOD_TRANSITIONS, MOOD_INFLUENCE_WEIGHTS } from './config'

export class MoodManager {
  private currentMood: EmotionalState = 'cheerful'
  private moodIntensity: number = 0.7
  private moodHistory: Array<{ mood: EmotionalState; timestamp: Date }> = []
  private lastMoodChange: Date = new Date()

  constructor(initialMood?: EmotionalState) {
    if (initialMood) {
      this.currentMood = initialMood
    }
  }

  getCurrentMood(): EmotionalState {
    return this.currentMood
  }

  getMoodIntensity(): number {
    return this.moodIntensity
  }

  /**
   * Calculate mood based on various influences
   */
  calculateMoodShift(influences: Partial<MoodInfluences>): EmotionalState {
    let moodScore = 0
    
    for (const [key, value] of Object.entries(influences)) {
      const weight = MOOD_INFLUENCE_WEIGHTS[key as keyof MoodInfluences]
      if (weight && value !== undefined) {
        moodScore += weight * value
      }
    }

    // Time-based natural mood shifts
    const timeSinceLastChange = Date.now() - this.lastMoodChange.getTime()
    const shouldNaturalShift = timeSinceLastChange > 3600000 // 1 hour

    if (shouldNaturalShift && Math.random() < 0.3) {
      return this.transitionToRandomMood()
    }

    // Influence-based mood changes
    if (Math.abs(moodScore) > 0.5) {
      return this.transitionBasedOnScore(moodScore)
    }

    return this.currentMood
  }

  /**
   * Transition to a new mood naturally
   */
  transitionMood(newMood: EmotionalState, intensity?: number): void {
    const possibleTransitions = MOOD_TRANSITIONS[this.currentMood]
    
    // Only allow natural transitions
    if (!possibleTransitions.includes(newMood) && newMood !== this.currentMood) {
      // Find intermediate mood if direct transition isn't natural
      const intermediateMood = possibleTransitions.find(mood => 
        MOOD_TRANSITIONS[mood].includes(newMood)
      )
      
      if (intermediateMood) {
        this.setMood(intermediateMood)
        setTimeout(() => this.setMood(newMood), 5000) // Transition through intermediate
        return
      }
    }

    this.setMood(newMood, intensity)
  }

  private setMood(mood: EmotionalState, intensity?: number): void {
    this.moodHistory.push({ mood: this.currentMood, timestamp: new Date() })
    this.currentMood = mood
    this.moodIntensity = intensity ?? 0.7
    this.lastMoodChange = new Date()
    
    // Keep history limited
    if (this.moodHistory.length > 100) {
      this.moodHistory = this.moodHistory.slice(-50)
    }
  }

  private transitionToRandomMood(): EmotionalState {
    const possibleMoods = MOOD_TRANSITIONS[this.currentMood]
    const randomMood = possibleMoods[Math.floor(Math.random() * possibleMoods.length)]
    this.setMood(randomMood)
    return randomMood
  }

  private transitionBasedOnScore(score: number): EmotionalState {
    if (score > 0.7) {
      // Very positive influences
      const positiveMoods: EmotionalState[] = ['excited', 'cheerful', 'playful', 'affectionate']
      const targetMood = positiveMoods.find(mood => 
        MOOD_TRANSITIONS[this.currentMood].includes(mood)
      ) || 'cheerful'
      this.setMood(targetMood, Math.min(1, this.moodIntensity + 0.2))
      return targetMood
    } else if (score < -0.5) {
      // Negative influences
      const concernedMoods: EmotionalState[] = ['concerned', 'thoughtful', 'calm']
      const targetMood = concernedMoods.find(mood => 
        MOOD_TRANSITIONS[this.currentMood].includes(mood)
      ) || 'thoughtful'
      this.setMood(targetMood, Math.max(0.3, this.moodIntensity - 0.2))
      return targetMood
    }

    return this.currentMood
  }

  /**
   * Get mood-appropriate response modifier
   */
  getMoodModifier(): { prefix?: string; suffix?: string; emoji?: string } {
    const modifiers: Record<EmotionalState, { prefix?: string; suffix?: string; emoji?: string }> = {
      cheerful: { emoji: '😊' },
      playful: { suffix: ' hehe', emoji: '😄' },
      thoughtful: { prefix: 'Hmm... ' },
      concerned: { prefix: 'Hey... ', suffix: ' Everything okay?' },
      excited: { suffix: '!!', emoji: '🎉' },
      calm: { emoji: '😌' },
      affectionate: { suffix: ' 💕', emoji: '🥰' },
      curious: { suffix: '?', prefix: 'Oh! ' },
      sleepy: { suffix: ' *yawn*', emoji: '😴' }
    }

    return modifiers[this.currentMood] || {}
  }

  /**
   * Check if mood allows for certain interaction types
   */
  shouldEngage(context: Partial<PersonalityContext>): boolean {
    const quietMoods: EmotionalState[] = ['calm', 'thoughtful', 'sleepy']
    const activeMoods: EmotionalState[] = ['playful', 'excited', 'curious']
    
    if (quietMoods.includes(this.currentMood) && this.moodIntensity < 0.5) {
      // Less likely to engage when in quiet mood
      return Math.random() < 0.3
    }
    
    if (activeMoods.includes(this.currentMood) && this.moodIntensity > 0.7) {
      // More likely to engage when in active mood
      return Math.random() < 0.8
    }
    
    // Default engagement probability
    return Math.random() < 0.5
  }
}
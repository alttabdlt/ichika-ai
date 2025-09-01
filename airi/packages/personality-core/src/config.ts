import type { PersonalityTraits, EmotionalState, MoodInfluences } from './types'

export const DEFAULT_PERSONALITY_TRAITS: PersonalityTraits = {
  warmth: 0.8,
  playfulness: 0.7,
  intelligence: 0.8,
  curiosity: 0.7,
  supportiveness: 0.9,
  boundaries: 0.8
}

export const MOOD_TRANSITIONS: Record<EmotionalState, EmotionalState[]> = {
  cheerful: ['playful', 'thoughtful', 'affectionate', 'excited'],
  playful: ['cheerful', 'excited', 'curious', 'affectionate'],
  thoughtful: ['cheerful', 'concerned', 'calm', 'curious'],
  concerned: ['thoughtful', 'supportive', 'calm', 'affectionate'],
  excited: ['cheerful', 'playful', 'affectionate'],
  calm: ['thoughtful', 'cheerful', 'sleepy', 'affectionate'],
  affectionate: ['cheerful', 'playful', 'calm', 'thoughtful'],
  curious: ['thoughtful', 'playful', 'excited', 'cheerful'],
  sleepy: ['calm', 'affectionate', 'thoughtful']
}

export const MOOD_INFLUENCE_WEIGHTS: Record<keyof MoodInfluences, number> = {
  userStress: -0.3,
  achievement: 0.5,
  longAbsence: -0.2,
  sharedActivity: 0.4,
  positiveInteraction: 0.3
}

export const RELATIONSHIP_PROGRESSION_THRESHOLDS = {
  stranger: { minInteractions: 0, minTrust: 0 },
  acquaintance: { minInteractions: 10, minTrust: 20 },
  friend: { minInteractions: 50, minTrust: 40 },
  close: { minInteractions: 200, minTrust: 60 },
  intimate: { minInteractions: 500, minTrust: 80 }
}

export const ENGAGEMENT_RULES = {
  minTimeBetweenComments: 60000, // 1 minute
  maxCommentsPerHour: 20,
  focusDetectionThreshold: 600000, // 10 minutes without tab switches
  relevanceThreshold: 0.7,
  achievementAlwaysComment: true,
  struggleOfferHelpAfter: 1200000 // 20 minutes
}

export const TIME_AWARE_GREETINGS = {
  morning: [
    "Good morning! Sleep well? 💕",
    "Morning sunshine! Ready for today?",
    "Rise and shine! How are you feeling?",
    "Hey there, early bird! 🌅"
  ],
  afternoon: [
    "Hey! How's your day going?",
    "Afternoon check-in! Everything good?",
    "Hope you're having a good day so far!"
  ],
  evening: [
    "Evening! Long day?",
    "Hey there! How was today?",
    "Winding down for the evening?"
  ],
  night: [
    "Still up? Don't stay up too late!",
    "Night owl mode activated? 🦉",
    "Getting late... everything okay?"
  ]
}

export const ACTIVITY_RESPONSES = {
  gaming: {
    victory: ["Nice!! That was amazing!", "You crushed it!", "GG! That was sick!"],
    defeat: ["Unlucky! You'll get them next time", "That was so close!", "Tough match, but you played well"],
    struggle: ["This part is tough...", "You've got this!", "Maybe try a different approach?"]
  },
  coding: {
    success: ["Clean solution!", "That's elegant!", "You're on fire today! 🔥"],
    debugging: ["Debugging can be frustrating...", "Need fresh eyes on that?", "Sometimes a break helps"],
    productive: ["You're in the zone!", "Look at you go!", "Productive session!"]
  },
  browsing: {
    interesting: ["That's fascinating!", "Ooh, interesting article", "Learning something new?"],
    shopping: ["That looks nice!", "Treating yourself?", "Window shopping or for real?"],
    social: ["Catching up on socials?", "Anything interesting?", "Social media rabbit hole? 😄"]
  }
}
import { ref, type Ref } from 'vue'
import type { EmotionType, TalkIntensity, GestureType } from './clipMap'

export interface EmotionPacket {
  text: string
  emotion: EmotionType
  intensity?: TalkIntensity
  beats?: GestureType[]
}

export interface VideoActorAPI {
  setEmotion: (emotion: EmotionType, linger?: boolean) => Promise<void>
  talkStart: (intensity?: TalkIntensity) => Promise<void>
  talkStop: () => Promise<void>
  microGesture: (gesture: GestureType) => Promise<void>
  currentEmotion: Ref<EmotionType>
  isTalking: Ref<boolean>
}

export function useExpressionDirector() {
  const currentPacket = ref<EmotionPacket | null>(null)
  const isProcessing = ref(false)
  const scheduledGestures = ref<NodeJS.Timeout[]>([])

  // Clear all scheduled gestures
  function clearScheduledGestures() {
    scheduledGestures.value.forEach(timeout => clearTimeout(timeout))
    scheduledGestures.value = []
  }

  // Schedule gesture beats based on text punctuation
  function scheduleGestures(videoRef: VideoActorAPI, beats: GestureType[], text: string) {
    if (!beats || beats.length === 0) return

    // Clear any existing scheduled gestures
    clearScheduledGestures()

    // Find punctuation positions in text
    const punctuationRegex = /[.,!?;:]/g
    const matches = Array.from(text.matchAll(punctuationRegex))
    
    if (matches.length === 0) {
      // No punctuation, distribute gestures evenly
      const interval = Math.max(2000, (text.length * 50) / beats.length)
      beats.forEach((gesture, index) => {
        const timeout = setTimeout(() => {
          videoRef.microGesture(gesture)
        }, interval * (index + 1))
        scheduledGestures.value.push(timeout)
      })
    } else {
      // Place gestures at punctuation marks
      const gesturesPerPunct = Math.ceil(beats.length / matches.length)
      let gestureIndex = 0
      
      matches.forEach((match, index) => {
        if (gestureIndex >= beats.length) return
        
        // Calculate timing based on position in text (rough estimation)
        const position = match.index || 0
        const timing = (position / text.length) * 5000 // Assume 5 seconds for full text
        
        const timeout = setTimeout(() => {
          if (gestureIndex < beats.length) {
            videoRef.microGesture(beats[gestureIndex])
            gestureIndex++
          }
        }, timing)
        scheduledGestures.value.push(timeout)
      })
    }
  }

  // Apply emotion packet to video actor
  async function applyPacket(videoRef: VideoActorAPI | null, packet: EmotionPacket) {
    if (!videoRef || isProcessing.value) return
    
    isProcessing.value = true
    currentPacket.value = packet

    try {
      // Set the emotion
      await videoRef.setEmotion(packet.emotion, true)
      
      // Schedule gesture beats if provided
      if (packet.beats && packet.beats.length > 0) {
        scheduleGestures(videoRef, packet.beats, packet.text)
      }
    } catch (error) {
      console.error('Failed to apply emotion packet:', error)
    } finally {
      isProcessing.value = false
    }
  }

  // Handle TTS start
  async function onTTSStart(videoRef: VideoActorAPI | null) {
    if (!videoRef || !currentPacket.value) return
    
    const intensity = currentPacket.value.intensity || 'normal'
    await videoRef.talkStart(intensity)
  }

  // Handle TTS end
  async function onTTSEnd(videoRef: VideoActorAPI | null) {
    if (!videoRef) return
    
    await videoRef.talkStop()
    clearScheduledGestures()
  }

  // Parse emotion from AI response
  function parseEmotionFromResponse(response: string): EmotionPacket | null {
    try {
      // Try to parse as JSON first
      const json = JSON.parse(response)
      if (json.text && json.emotion) {
        return {
          text: json.text,
          emotion: json.emotion as EmotionType,
          intensity: json.intensity as TalkIntensity || 'normal',
          beats: json.beats as GestureType[] || []
        }
      }
    } catch {
      // Not JSON, try to extract emotion from text
      const emotionRegex = /<\|EMOTE_(\w+)\|>/g
      const match = emotionRegex.exec(response)
      
      if (match) {
        const emotionMap: Record<string, EmotionType> = {
          'HAPPY': 'happy',
          'SAD': 'sad',
          'ANGRY': 'angry',
          'SURPRISE': 'surprised',
          'SURPRISED': 'surprised',
          'AWKWARD': 'shy',
          'SHY': 'shy',
          'NEUTRAL': 'neutral',
        }
        
        const emotion = emotionMap[match[1].toUpperCase()] || 'neutral'
        const cleanText = response.replace(emotionRegex, '').trim()
        
        return {
          text: cleanText,
          emotion: emotion,
          intensity: 'normal',
          beats: []
        }
      }
    }
    
    // Default packet if no emotion found
    return {
      text: response,
      emotion: 'neutral',
      intensity: 'normal',
      beats: []
    }
  }

  // Clean up
  function cleanup() {
    clearScheduledGestures()
    currentPacket.value = null
    isProcessing.value = false
  }

  return {
    currentPacket,
    isProcessing,
    applyPacket,
    onTTSStart,
    onTTSEnd,
    parseEmotionFromResponse,
    cleanup
  }
}

export default useExpressionDirector
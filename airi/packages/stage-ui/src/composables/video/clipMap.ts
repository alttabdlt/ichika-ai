export type EmotionType = 'neutral' | 'happy' | 'sad' | 'angry' | 'shy' | 'surprised'
export type TalkIntensity = 'soft' | 'normal' | 'excited'
export type GestureType = 'blink' | 'wink' | 'nod' | 'chuckle'

interface EmotionClips {
  in?: string
  idle: string | string[]
  out?: string
}

interface ClipMap {
  neutral: {
    idle: string
  }
  happy: EmotionClips
  sad: EmotionClips
  angry: EmotionClips
  shy: EmotionClips
  surprised: EmotionClips
  talk?: {
    soft: string
    normal: string
    excited: string
  }
  micro?: {
    blink: string
    wink: string
    nod: string
    chuckle: string
  }
}

export const clipMap: ClipMap = {
  neutral: {
    idle: 'idle/idle_neutral_loop_8s.mp4',
  },
  happy: {
    in: 'emote/happy_in.mp4',
    idle: [
      'emote/happy_idle.mp4',
      'emote/happy_idle_2.mp4',
      'emote/happy_idle_3.mp4',
    ],
    out: 'emote/happy_out.mp4',
  },
  sad: {
    in: 'emote/sad_in.mp4',
    idle: 'emote/sad_idle.mp4',
    out: 'emote/sad_out.mp4',
  },
  angry: {
    in: 'emote/angry_in.mp4',
    idle: 'emote/angry_idle.mp4',
    out: 'emote/angry_out.mp4',
  },
  shy: {
    in: 'emote/shy_in.mp4',
    idle: 'emote/shy_idle.mp4',
    out: 'emote/shy_out.mp4',
  },
  surprised: {
    in: 'emote/surprised_in.mp4',
    idle: 'emote/surprised_idle.mp4',
    out: 'emote/surprised_out.mp4',
  },
  // Talk overlays - will be WebM with alpha channel in production
  talk: {
    soft: 'overlays/talk_soft_loop_2s.webm',
    normal: 'overlays/talk_normal_loop_2s.webm',
    excited: 'overlays/talk_excited_loop_2s.webm',
  },
  // Micro gestures - will be WebM with alpha channel in production
  micro: {
    blink: 'overlays/blink_once_0p5s.webm',
    wink: 'overlays/wink_once_0p5s.webm',
    nod: 'overlays/nod_yes_0p7s.webm',
    chuckle: 'overlays/chuckle_0p8s.webm',
  },
}

// Helper function to get a random item from an array
export function getRandomItem<T>(items: T | T[]): T {
  if (Array.isArray(items)) {
    return items[Math.floor(Math.random() * items.length)]
  }
  return items
}

// Helper to get the clip path for an emotion
export function getEmotionClip(emotion: EmotionType, state: 'in' | 'idle' | 'out' = 'idle'): string {
  if (emotion === 'neutral') {
    return clipMap.neutral.idle
  }
  
  const emotionClips = clipMap[emotion]
  if (!emotionClips) {
    console.warn(`No clips found for emotion: ${emotion}`)
    return clipMap.neutral.idle
  }
  
  const clip = emotionClips[state]
  if (!clip) {
    console.warn(`No ${state} clip found for emotion: ${emotion}`)
    return clipMap.neutral.idle
  }
  
  return getRandomItem(clip)
}

// Helper to get talk overlay path
export function getTalkOverlay(intensity: TalkIntensity = 'normal'): string | undefined {
  return clipMap.talk?.[intensity]
}

// Helper to get micro gesture path
export function getMicroGesture(gesture: GestureType): string | undefined {
  return clipMap.micro?.[gesture]
}

export default clipMap
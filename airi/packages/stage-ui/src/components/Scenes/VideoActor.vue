<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { clipMap, getEmotionClip, type EmotionType, type TalkIntensity, type GestureType } from '../../composables/video/clipMap'

const props = defineProps<{
  assetsBase?: string
  paused?: boolean
}>()

const emit = defineEmits<{
  ready: []
  error: [error: Error]
}>()

// Video refs
const videoRef = ref<HTMLVideoElement>()
const nextVideoRef = ref<HTMLVideoElement>()

// State management
const currentEmotion = ref<EmotionType>('neutral')
const currentClip = ref('')
const isTalking = ref(false)
const talkIntensity = ref<TalkIntensity>('normal')
const isTransitioning = ref(false)
const isLoading = ref(true)
const needsUserInteraction = ref(false)
const preloadedVideos = new Map<string, HTMLVideoElement>()

// Auto-blink timer
let blinkInterval: NodeJS.Timeout | null = null

const assetsBasePath = computed(() => props.assetsBase || '/assets/girl/scene01')

// Preload a video
async function preloadVideo(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.src = `${assetsBasePath.value}/${src}`
    video.preload = 'auto'
    video.muted = true
    video.style.display = 'none'
    
    video.addEventListener('loadeddata', () => {
      preloadedVideos.set(src, video)
      resolve()
    }, { once: true })
    
    video.addEventListener('error', (e) => {
      console.warn(`Failed to preload video: ${src}`, e)
      resolve() // Don't reject, just continue
    }, { once: true })
    
    // Start loading
    video.load()
  })
}

// Transition to a new clip with crossfade
async function transitionToClip(clipPath: string): Promise<void> {
  if (isTransitioning.value) return
  
  const fullPath = `${assetsBasePath.value}/${clipPath}`
  
  // Skip if already playing this clip
  if (currentClip.value === fullPath) return
  
  isTransitioning.value = true
  
  try {
    if (!nextVideoRef.value) return
    
    // Load the new clip in the next video element
    nextVideoRef.value.src = fullPath
    await nextVideoRef.value.load()
    
    // Start playing with opacity 0
    nextVideoRef.value.style.opacity = '0'
    await nextVideoRef.value.play()
    
    // Wait a frame
    await new Promise(resolve => setTimeout(resolve, 50))
    
    // Crossfade
    nextVideoRef.value.style.opacity = '1'
    if (videoRef.value) {
      videoRef.value.style.opacity = '0'
    }
    
    // Wait for fade to complete
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Swap references
    if (videoRef.value) {
      videoRef.value.pause()
      const temp = videoRef.value
      videoRef.value = nextVideoRef.value
      nextVideoRef.value = temp
    }
    
    currentClip.value = fullPath
  } catch (error) {
    console.error('Failed to transition to clip:', error)
    emit('error', error as Error)
  } finally {
    isTransitioning.value = false
  }
}

// Set emotion with optional linger
async function setEmotion(emotion: EmotionType, linger = true): Promise<void> {
  // Don't change if already in this emotion
  if (currentEmotion.value === emotion && !isTransitioning.value) return
  
  currentEmotion.value = emotion
  
  if (emotion === 'neutral') {
    const neutralClip = getEmotionClip('neutral', 'idle')
    await transitionToClip(neutralClip)
  } else {
    // Check if we have the emotion clips
    const emotionClips = clipMap[emotion]
    if (emotionClips && emotionClips.in) {
      // Play transition in
      await transitionToClip(getEmotionClip(emotion, 'in'))
      
      // After transition, play idle loop if lingering
      if (linger && currentEmotion.value === emotion) {
        setTimeout(async () => {
          if (currentEmotion.value === emotion) {
            await transitionToClip(getEmotionClip(emotion, 'idle'))
          }
        }, 1000)
      }
    } else {
      // If no transition, go straight to idle
      await transitionToClip(getEmotionClip(emotion, 'idle'))
    }
  }
}

// Start talking animation
async function talkStart(intensity: TalkIntensity = 'normal'): Promise<void> {
  isTalking.value = true
  talkIntensity.value = intensity
  
  // For now, we'll just keep playing the current emotion
  // In a full implementation, we'd overlay mouth animations
}

// Stop talking animation
async function talkStop(): Promise<void> {
  isTalking.value = false
}

// Trigger micro gesture
async function microGesture(gesture: GestureType): Promise<void> {
  // Placeholder for micro gestures
  console.log('Micro gesture:', gesture)
}

// Start auto-blink
function startAutoBlink() {
  stopAutoBlink()
  
  const scheduleNextBlink = () => {
    const delay = 3000 + Math.random() * 3000 // 3-6 seconds
    blinkInterval = setTimeout(() => {
      microGesture('blink')
      scheduleNextBlink()
    }, delay)
  }
  
  scheduleNextBlink()
}

// Stop auto-blink
function stopAutoBlink() {
  if (blinkInterval) {
    clearTimeout(blinkInterval)
    blinkInterval = null
  }
}

// Start playback
async function startPlayback() {
  if (!videoRef.value) return
  
  try {
    // Wait for video to be ready
    if (videoRef.value.readyState < 2) { // HAVE_CURRENT_DATA
      await new Promise((resolve, reject) => {
        const handleCanPlay = () => {
          videoRef.value?.removeEventListener('canplay', handleCanPlay)
          videoRef.value?.removeEventListener('error', handleError)
          resolve(undefined)
        }
        const handleError = () => {
          videoRef.value?.removeEventListener('canplay', handleCanPlay)
          videoRef.value?.removeEventListener('error', handleError)
          reject(new Error('Video failed to load'))
        }
        videoRef.value?.addEventListener('canplay', handleCanPlay, { once: true })
        videoRef.value?.addEventListener('error', handleError, { once: true })
      })
    }
    
    await videoRef.value.play()
    currentClip.value = `${assetsBasePath.value}/${getEmotionClip('neutral', 'idle')}`
    isLoading.value = false
    needsUserInteraction.value = false
    emit('ready')
  } catch (error: any) {
    console.warn('Video playback issue:', error)
    // If autoplay fails due to policy, we need user interaction
    if (error.name === 'NotAllowedError') {
      needsUserInteraction.value = true
      isLoading.value = false
    } else {
      console.error('Failed to start video:', error)
      emit('error', error as Error)
      isLoading.value = false
    }
  }
}

// Handle user interaction to start playback
async function handleUserInteraction() {
  needsUserInteraction.value = false
  await startPlayback()
}

// Component lifecycle
onMounted(async () => {
  isLoading.value = true
  
  // Preload critical videos
  await Promise.all([
    preloadVideo(getEmotionClip('neutral', 'idle')),
    preloadVideo(getEmotionClip('happy', 'in')),
    preloadVideo(getEmotionClip('happy', 'idle')),
  ])
  
  // Set up initial video
  if (videoRef.value) {
    videoRef.value.src = `${assetsBasePath.value}/${getEmotionClip('neutral', 'idle')}`
    videoRef.value.loop = true
    videoRef.value.muted = true // Ensure muted for autoplay
    videoRef.value.playsInline = true // For mobile Safari
    
    // Try to play automatically
    await startPlayback()
    
    // Start auto-blink
    startAutoBlink()
  }
})

onUnmounted(() => {
  stopAutoBlink()
})

// Watch for pause state changes
watch(() => props.paused, (paused) => {
  if (!videoRef.value) return
  
  if (paused) {
    videoRef.value.pause()
    stopAutoBlink()
  } else {
    videoRef.value.play().catch(console.error)
    startAutoBlink()
  }
})

// Expose public methods
defineExpose({
  setEmotion,
  talkStart,
  talkStop,
  microGesture,
  currentEmotion,
  isTalking,
  isLoading,
  needsUserInteraction,
  startPlayback
})
</script>

<template>
  <div class="video-actor-container">
    <!-- Main video layer -->
    <video 
      ref="videoRef"
      class="video-layer"
      :muted="true"
      :autoplay="false"
      playsinline
      webkit-playsinline
      loop
      preload="auto"
    />
    
    <!-- Transition video layer -->
    <video 
      ref="nextVideoRef"
      class="video-layer"
      :muted="true"
      :autoplay="false"
      playsinline
      webkit-playsinline
      loop
      preload="none"
    />
    
    <!-- Loading indicator -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">Loading...</div>
    </div>
    
    <!-- User interaction prompt -->
    <div v-if="needsUserInteraction && !isLoading" class="interaction-overlay" @click="handleUserInteraction">
      <button class="play-button">
        <span>▶ Click to Start</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.video-actor-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: transparent;
}

.video-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: opacity 200ms ease-in-out;
}

.loading-overlay,
.interaction-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  z-index: 10;
}

.loading-spinner {
  color: white;
  font-size: 1.2rem;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.play-button {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.play-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.play-button span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
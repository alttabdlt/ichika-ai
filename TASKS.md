# Ichika AI Implementation Tasks

## Progress Overview
- [ ] Phase 1: Setup & Bootstrap (Tasks 1-3)
- [ ] Phase 2: Core Implementation (Tasks 4-8)
- [ ] Phase 3: Integration (Tasks 9-11)
- [ ] Phase 4: Testing & Polish (Tasks 12-16)
- [ ] Phase 5: Deployment (Tasks 17-19)

---

## 1) Fork & Bootstrap AIRI

- [ ] 1.1 Fork `github.com/moeru-ai/airi` to your GitHub
- [ ] 1.2 Clone repository: `git clone <your-fork>`
- [ ] 1.3 Install dependencies: `cd airi && corepack enable && pnpm i`
- [ ] 1.4 Run web stage: `pnpm --filter @proj-airi/stage-web dev` (keep terminal open)
- [ ] 1.5 (Optional) Run desktop: `pnpm --filter @proj-airi/stage-tamagotchi dev`

## 2) Create Asset Tree

- [ ] 2.1 Create directory: `apps/stage-web/public/assets/girl/scene01/`
- [ ] 2.2 Create subdirectories:
  - [ ] `idle/` - Idle loop animations
  - [ ] `emote/` - Emotion states and transitions
  - [ ] `overlays/` - Alpha channel overlays
- [ ] 2.3 Place video files with exact naming:
  - [ ] `idle/idle_neutral_loop_8s.mp4`
  - [ ] `emote/happy_in.mp4`, `emote/happy_idle.mp4`, `emote/happy_out.mp4`
  - [ ] `emote/sad_in.mp4`, `emote/sad_idle.mp4`, `emote/sad_out.mp4`
  - [ ] `emote/angry_in.mp4`, `emote/angry_idle.mp4`, `emote/angry_out.mp4`
  - [ ] `emote/shy_in.mp4`, `emote/shy_idle.mp4`, `emote/shy_out.mp4`
  - [ ] `emote/surprised_in.mp4`, `emote/surprised_idle.mp4`, `emote/surprised_out.mp4`
  - [ ] `overlays/talk_soft_loop_2s.webm`
  - [ ] `overlays/talk_normal_loop_2s.webm`
  - [ ] `overlays/talk_excited_loop_2s.webm`
  - [ ] `overlays/blink_once_0p5s.webm`
  - [ ] `overlays/wink_once_0p5s.webm`
  - [ ] `overlays/nod_yes_0p7s.webm`
  - [ ] `overlays/chuckle_0p8s.webm`

## 3) Encode Videos Correctly

- [ ] 3.1 Encode H.264 MP4 (body/pose animations):
```bash
ffmpeg -i IN.mp4 -vf "scale=1920:-2,fps=30" -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -movflags +faststart OUT.mp4
```

- [ ] 3.2 Encode VP9 WebM with alpha (face overlays from PNG sequence):
```bash
ffmpeg -framerate 30 -i frame_%04d.png -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 28 OUT.webm
```

- [ ] 3.3 Verify seamless loops:
  - [ ] Test each loop video for smooth transitions
  - [ ] Check frame alignment at loop points
  - [ ] Fix any visible pops or jumps

## 4) Add VideoActor Component

- [ ] 4.1 Create file: `packages/stage-ui/src/components/Scenes/VideoActor.vue`
- [ ] 4.2 Implement 4 video layers:
  - [ ] `base` layer - idle animations
  - [ ] `action` layer - emotion transitions
  - [ ] `mouth` layer - talk overlay with alpha
  - [ ] `blink` layer - micro-gestures with alpha
- [ ] 4.3 Add public methods:
  - [ ] `setEmotion(emotion: EmotionType, linger?: boolean)`
  - [ ] `talkStart(intensity: TalkIntensity)`
  - [ ] `talkStop()`
  - [ ] `microGesture(gesture: GestureType)`
- [ ] 4.4 Implement crossfade helper (150-300ms opacity tween)
- [ ] 4.5 Add auto-blink timer (random 3-6 seconds)
- [ ] 4.6 Preload on mount: idle + common emotions + talk_normal

## 5) Create Clip Map

- [ ] 5.1 Create file: `packages/stage-ui/src/composables/video/clipMap.ts`
- [ ] 5.2 Define clip mappings:
```typescript
export const clipMap = {
  neutral: {
    idle: 'idle/idle_neutral_loop_8s.mp4'
  },
  happy: {
    in: 'emote/happy_in.mp4',
    idle: 'emote/happy_idle.mp4',
    out: 'emote/happy_out.mp4'
  },
  // ... other emotions
  talk: {
    soft: 'overlays/talk_soft_loop_2s.webm',
    normal: 'overlays/talk_normal_loop_2s.webm',
    excited: 'overlays/talk_excited_loop_2s.webm'
  },
  micro: {
    blink: 'overlays/blink_once_0p5s.webm',
    wink: 'overlays/wink_once_0p5s.webm',
    nod: 'overlays/nod_yes_0p7s.webm',
    chuckle: 'overlays/chuckle_0p8s.webm'
  }
} as const
```

## 6) Configure Character Mode

- [ ] 6.1 Update `packages/stage-ui/src/stores/settings.ts`:
  - [ ] Add 'video' to model renderer types
  - [ ] Add video-specific configuration options
- [ ] 6.2 Add configuration:
```typescript
export interface CharacterConfig {
  mode: 'video' | 'vrm' | 'live2d'
  assetsBase: string // '/assets/girl/scene01'
}
```

## 7) Wire Stage Component

- [ ] 7.1 Edit `packages/stage-ui/src/components/Scenes/Stage.vue`:
  - [ ] Import VideoActor component
  - [ ] Add conditional rendering for video mode
  - [ ] Keep existing VRM/Live2D branches intact
- [ ] 7.2 Pass props to VideoActor:
  - [ ] `assetsBase` prop
  - [ ] `paused` prop
  - [ ] Event handlers

## 8) Create Expression Director

- [ ] 8.1 Create file: `packages/stage-ui/src/composables/video/expressionDirector.ts`
- [ ] 8.2 Implement `applyPacket(videoRef, packet)`:
```typescript
interface Packet {
  text: string
  emotion: EmotionType
  intensity?: TalkIntensity
  beats?: GestureType[]
}
```
- [ ] 8.3 Add logic:
  - [ ] Set emotion on packet receive
  - [ ] Start talk on TTS begin
  - [ ] Stop talk on TTS end
  - [ ] Schedule gesture beats at punctuation

## 9) LLM Output Contract

- [ ] 9.1 Locate AI response generation code
- [ ] 9.2 Add system prompt rule:
```
Respond ONLY with minified JSON:
{"text":"...","emotion":"neutral|happy|sad|angry|shy|surprised","intensity":"soft|normal|excited","beats":["blink"|"wink"|"nod"|"chuckle"]}
```
- [ ] 9.3 Add schema validation with fallback:
```typescript
const defaultPacket = {
  emotion: 'neutral',
  intensity: 'normal',
  beats: []
}
```

## 10) Connect Server Events

- [ ] 10.1 Find Stage Web's AI message handler
- [ ] 10.2 On new AI message:
  - [ ] Parse JSON response
  - [ ] Extract emotion packet
  - [ ] Call `ExpressionDirector.applyPacket()`
- [ ] 10.3 Connect TTS events:
  - [ ] On TTS start → `videoRef.talkStart(intensity)`
  - [ ] On TTS end → `videoRef.talkStop()`

## 11) Implement Preloader

- [ ] 11.1 Create preload utility:
```typescript
function preloadVideo(url: string) {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'video'
  link.href = url
  document.head.appendChild(link)
}
```
- [ ] 11.2 Preload priority assets on mount
- [ ] 11.3 Background load remaining assets
- [ ] 11.4 Cache video element references

## 12) Add Guards & Fallbacks

- [ ] 12.1 Handle 404 errors:
  - [ ] Log warning to console
  - [ ] Fall back to neutral idle
  - [ ] Notify user of missing asset
- [ ] 12.2 Handle decode failures:
  - [ ] Skip broken overlay
  - [ ] Continue base playback
  - [ ] Log error details
- [ ] 12.3 Debounce emotion changes (200ms minimum)

## 13) Manual QA Testing

- [ ] 13.1 Test emotion sequences:
  - [ ] neutral → happy → neutral
  - [ ] neutral → sad → neutral
  - [ ] neutral → angry → neutral
  - [ ] neutral → shy → neutral
  - [ ] neutral → surprised → neutral
- [ ] 13.2 Test talk sync:
  - [ ] Verify ≤300ms start delay
  - [ ] Verify ≤150ms stop delay
  - [ ] Test all intensity levels
- [ ] 13.3 Test overlay alignment:
  - [ ] 100% browser zoom
  - [ ] 125% browser zoom
  - [ ] Mobile viewport
- [ ] 13.4 Stress test:
  - [ ] Send 3 rapid messages
  - [ ] Verify no stuck states
  - [ ] Check memory usage

## 14) Add Automated Tests

- [ ] 14.1 Create test directory: `packages/stage-ui/src/components/Scenes/__tests__/`
- [ ] 14.2 Write test suites:
  - [ ] State transition tests
  - [ ] Packet validation tests
  - [ ] Timing accuracy tests
- [ ] 14.3 Add to CI pipeline:
```bash
pnpm -w test
```

## 15) Performance Optimization

- [ ] 15.1 Resolution management:
  - [ ] Cap at 1080p maximum
  - [ ] Add 720p variant for low-end
  - [ ] Auto-select via `matchMedia()`
- [ ] 15.2 Decoder management:
  - [ ] Limit to 2 active decoders
  - [ ] Pause off-screen layers
  - [ ] Monitor decoder queue
- [ ] 15.3 Preload optimization:
  - [ ] Use `preload='metadata'` for cold assets
  - [ ] Upgrade to `preload='auto'` just-in-time
  - [ ] Implement predictive loading

## 16) Content Polish

- [ ] 16.1 Tune crossfade timing:
  - [ ] Start at 200ms
  - [ ] Test 250ms if cuts visible
  - [ ] Document optimal value
- [ ] 16.2 Randomize micro-animations:
  - [ ] Blink interval ±1.5s variation
  - [ ] 30-60ms offset for natural movement
  - [ ] Weight distribution for gesture types
- [ ] 16.3 Add reaction stingers:
  - [ ] 30% chance of post-TTS gesture
  - [ ] Context-aware reactions
  - [ ] Emotion-appropriate responses

## 17) Build & Deploy

- [ ] 17.1 Web build:
```bash
pnpm --filter @proj-airi/stage-web build
# Deploy dist/ to hosting
```
- [ ] 17.2 Desktop build (optional):
```bash
pnpm --filter @proj-airi/stage-tamagotchi build
```
- [ ] 17.3 Configure CDN:
  - [ ] Set cache headers for assets
  - [ ] Enable gzip compression
  - [ ] Configure CORS if needed

## 18) Operations & Monitoring

- [ ] 18.1 Add debug mode:
```javascript
if (localStorage.DEBUG_VIDEO_ACTOR) {
  console.log('emotion:', emotion)
  console.log('talkStart/Stop:', state)
  console.log('microGesture:', gesture)
  console.log('asset miss:', url)
}
```
- [ ] 18.2 Performance tracking:
  - [ ] Count dropped frames
  - [ ] Measure time-to-motion
  - [ ] Track asset load times
  - [ ] Store in localStorage

## 19) Future Expansion Hooks

- [ ] 19.1 Gaze system:
  - [ ] Add gaze_left/right overlays
  - [ ] Trigger on pronouns ("you", "that")
  - [ ] Smooth transition curves
- [ ] 19.2 Manifest-driven loading:
  - [ ] Create `preloadManifest.json`
  - [ ] Define load priority order
  - [ ] Support versioning
- [ ] 19.3 Multiple costumes:
  - [ ] Swap `assetsBase` path
  - [ ] Preload costume thumbnails
  - [ ] Implement smooth transitions

---

## Quick Commands Reference

### Development
```bash
# Start dev server
pnpm --filter @proj-airi/stage-web dev

# Run tests
pnpm -w test

# Build for production
pnpm --filter @proj-airi/stage-web build
```

### Video Encoding
```bash
# Standard video (H.264)
ffmpeg -i input.mp4 -vf "scale=1920:-2,fps=30" -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -movflags +faststart output.mp4

# Alpha overlay (VP9)
ffmpeg -framerate 30 -i frame_%04d.png -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 28 output.webm

# Check video properties
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,duration -of json video.mp4
```

### Git Workflow
```bash
# Feature branch
git checkout -b feature/video-avatar
git add .
git commit -m "feat: Add video avatar support"
git push origin feature/video-avatar

# Merge to main
git checkout main
git merge feature/video-avatar
git push origin main
```

---

## Notes & Reminders

- Always test on actual devices, not just browser DevTools
- Keep video files under 5MB for optimal loading
- Ensure all loops are frame-perfect to avoid jumps
- Test with slow network throttling
- Document any deviations from this plan

---

*Last Updated: August 2024*
*Track progress by checking completed items*
*Update this document as implementation proceeds*
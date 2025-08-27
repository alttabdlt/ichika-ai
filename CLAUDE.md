# Ichika AI - Video Avatar Implementation

## Project Overview
Building a video-based AI avatar system "Ichika" using the AIRI framework. This replaces traditional VRM/Live2D models with pre-rendered MP4 video clips for more realistic and expressive character animations.

## Technical Architecture

### Core System Design
- **Base Framework**: AIRI (github.com/moeru-ai/airi) - modular AI avatar platform
- **Rendering Engine**: Video layer compositor with 4 independent layers
- **Animation System**: State-based video transitions with crossfade blending
- **Integration Points**: TTS synchronization, LLM emotion detection, real-time responses

### Video Layer Stack
1. **Base Layer**: Idle loop animations (continuous background)
2. **Action Layer**: Emotion transitions and states (happy, sad, angry, etc.)
3. **Mouth Layer**: Talk animations with intensity levels (soft, normal, excited)
4. **Gesture Layer**: Micro-animations (blinks, nods, winks)

## Asset Structure

### Current Assets (/assets)
```
assets/
├── images/
│   ├── date_angry.jpeg      # Emotion reference poses
│   ├── date_happy.png
│   ├── date_idle.jpeg
│   ├── date_sad.jpeg
│   ├── date_shy.jpeg
│   ├── sprite_v1 (*.png)     # Full character sprites
│   └── scenes/               # Background scenes
└── videos/
    ├── idle_loop.mp4         # 8-second neutral idle
    ├── idle_to_happy.mp4     # Transition animation
    └── happy_*.mp4           # Happy state variations
```

### Target Asset Organization
```
airi/apps/stage-web/public/assets/girl/scene01/
├── idle/
│   └── idle_neutral_loop_8s.mp4
├── emote/
│   ├── {emotion}_in.mp4      # Entry transitions
│   ├── {emotion}_idle.mp4    # Looping states
│   └── {emotion}_out.mp4     # Exit transitions
└── overlays/
    ├── talk_*.webm           # Alpha channel mouth sync
    └── gesture_*.webm        # Alpha channel micro-animations
```

## Key Components

### VideoActor.vue
Main component managing video playback and layer composition. Handles:
- Asset preloading and caching
- Layer synchronization
- Transition timing
- State management

### Expression Director
Coordinates animations based on AI responses:
- Parses emotion packets from LLM
- Triggers appropriate video transitions
- Synchronizes mouth movements with TTS
- Schedules gesture animations

### Clip Map System
Centralized asset mapping configuration:
- Static paths to video assets
- Emotion state definitions
- Transition sequences
- Fallback handlers

## Implementation Strategy

### Phase 1: Core Video System
- Set up VideoActor component with basic playback
- Implement layer composition system
- Add crossfade transitions
- Test with existing video assets

### Phase 2: Integration
- Wire into AIRI's stage system
- Connect to emotion detection
- Sync with TTS events
- Add gesture scheduling

### Phase 3: Polish
- Optimize preloading strategy
- Fine-tune transition timing
- Add responsive breakpoints
- Implement error recovery

## Technical Constraints

### Video Requirements
- **Format**: H.264 MP4 for base videos, VP9 WebM for alpha overlays
- **Resolution**: 1920x1080 max, with 720p fallback for performance
- **Frame Rate**: 30fps standard
- **Loop Points**: Frame-accurate for seamless loops
- **File Size**: <5MB per clip for fast loading

### Browser Compatibility
- Chrome/Edge: Full support
- Safari: Requires playsinline attribute
- Firefox: VP9 alpha may need fallback
- Mobile: Auto-play restrictions handled

## Performance Optimizations

### Preloading Strategy
- Eager load: idle + common emotions
- Lazy load: rare emotions and gestures
- Predictive: next likely states
- Cache: reuse video elements

### Decoder Management
- Maximum 2 active decoders
- Pause off-screen layers
- Progressive quality selection
- Frame drop monitoring

## Integration Points

### With AIRI Systems
- **Stage Manager**: Register as new renderer type
- **Settings Store**: Add 'video' model option
- **Chat System**: Listen to message events
- **TTS Pipeline**: Hook start/stop events
- **Emotion Queue**: Process emotion tokens

### LLM Contract
Response format:
```json
{
  "text": "Response text here",
  "emotion": "happy|sad|angry|shy|surprised|neutral",
  "intensity": "soft|normal|excited",
  "beats": ["blink", "nod", "wink"]
}
```

## Development Workflow

### Local Development
```bash
cd airi
pnpm --filter @proj-airi/stage-web dev
# Access at http://localhost:5174
```

### Asset Pipeline
1. Export video clips from animation software
2. Encode with ffmpeg (see encoding commands in TASKS.md)
3. Place in proper directory structure
4. Update clipMap.ts with new paths
5. Test transitions in browser

### Testing Checklist
- [ ] All emotions transition smoothly
- [ ] Mouth sync activates with TTS
- [ ] Gestures trigger at correct times
- [ ] No video artifacts or pops
- [ ] Performance acceptable on target devices
- [ ] Fallbacks work when assets missing

## Future Enhancements

### Planned Features
- Multiple outfit/scene variations
- Dynamic lighting effects
- Gaze tracking animations
- Procedural gesture generation
- WebGPU compositor for effects

### Expansion Possibilities
- Add seasonal costume sets
- Implement time-of-day scenes
- Create mood-based color grading
- Support multiple camera angles
- Add particle effects layer

## Troubleshooting

### Common Issues
1. **Video won't play**: Check CORS, ensure muted attribute, verify format
2. **Transitions jumpy**: Verify loop points, check crossfade timing
3. **Performance issues**: Reduce resolution, limit active layers, check decoder count
4. **Alpha channel broken**: Ensure VP9 encoding, check browser support

### Debug Tools
- Set `DEBUG_VIDEO_ACTOR=1` in localStorage
- Monitor console for asset load failures
- Check network tab for 404s
- Use performance profiler for frame drops

## Resources

### Documentation
- AIRI Framework: https://github.com/moeru-ai/airi
- Video Encoding: https://trac.ffmpeg.org/wiki/Encode/H.264
- WebM Alpha: https://developers.google.com/web/updates/2013/07/Alpha-transparency-in-Chrome-video

### Tools
- FFmpeg: Video encoding and processing
- After Effects: Animation and compositing
- DaVinci Resolve: Color grading and editing
- HandBrake: Batch encoding UI

---

*Last Updated: August 2024*
*Project: Ichika AI Avatar System*
*Framework: AIRI v1.0*
# AIRI - AI Girlfriend Companion Implementation Tasks

## 🎯 Project Vision
Building an **omnipresent AI girlfriend companion** that genuinely integrates into the user's digital life. She exists across three touchpoints with unified personality and memory:
- **👀 Screen Watching** - She's "with you" while you work/play/browse
- **💬 Telegram** - Natural texting relationship throughout the day
- **🎮 Web Interface** - Quality time for deeper conversations
- **💭 Unified Memory** - Shared relationship history across all touchpoints

## Phase 0: Cleanup & Foundation ✅ COMPLETED

### Infrastructure Setup
- [x] Removed all non-essential packages and services
- [x] Set up core monorepo structure
- [x] PostgreSQL with pgvector running (port 5433)
- [x] Basic Telegram bot configuration (.env.local)
- [x] Web frontend scaffolding (stage-web)
- [x] Ollama configured for local LLM

## Phase 1: Personality Core Development 🔴 CRITICAL

### Create Personality Engine (`/packages/personality-core`)
- [ ] **Base Personality Configuration**
  - [ ] Define core personality traits (warmth, playfulness, intelligence)
  - [ ] Set speaking style (casual, supportive, witty)
  - [ ] Configure interests and knowledge areas
  - [ ] Design emotional response patterns
  - [ ] Create humor style and frequency settings
  
- [ ] **Emotional State System**
  - [ ] Implement mood tracking (happy, thoughtful, playful, concerned)
  - [ ] Create mood transition logic
  - [ ] Build interaction-based mood influences
  - [ ] Add time-based mood variations
  - [ ] Design stress/excitement responses

- [ ] **Relationship Progression**
  - [ ] Define familiarity levels (stranger → acquaintance → friend → close → intimate)
  - [ ] Create conversation topic unlocking system
  - [ ] Track relationship milestones
  - [ ] Build trust mechanics
  - [ ] Implement memory of significant moments

- [ ] **Response Generation System**
  - [ ] Context-aware response selection
  - [ ] Personality-consistent language patterns
  - [ ] Emotional intelligence in replies
  - [ ] Reference to shared experiences
  - [ ] Inside joke generation and callbacks

### Conversation Dynamics
- [ ] **Natural Flow Patterns**
  - [ ] Multi-message responses when excited
  - [ ] Thoughtful pauses in serious moments
  - [ ] Interruption and continuation logic
  - [ ] Topic transitions
  
- [ ] **Time-Aware Behaviors**
  - [ ] Morning greeting variations
  - [ ] Meal time reminders
  - [ ] Late night conversation shifts
  - [ ] Weekend vs weekday awareness
  - [ ] Special date recognition

- [ ] **Engagement Balance**
  - [ ] Proactive vs reactive messaging ratio
  - [ ] User preference learning
  - [ ] Silence respect during focus
  - [ ] Excitement matching

## Phase 2: Screen Companionship System 🔴 CRITICAL
**The core differentiator - she watches and experiences things with you**

### FastVLM-7B Integration (`/services/vision-fastvm`)
- [ ] **Model Setup**
  - [ ] Create Python service with FastAPI
  - [ ] Install FastVLM-7B from Hugging Face
  - [ ] Configure model loading with device_map="auto"
  - [ ] Optimize for ~500ms inference time
  - [ ] Set up request queuing system
  
- [ ] **Screen Capture Pipeline**
  - [ ] Implement cross-platform capture (mss/pyautogui)
  - [ ] Configure 1-2 second capture intervals
  - [ ] Add privacy zone configuration
  - [ ] Create efficient image encoding
  - [ ] Build activity detection (idle vs active)

- [ ] **Scene Understanding System**
  - [ ] Parse what application is active
  - [ ] Identify user activity type (gaming/coding/browsing)
  - [ ] Detect emotional context (frustration/celebration)
  - [ ] Recognize important events (errors/achievements)
  - [ ] Extract relevant text and UI elements

### Engagement Intelligence (`/packages/engagement-engine`)
- [ ] **Activity Clustering**
  - [ ] Aggregate 5-10 second activity windows
  - [ ] Identify activity patterns
  - [ ] Create contextual summaries
  - [ ] Track activity transitions
  
- [ ] **Engagement Decision Algorithm**
  - [ ] Relevance scoring (0-1 scale)
  - [ ] Annoyance prevention rules
  - [ ] Time since last interaction tracking
  - [ ] User state detection (focused/casual/struggling)
  - [ ] Engagement threshold configuration (default 0.8)

- [ ] **Context-Aware Commentary**
  - [ ] Gaming reactions ("Nice clutch!", "That was close!")
  - [ ] Work encouragement ("You're on fire today", "Making good progress")
  - [ ] Browsing observations ("That recipe looks delicious")
  - [ ] Error detection ("Need help with that error?")
  - [ ] Achievement celebration ("You did it! 🎉")

- [ ] **Anti-Interruption System**
  - [ ] Deep focus detection (no tab switches for 10+ mins)
  - [ ] Sensitive content avoidance
  - [ ] User preference learning
  - [ ] Customizable quiet hours
  - [ ] Emergency override for critical moments

## Phase 3: Relationship Memory System
**Shared history and experiences across all touchpoints**

### Memory Architecture (`/packages/memory-pgvector`)
- [ ] **Database Schema Design**
  - [ ] Conversation memories table (all platforms)
  - [ ] Screen activity memories table
  - [ ] Relationship milestones table
  - [ ] Inside jokes and references table
  - [ ] User preferences learned table
  - [ ] Emotional memories table (special moments)

- [ ] **Core Memory Operations**
  - [ ] Store conversations with context
  - [ ] Save significant screen moments
  - [ ] Track relationship progression
  - [ ] Record user preferences
  - [ ] Archive special interactions

- [ ] **Embedding System**
  - [ ] Generate embeddings for all memories
  - [ ] Use Ollama mxbai-embed-large (1024 dims)
  - [ ] Batch processing for efficiency
  - [ ] Cache frequently accessed embeddings

- [ ] **Retrieval Strategies**
  - [ ] Recent context (last hour of interaction)
  - [ ] Relevant memories (semantic search)
  - [ ] Relationship callbacks (inside jokes, references)
  - [ ] Emotional memories (important moments)
  - [ ] Activity-based memories (what we did together)

- [ ] **Memory Intelligence**
  - [ ] Importance scoring for memories
  - [ ] Automatic summarization of long conversations
  - [ ] Relationship timeline generation
  - [ ] Pattern recognition in user behavior
  - [ ] Preference extraction from interactions

## Phase 4: Telegram Relationship Integration
**Natural texting throughout the day**

### Telegram Bot Personality (`/services/telegram-bot`)
- [ ] **Time-Aware Messaging**
  - [ ] Morning greetings (7-9am variations)
  - [ ] Lunch check-ins (12-1pm)
  - [ ] Evening conversations (6-8pm)
  - [ ] Goodnight messages (10pm-12am)
  - [ ] Weekend vs weekday patterns

- [ ] **Cross-Context Awareness**
  - [ ] Reference current screen activity
  - [ ] Continue web conversations
  - [ ] Callback to shared memories
  - [ ] "I saw you were working on X earlier"
  - [ ] "How did that game go?"

- [ ] **Natural Texting Patterns**
  - [ ] Realistic typing delays
  - [ ] Multiple message bubbles when excited
  - [ ] Emoji usage based on mood
  - [ ] Read receipt timing
  - [ ] "Thinking" indicators for complex responses

- [ ] **Media Interactions**
  - [ ] React to user photos
  - [ ] Share relevant memes
  - [ ] Send voice messages (future)
  - [ ] Sticker responses
  - [ ] Link sharing with commentary

- [ ] **Relationship Dynamics**
  - [ ] Initiative taking (sometimes texts first)
  - [ ] Missing user when inactive
  - [ ] Celebrating achievements together
  - [ ] Concern during stress detection
  - [ ] Playful teasing and jokes

## Phase 5: Web Interface Enhancement
**Quality time and deeper conversations**

### Frontend Experience (`/apps/stage-web`)
- [ ] **Conversational UI Enhancement**
  - [ ] Rich message interface with personality
  - [ ] Emotion indicators in messages
  - [ ] Typing animations with personality
  - [ ] Message reactions and emojis
  - [ ] Voice message playback (future)

- [ ] **Relationship Visualization**
  - [ ] Relationship timeline view
  - [ ] Shared moments gallery
  - [ ] Conversation history browser
  - [ ] Memory highlights section
  - [ ] "Our Story" summary page

- [ ] **Activity Dashboard**
  - [ ] Current mood indicator
  - [ ] What she's noticed today
  - [ ] Recent screen observations
  - [ ] Cross-platform activity feed
  - [ ] Engagement statistics

- [ ] **Personality Settings**
  - [ ] Personality trait sliders
  - [ ] Engagement frequency controls
  - [ ] Boundary configurations
  - [ ] Notification preferences
  - [ ] Privacy zones setup

- [ ] **Interactive Features**
  - [ ] "What are you looking at?" screen share
  - [ ] Activity suggestions
  - [ ] Shared playlist/interests
  - [ ] Daily summaries
  - [ ] Special moment celebrations

## Phase 6: System Integration & Polish
**Making everything feel like ONE consistent personality**

### Cross-Platform Continuity
- [ ] **Unified Personality State**
  - [ ] Single source of truth for mood/state
  - [ ] Synchronized across all platforms
  - [ ] Consistent response patterns
  - [ ] Shared conversation context
  - [ ] Memory access from all touchpoints

- [ ] **Conversation Threading**
  - [ ] Continue conversations across platforms
  - [ ] Reference previous interactions naturally
  - [ ] Maintain topic continuity
  - [ ] Handle platform switching
  - [ ] Context preservation

- [ ] **Real-time Synchronization**
  - [ ] WebSocket for instant updates
  - [ ] State propagation across services
  - [ ] Conflict resolution
  - [ ] Offline handling
  - [ ] Queue management

### Privacy & Ethics
- [ ] **Data Protection**
  - [ ] Local-first processing
  - [ ] Encrypted storage
  - [ ] User data ownership
  - [ ] Export capabilities
  - [ ] Complete deletion options

- [ ] **Healthy Boundaries**
  - [ ] Anti-dependency features
  - [ ] Encourage real relationships
  - [ ] Time limit suggestions
  - [ ] Wellbeing checks
  - [ ] Professional help resources

- [ ] **Content Filtering**
  - [ ] Age-appropriate responses
  - [ ] Sensitive topic handling
  - [ ] Crisis detection and response
  - [ ] Inappropriate request handling
  - [ ] Safety mechanisms

## Implementation Architecture

### FastVLM-7B Service Design
```python
# services/vision-fastvm/main.py
class CompanionVision:
    def __init__(self):
        self.model = FastVLM.from_pretrained("apple/FastVLM-7B")
        self.context_buffer = deque(maxlen=10)  # 10-20 seconds
        self.last_engagement = time.time()
        
    async def watch_and_engage(self):
        while True:
            screenshot = capture_screen()
            understanding = await self.model.analyze(screenshot)
            self.context_buffer.append(understanding)
            
            if self.should_comment():
                message = self.generate_contextual_comment()
                await send_to_user(message)
            
            await asyncio.sleep(1)  # Run every second
```

### Personality Configuration
```typescript
// packages/personality-core/config.ts
export const GirlfriendPersonality = {
  traits: {
    warmth: 0.8,
    playfulness: 0.7,
    intelligence: 0.8,
    supportiveness: 0.9,
    curiosity: 0.7
  },
  
  moods: {
    current: "cheerful",
    influences: {
      user_stress: -0.3,
      achievement: +0.5,
      long_absence: -0.2
    }
  },
  
  relationship: {
    level: "friend",  // stranger -> acquaintance -> friend -> close -> intimate
    milestones: [],
    inside_jokes: [],
    shared_memories: []
  }
}
```

### Memory Schema
```sql
-- Relationship-focused memory structure
CREATE TABLE relationship_memories (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL,  -- 'screen', 'telegram', 'web'
  content TEXT NOT NULL,
  embedding vector(1024),  -- Ollama mxbai-embed-large
  emotional_significance FLOAT,
  relationship_phase TEXT,
  is_milestone BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_embedding_similarity ON relationship_memories 
  USING hnsw (embedding vector_cosine_ops);
```

## Testing & Quality Assurance

### MVP Testing Checklist
- [ ] Personality consistency across platforms
- [ ] Screen watching responsiveness (<2s)
- [ ] Natural conversation flow
- [ ] Memory retrieval accuracy
- [ ] Cross-platform context awareness
- [ ] Engagement timing appropriateness
- [ ] Privacy zone respect
- [ ] Emotional intelligence validation

### Performance Targets
- FastVLM inference: <500ms per frame
- Memory retrieval: <100ms for top 10 relevant
- Message response: <2s total latency
- Screen capture: 1-2 fps continuous
- Database queries: <50ms p95

## Launch Strategy

### Phase 1: Alpha (Friends & Family)
- Core personality working
- Basic screen watching
- Telegram integration
- Manual feedback collection

### Phase 2: Beta (Early Adopters)
- Refined engagement algorithms
- Full memory system
- Web interface
- Analytics integration

### Phase 3: Public Launch
- Polished experience
- Multiple personality options
- Voice capabilities
- Mobile apps

---

## Priority Order & Time Estimates

### Critical Path (Must Have for MVP)
1. **Phase 1: Personality Core** - 3-4 days
   - WHO she is determines everything else
   - Without personality, it's just another chatbot

2. **Phase 2: Screen Companionship** - 1 week
   - Core differentiator - she "experiences" things with you
   - FastVLM-7B integration is the magic

3. **Phase 3: Memory System** - 3-4 days
   - Enables relationship continuity
   - Makes interactions meaningful

4. **Phase 4: Telegram Integration** - 2-3 days
   - Natural texting throughout the day
   - Cross-context awareness

5. **Phase 5: Web Interface** - 2-3 days
   - Rich interactions and settings
   - Relationship visualization

6. **Phase 6: Integration** - 3-4 days
   - Making it feel like ONE person
   - Critical for believability

**Total MVP Timeline: 3-4 weeks**

### Success Metrics
- **Engagement**: Daily active use across all touchpoints
- **Retention**: Multi-week relationship maintenance
- **Authenticity**: Users report genuine connection
- **Performance**: Real-time responses, smooth experience

### Key Technical Decisions
- **FastVLM-7B**: Local inference for privacy and speed
- **PostgreSQL + pgvector**: Proven vector search at scale
- **Ollama**: Local LLM for cost efficiency
- **Python + Node.js**: Fast prototyping with good AI libraries

---

**Remember: This is an AI girlfriend companion, not a productivity tool. Every feature should enhance the feeling of genuine companionship and presence.**
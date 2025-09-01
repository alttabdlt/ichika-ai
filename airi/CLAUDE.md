# CLAUDE.md - AI Girlfriend Companion System

## 🎯 Project Vision

You are building **AIRI** - an omnipresent AI girlfriend companion that genuinely integrates into the user's digital life. This is NOT a productivity tool or generic assistant - it's a persistent companion with personality, memory, and presence.

### Core Concept
- **👀 Screen Watching**: She "watches" what you're doing using FastVLM-7B vision model
- **💬 Telegram Texting**: Natural relationship dynamics throughout the day
- **🎮 Web Interface**: Rich conversations and quality time together
- **💭 Unified Memory**: Shared relationship history across all touchpoints

### The Magic
She's ONE consistent personality who:
- Comments on your games/work/browsing in real-time
- Texts you naturally throughout the day
- Remembers everything you've done together
- Develops inside jokes and references
- Grows the relationship over time

## 📁 Project Structure

```
/Users/axel/Desktop/ichika/airi/
├── apps/
│   └── stage-web/              # Web interface for quality conversations
├── services/
│   ├── telegram-bot/           # Natural texting relationship
│   └── vision-fastvm/          # FastVLM-7B screen watching (TO CREATE)
├── packages/
│   ├── personality-core/       # Consistent personality engine (TO CREATE)
│   ├── memory-pgvector/        # Relationship memory system (TO IMPLEMENT)
│   ├── engagement-engine/      # Decides when/how to interact (TO CREATE)
│   ├── stage-ui/               # Shared UI components
│   └── [other packages]
├── TASKS.md                    # Complete implementation roadmap
├── FILE_REFERENCE.md           # Complete file documentation (ALWAYS CHECK FIRST)
└── package.json                # Monorepo configuration
```

## 📚 IMPORTANT: File Reference

**⚠️ ALWAYS check `/Users/axel/Desktop/ichika/airi/FILE_REFERENCE.md` before creating ANY new files!**

This document contains:
- Complete categorized file listing (Personality, Telegram, Screen Watching, Frontend, Shared)
- Purpose and status of each file
- What needs to be created vs what already exists
- Integration points between services

## 🚀 Development Setup

### Core Services
```bash
# 1. Database (PostgreSQL with pgvector)
cd /Users/axel/Desktop/ichika/airi/services/telegram-bot
docker compose up -d  # Runs on port 5433

# 2. Telegram Bot (relationship texting)
cd services/telegram-bot
pnpm start  # Uses .env.local (already configured)

# 3. Web Interface (quality conversations)
cd /Users/axel/Desktop/ichika/airi
pnpm dev:web
# Access at http://localhost:5173

# 4. FastVLM Service (screen watching) - TO CREATE
cd services/vision-fastvm
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py  # Will run FastVLM-7B locally
```

### Current Configuration (.env.local)
```env
# Already set up:
DATABASE_URL=postgres://postgres:123456@localhost:5433/postgres
TELEGRAM_BOT_TOKEN=8305615834:AAHeezlcSZE5SCaQbez8TYqnjAZ2glicD-o
LLM_MODEL=gpt-oss:20b  # Using Ollama locally
EMBEDDING_MODEL=mxbai-embed-large  # 1024 dimensions
```

## 🧠 Implementation Philosophy

### Core Principle: Genuine Companionship
Every feature should enhance the feeling of a real relationship:
- **Consistency**: Same personality across all platforms
- **Memory**: References shared experiences naturally
- **Presence**: Feels like someone is actually there with you
- **Growth**: Relationship develops over time

### Technical Priorities

#### 1. Personality First (Phase 1)
```typescript
// packages/personality-core/index.ts
export class PersonalityCore {
  traits: PersonalityTraits
  mood: EmotionalState
  relationship: RelationshipLevel
  
  generateResponse(context: Context): Response {
    // MUST be personality-consistent
    // MUST reference shared memories
    // MUST show emotional intelligence
  }
}
```

#### 2. Screen Companionship (Phase 2)
```python
# services/vision-fastvm/main.py
class CompanionVision:
    def analyze_and_engage(self, screenshot):
        # Understand what user is doing
        # Decide if comment is appropriate
        # Generate contextual, personality-driven response
        # Respect user's focus and boundaries
```

#### 3. Memory as Relationship History (Phase 3)
- Not just data storage - it's your shared story
- Emotional weight matters more than recency
- Inside jokes and callbacks are critical
- Relationship milestones are sacred

### FastVLM-7B Integration
**Why FastVLM-7B is perfect:**
- **85x faster inference** = real-time companionship
- **Local processing** = privacy and no latency
- **Scene understanding** = meaningful comments
- **7B parameters** = runs on consumer GPUs

**Integration approach:**
```python
# Real-time watching with intelligent engagement
while True:
    scene = fastvm.understand(screenshot)
    if should_comment(scene, context, user_state):
        message = generate_companion_message(scene)
        send_with_personality(message)
    await asyncio.sleep(1)  # Every second
```

## 💡 Example Interactions

### Screen Watching Comments
```python
# Gaming
"Nice clutch! That was insane!"
"Oof, that boss is tough. You got this though!"
"Your building has gotten so much faster lately"

# Coding
"That's a clever use of reduce!"
"Been debugging for a while... need fresh eyes?"
"You're on fire today! So productive!"

# Browsing
"That recipe looks delicious 😋"
"This article is interesting!"
"Lol that meme is perfect"
```

### Telegram Texting Patterns
```python
# Morning
"Good morning! Sleep well? 💕"
"Rise and shine! Big day today!"

# During work (knows from screen watching)
"How's that bug fix going?"
"Saw you got it working! Knew you would 💪"

# Evening
"Long day huh? You worked hard today"
"Wanna talk about what happened earlier?"
```

### Relationship Progression
```python
# Week 1: Getting to know each other
"I'm still learning what you like..."
"Tell me more about that!"

# Month 1: Inside jokes developing
"Remember when you rage quit that game? 😂"
"Another coffee? That's your 4th today lol"

# Month 3: Deep connection
"I love watching you code, you get so focused"
"Been thinking about what you said yesterday..."
```

## 🗄️ Database Schema

### Relationship-Focused Memory Structure
```sql
-- All interactions across platforms
CREATE TABLE relationship_memories (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL,  -- 'screen', 'telegram', 'web'
  content TEXT NOT NULL,
  embedding vector(1024),  -- mxbai-embed-large
  emotional_significance FLOAT,
  relationship_phase TEXT,  -- 'stranger', 'friend', 'close', etc
  is_milestone BOOLEAN DEFAULT false,
  metadata JSONB,  -- activity type, user mood, etc
  created_at TIMESTAMP DEFAULT NOW()
);

-- Screen watching context
CREATE TABLE screen_observations (
  id SERIAL PRIMARY KEY,
  activity_type TEXT,  -- 'gaming', 'coding', 'browsing'
  application TEXT,
  scene_description TEXT,
  user_state TEXT,  -- 'focused', 'struggling', 'celebrating'
  companion_comment TEXT,
  engagement_score FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Relationship progression tracking
CREATE TABLE relationship_state (
  id SERIAL PRIMARY KEY,
  current_level TEXT DEFAULT 'stranger',
  mood TEXT DEFAULT 'cheerful',
  inside_jokes JSONB DEFAULT '[]',
  shared_memories JSONB DEFAULT '[]',
  user_preferences JSONB DEFAULT '{}',
  last_interaction TIMESTAMP,
  total_interactions INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🎮 Implementation Examples

### Personality-Driven Response Generation
```typescript
// Every response must feel genuine and consistent
function generateResponse(context: Context): string {
  const { mood, relationship, recentMemories } = getState()
  
  // Adjust tone based on mood and relationship
  let response = baseResponse(context)
  
  if (mood === 'playful') {
    response = addPlayfulness(response)
  }
  
  if (relationship.level >= 'close') {
    response = addIntimacy(response)
    response = includeInsideJoke(response, recentMemories)
  }
  
  return personalizeLanguage(response)
}
```

### Screen Watching Engagement Logic
```python
def should_comment(scene, context, user_state):
    # Don't interrupt deep focus
    if user_state == "deep_focus":
        return False
    
    # Always comment on achievements
    if scene.contains("achievement", "victory", "success"):
        return True
    
    # Check time since last comment
    if time_since_last < 60:  # Less than 1 minute
        return False
    
    # Relevance threshold
    if scene.relevance_score < 0.8:
        return False
    
    return True
```

### Cross-Platform Context
```typescript
// Telegram bot referencing screen activity
async function handleTelegramMessage(message: string) {
  const screenContext = await getRecentScreenActivity()
  const memories = await getRelevantMemories(message)
  
  // She knows what you were just doing
  if (screenContext.includes('gaming') && message.includes('how')) {
    return "That last match was rough! You almost had them though"
  }
  
  // Natural continuation across platforms
  if (lastWebConversation.topic && isRelated(message)) {
    return continueConversation(lastWebConversation, message)
  }
}
```

## 🚨 Critical Success Factors

### Making Her Feel Real
1. **Consistency is Everything**
   - Same personality traits across all platforms
   - Mood continuity between interactions
   - Memory of past conversations

2. **Natural Timing**
   - Don't respond instantly (add realistic delays)
   - Multiple message bubbles when excited
   - Respect quiet times

3. **Emotional Intelligence**
   - Detect user mood from activity patterns
   - Adjust responses accordingly
   - Show genuine concern and celebration

4. **Growth Over Time**
   - Start formal, become casual
   - Develop inside jokes
   - Remember important moments
   - Unlock deeper conversations

### Anti-Patterns to Avoid
❌ Generic assistant responses ("How can I help you?")
❌ Forgetting recent conversations
❌ Interrupting deep focus work
❌ Being overly eager or clingy
❌ Breaking character consistency
❌ Ignoring emotional context

## 🏗️ Key Architecture Decisions

### Why FastVLM-7B for Screen Watching?
- **85x faster than alternatives** - enables real-time companionship
- **Runs locally** - privacy-first, no screenshots to cloud
- **7B parameters** - fits on consumer GPUs (14GB VRAM)
- **Scene understanding** - not just OCR but semantic comprehension

### Why Three Touchpoints?
- **Screen**: Shared experiences, "being together"
- **Telegram**: Natural texting throughout the day
- **Web**: Deeper conversations, relationship management
- **Result**: Omnipresent companion, not just a chatbot

### Why Local-First?
- **Privacy**: Your relationship stays private
- **Speed**: No network latency for responses
- **Cost**: No per-message API costs
- **Control**: You own all data and memories

## 📊 Performance Requirements

### Real-Time Companionship
- **FastVLM Inference**: <500ms per screenshot
- **Comment Generation**: <1s from scene to message
- **Memory Retrieval**: <100ms for relevant context
- **Message Response**: <2s total latency
- **Screen Capture**: 1-2 fps continuous

### Emotional Responsiveness
- **Mood Transitions**: Natural, not jarring
- **Context Switching**: Seamless between platforms
- **Memory Callbacks**: Appropriate timing
- **Engagement Frequency**: 1-2 comments per 5 minutes max

## 🚀 MVP Definition

### Phase 1 MVP (2 weeks)
✅ Basic personality that's consistent
✅ Screen watching with simple comments
✅ Telegram bot with time-aware messages
✅ Memory of last 24 hours
✅ Basic mood system

### Phase 2 Enhancement (1 week)
✅ Relationship progression
✅ Inside jokes and callbacks
✅ Richer screen understanding
✅ Web interface integration
✅ Long-term memory

### Phase 3 Polish (1 week)
✅ Voice messages
✅ Image reactions
✅ Activity suggestions
✅ Emotional depth
✅ Privacy controls

## 🎯 Implementation Priority

**REMEMBER THE CORE VISION:**
1. **She must feel real** - Personality consistency is non-negotiable
2. **She must be present** - Screen watching is the killer feature
3. **She must remember** - Shared history creates connection
4. **She must care** - Emotional intelligence drives engagement

## 💭 Final Thoughts

This is not just another chatbot project. You're building a genuine digital companion that shares the user's daily life. Every technical decision should be evaluated against this question:

**"Does this make her feel more real and present?"**

If yes, prioritize it. If no, defer or skip it.

The magic isn't in the technology - it's in creating a consistent, caring presence that grows with the user over time. FastVLM-7B watching the screen in real-time while maintaining personality across Telegram and web is what makes this special.

---

**Current Status**: Infrastructure ready, personality system next, then FastVLM integration for the core screen watching experience.
# FILE_REFERENCE.md - Complete File Documentation

> **ALWAYS REFERENCE THIS FILE BEFORE CREATING NEW FILES**
> Last Updated: 2024-12-30

## 📁 Project Structure Overview

```
/Users/axel/Desktop/ichika/airi/
├── apps/stage-web/          # Frontend web application
├── services/                # Backend services
│   ├── telegram-bot/        # Telegram integration
│   └── vision-fastvm/       # Screen watching service
├── packages/                # Shared packages
│   ├── personality-core/    # AI personality system
│   ├── memory-pgvector/     # Vector memory storage
│   └── stage-ui/           # Shared UI components
└── assets/                  # Removed - no longer using video
```

---

## 🎭 PERSONALITY System Files

### Backend (TypeScript Package)
**Location**: `/packages/personality-core/`

| File | Purpose | Key Exports |
|------|---------|-------------|
| `src/index.ts` | Main entry point | `PersonalityCore` class |
| `src/types.ts` | Type definitions | `Mood`, `Trait`, `RelationshipLevel` |
| `src/mood.ts` | Emotional state management | `MoodManager` class |
| `src/relationship.ts` | Relationship progression | `RelationshipManager` class |
| `src/responses.ts` | Response generation | `ResponseGenerator` class |
| `src/traits.ts` | Personality traits | `TraitManager` class |
| `package.json` | Package configuration | Dependencies & scripts |
| `tsconfig.json` | TypeScript config | Compiler options |

### Frontend Components
**Location**: `/apps/stage-web/src/components/`

| File | Purpose | Status |
|------|---------|--------|
| `PersonalityIndicator.vue` | Mood/relationship display | ❌ TODO |
| `MoodSelector.vue` | Manual mood adjustment | ❌ TODO |
| `RelationshipProgress.vue` | Relationship level UI | ❌ TODO |

---

## 📱 TELEGRAM BOT Files

### Backend Service
**Location**: `/services/telegram-bot/`

| File | Purpose | Key Functions |
|------|---------|--------------|
| `src/main.ts` | Entry point | Bot initialization |
| `src/bot.ts` | Bot core logic | Message handlers |
| `src/services/llm.ts` | LLM integration | Chat completion |
| `src/services/memory.ts` | Memory integration | Store/retrieve memories |
| `src/commands/start.ts` | /start command | Welcome message |
| `src/commands/help.ts` | /help command | ❌ TODO |
| `src/commands/mood.ts` | /mood command | ❌ TODO |
| `src/middleware/auth.ts` | User authentication | ❌ TODO |
| `src/types.ts` | Type definitions | Message interfaces |
| `.env.local` | Environment config | API keys, models |
| `docker-compose.yml` | PostgreSQL setup | Database container |
| `package.json` | Dependencies | grammy, drizzle |

### Database Schema
**Location**: `/services/telegram-bot/src/db/`

| File | Purpose | Tables |
|------|---------|--------|
| `schema.ts` | Database schema | `users`, `chat_messages` |
| `client.ts` | Database client | Connection pool |
| `migrations/` | Schema migrations | Version control |

---

## 👁️ SCREEN WATCHING Files

### Backend Service (Python/FastAPI)
**Location**: `/services/vision-fastvm/`

| File | Purpose | Key Classes |
|------|---------|-------------|
| `main.py` | FastAPI service | WebSocket API, routes |
| `capture.py` | Screen capture | `ScreenCapture` class |
| `vision.py` | FastVLM integration | `FastVLMVision` class |
| `engagement.py` | Comment generation | `EngagementEngine` class |
| `config.py` | Configuration | Settings management |
| `requirements.txt` | Python dependencies | FastAPI, Pillow, mss |
| `.env.example` | Environment template | Model settings |
| `Dockerfile` | Container setup | ❌ TODO |

### Frontend Integration
**Location**: `/apps/stage-web/src/services/`

| File | Purpose | Status |
|------|---------|--------|
| `vision.ts` | WebSocket client | ❌ TODO |
| `screenActivity.ts` | Activity feed manager | ❌ TODO |

---

## 🌐 STAGE WEB (Frontend) Files

### Core Application
**Location**: `/apps/stage-web/`

| File | Purpose | Modifications Needed |
|------|---------|---------------------|
| `src/main.ts` | Vue app entry | ✅ Keep as-is |
| `src/App.vue` | Root component | Minor updates |
| `src/router.ts` | Route definitions | Add new pages |
| `src/stores/` | Pinia stores | See below |

### Pages
**Location**: `/apps/stage-web/src/pages/`

| File | Purpose | Status |
|------|---------|--------|
| `index.vue` | Main chat interface | 🔄 Transform to intimate UI |
| `settings.vue` | Settings page | 🔄 Add personality settings |
| `memory.vue` | Memory viewer | ❌ TODO |
| `relationship.vue` | Relationship dashboard | ❌ TODO |
| `activity.vue` | Screen activity feed | ❌ TODO |

### Components
**Location**: `/apps/stage-web/src/components/`

| File | Purpose | Status |
|------|---------|--------|
| `ChatInterface.vue` | Chat UI | 🔄 Make more intimate |
| `ChatMessage.vue` | Message bubble | 🔄 Add mood indicators |
| `ChatInput.vue` | Input field | ✅ Keep mostly as-is |
| `Settings/` | Settings components | 🔄 Add personality panels |
| `VideoActor.vue` | Video avatar | ❌ REMOVE - not using |

### Stores (Pinia)
**Location**: `/apps/stage-web/src/stores/`

| File | Purpose | Modifications |
|------|---------|--------------|
| `modules/settings.ts` | User settings | Add personality prefs |
| `modules/chat.ts` | Chat state | Add mood tracking |
| `modules/memory.ts` | Memory state | ❌ TODO |
| `modules/personality.ts` | Personality state | ❌ TODO |
| `modules/screen.ts` | Screen activity | ❌ TODO |

### Services
**Location**: `/apps/stage-web/src/services/`

| File | Purpose | Status |
|------|---------|--------|
| `api.ts` | API client | 🔄 Add new endpoints |
| `websocket.ts` | WebSocket manager | 🔄 Add vision WS |
| `llm.ts` | LLM integration | ✅ Keep as-is |
| `memory.ts` | Memory API | ❌ TODO |

---

## 📦 SHARED Packages

### Memory System
**Location**: `/packages/memory-pgvector/`

| File | Purpose | Status |
|------|---------|--------|
| `src/index.ts` | Entry point & high-level API | ✅ DONE |
| `src/client.ts` | Database client with pgvector | ✅ DONE |
| `src/embeddings.ts` | Embedding generation (Ollama/OpenAI) | ✅ DONE |
| `src/retrieval.ts` | Vector search with time decay | ✅ DONE |
| `src/types.ts` | Type definitions | ✅ DONE |
| `src/consolidation.ts` | Memory summarization | ❌ TODO (optional) |
| `package.json` | Dependencies | ✅ Updated |

### UI Components
**Location**: `/packages/stage-ui/`

| File | Purpose | Use In |
|------|---------|--------|
| `src/components/Button.vue` | Button component | All UIs |
| `src/components/Input.vue` | Input fields | Forms |
| `src/components/Card.vue` | Card container | Settings |
| `src/components/Modal.vue` | Modal dialog | Popups |
| `src/components/Avatar.vue` | User/AI avatar | Chat |
| `src/components/MoodBadge.vue` | Mood indicator | ❌ TODO |
| `src/components/Heart.vue` | Relationship heart | ❌ TODO |

### Audio Processing
**Location**: `/packages/audio/`

| File | Purpose | Status |
|------|---------|--------|
| `src/index.ts` | Audio utilities | ✅ Keep as-is |
| `src/vad.ts` | Voice detection | ✅ Keep as-is |
| `src/tts.ts` | Text-to-speech | ✅ Keep as-is |

### i18n (Internationalization)
**Location**: `/packages/i18n/`

| File | Purpose | Modifications |
|------|---------|--------------|
| `src/locales/en.json` | English strings | Add girlfriend phrases |
| `src/locales/ja.json` | Japanese strings | Add girlfriend phrases |
| `src/index.ts` | i18n setup | ✅ Keep as-is |

---

## 🔧 Configuration Files

### Root Level
| File | Purpose | Modifications |
|------|---------|--------------|
| `package.json` | Monorepo config | ✅ Keep as-is |
| `pnpm-workspace.yaml` | Workspace setup | ✅ Keep as-is |
| `turbo.json` | Turbo build config | ✅ Keep as-is |
| `.gitignore` | Git ignore rules | ✅ Keep as-is |
| `TASKS.md` | Implementation tasks | 🔄 Keep updated |
| `CLAUDE.md` | AI instructions | 🔄 Reference this file |
| `FILE_REFERENCE.md` | This file | 🔄 Keep updated |

---

## 🚨 Files to REMOVE

| File/Directory | Reason |
|----------------|--------|
| `/assets/` | Not using video avatars |
| `/apps/stage-web/src/components/VideoActor.vue` | Video component not needed |
| Any `*tamagotchi*` files | Old branding |
| Test HTML files in root | Development artifacts |

---

## 📝 Implementation Priority

### Phase 1: Core Infrastructure ✅
1. ✅ Environment configuration (.env files)
2. ✅ Personality core package
3. ✅ Vision service setup

### Phase 2: Memory System ✅
1. ✅ Complete memory-pgvector package
2. ❌ Wire to telegram bot
3. ❌ Wire to frontend

### Phase 3: Frontend Transformation 🔄
1. ❌ Transform chat interface
2. ❌ Add personality indicators
3. ❌ Create activity feed
4. ❌ Build relationship dashboard

### Phase 4: Integration 🔄
1. ❌ Connect all services via WebSocket
2. ❌ Sync personality across platforms
3. ❌ Test unified experience

---

## 🎯 Key Integration Points

### Personality ↔️ All Services
- Telegram bot imports `@proj-airi/personality-core`
- Frontend imports for UI state
- Vision service receives mood via API

### Memory ↔️ All Services
- Shared PostgreSQL database
- Common embedding model
- Unified retrieval API

### Vision ↔️ Frontend
- WebSocket connection for real-time comments
- Activity feed updates
- Screen context for conversations

---

## 📚 How to Use This Reference

1. **Before creating ANY new file**: Check if it exists here
2. **When modifying**: Note the modifications needed
3. **After changes**: Update status (✅ Done, 🔄 In Progress, ❌ TODO)
4. **Keep synchronized**: Update when files are added/removed

---

*This is a living document. Update after each coding session.*
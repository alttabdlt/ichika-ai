# TESTING GUIDE - AI Girlfriend Companion System

## ✅ Prerequisites Completed
- ✅ Ollama models installed:
  - `llama3.2:3b-instruct-fp16` (6.4GB) - Main conversation model
  - `nomic-embed-text` (274MB) - Memory embeddings
- ✅ Environment configuration updated (.env files)
- ✅ Database schema updated with memory tables

---

## 🚀 Step-by-Step Testing Instructions

### Step 1: Start PostgreSQL Database (2 min)
```bash
# Navigate to telegram bot directory
cd /Users/axel/Desktop/ichika/airi/services/telegram-bot

# Start PostgreSQL with pgvector
docker compose up -d

# Verify it's running (should see pgvector container)
docker ps

# Check logs for any errors
docker logs telegram-bot-pgvector-1
```

**Expected Output:**
- Container running on port 5433
- "database system is ready to accept connections"

---

### Step 2: Create Database Tables (1 min)
```bash
# Still in telegram-bot directory
cd /Users/axel/Desktop/ichika/airi/services/telegram-bot

# Push schema to database (creates/updates tables)
pnpm db:push
```

**Expected Output:**
- "Database schema pushed successfully"
- Creates: users, memory_summaries, updates chat_messages

**If Error "Cannot find module":**
```bash
pnpm install
```

---

### Step 3: Test Web Frontend (5 min)

#### Start the frontend:
```bash
# From project root
cd /Users/axel/Desktop/ichika/airi

# Start web app
pnpm -F @proj-airi/stage-web dev
```

**Expected Output:**
- Server running at http://localhost:5173

#### Test in browser:
1. Open http://localhost:5173
2. You should see the AIRI chat interface

#### Configure settings:
1. Click Settings (gear icon)
2. Go to "Providers" → "Ollama"
3. Verify settings:
   - Base URL: `http://localhost:11434`
   - Model: `llama3.2:3b-instruct-fp16`

#### Test chat:
1. Return to main chat
2. Type: "Hello, who are you?"
3. Should get a response from the AI

**What Works:**
- ✅ Chat interface
- ✅ Settings pages
- ✅ Provider configuration
- ✅ Basic conversation

**What's Missing:**
- ❌ Personality indicators (mood display)
- ❌ Relationship status
- ❌ Memory visualization
- ❌ Screen activity feed

---

### Step 4: Test Telegram Bot (10 min)

#### Start the bot:
```bash
# Open new terminal
cd /Users/axel/Desktop/ichika/airi/services/telegram-bot

# Verify Ollama is running
ollama list  # Should show your models

# Start the bot
pnpm start
```

**Expected Output:**
- "Bot started successfully"
- "Connected to database"

#### Test in Telegram:
1. Open Telegram app (mobile or desktop)
2. Search for your bot: `@YourBotName`
   - The bot token in .env.local corresponds to a specific bot
   - If you don't know the bot name, check with @BotFather
3. Send `/start`
4. Send a message: "Hi, how are you?"

**Expected Behavior:**
- Bot responds using llama3.2 model
- Conversations feel natural
- ~2-5 second response time

**Troubleshooting:**
- If bot doesn't respond: Check bot token is valid
- If "model not found": Ensure Ollama is running
- If slow: Normal for first message (model loading)

---

### Step 5: Test Memory System (5 min)

The memory system is implemented but not yet wired to the bot/frontend.

#### Manual test with Node REPL:
```bash
cd /Users/axel/Desktop/ichika/airi/packages/memory-pgvector

# Start Node REPL
node

# Test memory system
const { createMemorySystem } = await import('./dist/index.js')
const memory = createMemorySystem(
  'postgres://postgres:123456@localhost:5433/postgres',
  'ollama',
  'nomic-embed-text'
)

// Store a test memory
const id = await memory.remember(
  'test-user-123',
  'I love playing video games, especially RPGs',
  'telegram'
)
console.log('Stored memory:', id)

// Recall memories
const results = await memory.recall('test-user-123', 'gaming')
console.log('Found memories:', results)

// Exit
process.exit()
```

**Expected:**
- Memory stores successfully
- Recall finds relevant memories

---

## 📊 Current System Status

### ✅ Working Components
| Component | Status | Notes |
|-----------|--------|-------|
| Ollama Models | ✅ Working | llama3.2 + nomic-embed-text |
| PostgreSQL | ✅ Working | With pgvector extension |
| Web Frontend | ✅ Partial | Chat works, missing personality UI |
| Telegram Bot | ✅ Basic | Responds, no memory integration |
| Memory Package | ✅ Complete | Code ready, not integrated |
| Personality Core | ✅ Complete | Code ready, not integrated |

### ❌ Not Working Yet
| Component | Issue | Solution |
|-----------|-------|----------|
| Memory Integration | Not wired to bot/frontend | Need to call memory.remember() |
| Personality System | Not connected | Need to integrate with responses |
| Screen Watching | Python service not set up | Run vision-fastvm service |
| Relationship Tracking | No UI elements | Add components to frontend |

---

## 🔍 Quick Checks

### Check all services:
```bash
# Ollama
ollama list

# PostgreSQL
docker ps | grep pgvector

# Check ports
lsof -i :5433  # PostgreSQL
lsof -i :5173  # Web frontend
lsof -i :11434 # Ollama
```

### View logs:
```bash
# Database logs
docker logs telegram-bot-pgvector-1 --tail 50

# Frontend logs
# Check terminal where pnpm dev is running

# Telegram bot logs
# Check terminal where pnpm start is running
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to database"
```bash
# Restart PostgreSQL
cd /Users/axel/Desktop/ichika/airi/services/telegram-bot
docker compose down
docker compose up -d
```

### Issue: "Model not found"
```bash
# Ensure Ollama is running
ollama serve  # In separate terminal

# Verify model installed
ollama list
```

### Issue: Frontend won't start
```bash
# Clear cache and reinstall
cd /Users/axel/Desktop/ichika/airi
rm -rf node_modules/.vite
pnpm install
pnpm -F @proj-airi/stage-web dev
```

### Issue: Telegram bot not responding
1. Check bot token is correct
2. Ensure you're messaging the right bot
3. Check Ollama is running
4. Look for errors in terminal

---

## 📝 Next Steps

Once basic testing confirms everything works:

1. **Wire Memory System**
   - Modify telegram bot to store memories
   - Add memory retrieval to responses

2. **Integrate Personality**
   - Import personality-core package
   - Apply mood to responses

3. **Add Frontend Features**
   - Create mood indicator component
   - Add relationship status display
   - Build memory visualization

4. **Set Up Screen Watching** (Optional)
   - Install Python dependencies
   - Run vision-fastvm service
   - Connect to frontend via WebSocket

---

## 🎯 Success Criteria

You have a working baseline when:
- ✅ Can chat with AI in web interface
- ✅ Telegram bot responds to messages
- ✅ Database stores messages
- ✅ Memory system can store/recall (manually)
- ✅ Both use llama3.2 model consistently

This gives you the foundation to build the full girlfriend experience on top of!
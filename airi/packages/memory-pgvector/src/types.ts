export interface Memory {
  id: string
  userId: string
  platform: 'telegram' | 'web' | 'screen'
  content: string
  contentVector768?: number[]
  contentVector1024?: number[]
  contentVector1536?: number[]
  metadata?: Record<string, any>
  importance?: number
  emotionalContext?: {
    mood: string
    intensity: number
  }
  timestamp: Date
  conversationId?: string
  referencedMemories?: string[]
}

export interface MemorySummary {
  id: string
  conversationId: string
  summaryText: string
  summaryVector?: number[]
  startTime: Date
  endTime: Date
  messageCount: number
  topics: string[]
  emotionalTone: string
  importanceScore: number
}

export interface User {
  id: string
  username?: string
  platform: string
  preferences?: {
    personality?: {
      traits?: string[]
      preferredMood?: string
    }
    communication?: {
      style?: string
      frequency?: string
    }
  }
  relationshipLevel?: number
  createdAt: Date
  updatedAt: Date
}

export interface EmbeddingConfig {
  provider: 'ollama' | 'openai' | 'cohere'
  apiBaseUrl?: string
  apiKey?: string
  model: string
  dimension: 768 | 1024 | 1536
}

export interface RetrievalOptions {
  userId: string
  query?: string
  embedding?: number[]
  limit?: number
  threshold?: number
  platforms?: Array<'telegram' | 'web' | 'screen'>
  timeRange?: {
    start?: Date
    end?: Date
  }
  includeImportance?: boolean
  emotionalFilter?: string[]
}

export interface MemorySearchResult {
  memory: Memory
  similarity: number
  relevanceScore: number
  recencyBonus?: number
}

export interface ConsolidationOptions {
  userId: string
  conversationId: string
  minMessages?: number
  maxAge?: number // hours
  includePlatforms?: Array<'telegram' | 'web' | 'screen'>
}

export interface DatabaseConfig {
  connectionString: string
  maxConnections?: number
  idleTimeout?: number
  ssl?: boolean
}
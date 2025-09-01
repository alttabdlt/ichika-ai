// Export all types
export * from './types'
export * from './client'
export * from './embeddings'
export * from './retrieval'

// Re-export key classes for convenience
import { MemoryClient } from './client'
import { EmbeddingGenerator } from './embeddings'
import { MemoryRetriever } from './retrieval'
import type { DatabaseConfig, EmbeddingConfig, Memory, RetrievalOptions, MemorySearchResult } from './types'

// Simplified high-level API
export class MemorySystem {
  private client: MemoryClient
  private embedder: EmbeddingGenerator
  private retriever: MemoryRetriever

  constructor(
    databaseConfig: DatabaseConfig,
    embeddingConfig: EmbeddingConfig
  ) {
    this.client = new MemoryClient(databaseConfig)
    this.embedder = new EmbeddingGenerator(embeddingConfig)
    this.retriever = new MemoryRetriever(this.client, this.embedder)
  }

  // Store a memory with automatic embedding generation
  async remember(
    userId: string,
    content: string,
    platform: 'telegram' | 'web' | 'screen',
    metadata?: Record<string, any>
  ): Promise<string> {
    // Generate embedding
    const embedding = await this.embedder.generateEmbedding(content)
    
    // Determine dimension and store in appropriate column
    const memory: Omit<Memory, 'id' | 'timestamp'> = {
      userId,
      content,
      platform,
      metadata
    }

    // Store based on embedding dimension
    if (embedding.length === 768) {
      memory.contentVector768 = embedding
    } else if (embedding.length === 1024) {
      memory.contentVector1024 = embedding
    } else if (embedding.length === 1536) {
      memory.contentVector1536 = embedding
    }

    return await this.client.storeMemory(memory)
  }

  // Recall memories based on query
  async recall(
    userId: string,
    query: string,
    options?: Partial<RetrievalOptions>
  ): Promise<MemorySearchResult[]> {
    return await this.retriever.hybridSearch(userId, query, options)
  }

  // Get recent memories
  async getRecent(userId: string, hours = 24, limit = 50): Promise<Memory[]> {
    return await this.client.getRecentMemories(userId, hours, limit)
  }

  // Update user relationship level
  async updateRelationship(userId: string, level: number): Promise<void> {
    await this.client.updateRelationshipLevel(userId, level)
  }

  // Close connections
  async close(): Promise<void> {
    await this.client.close()
  }
}

// Default configuration helper
export function createMemorySystem(
  databaseUrl: string,
  embeddingProvider: 'ollama' | 'openai' = 'ollama',
  embeddingModel?: string
): MemorySystem {
  const databaseConfig: DatabaseConfig = {
    connectionString: databaseUrl
  }

  const embeddingConfig: EmbeddingConfig = {
    provider: embeddingProvider,
    model: embeddingModel || (embeddingProvider === 'ollama' ? 'nomic-embed-text' : 'text-embedding-ada-002'),
    dimension: embeddingProvider === 'ollama' ? 768 : 1536,
    apiBaseUrl: embeddingProvider === 'ollama' ? 'http://localhost:11434' : undefined
  }

  return new MemorySystem(databaseConfig, embeddingConfig)
}

import type { Memory, RetrievalOptions, MemorySearchResult } from './types'
import { MemoryClient } from './client'
import { EmbeddingGenerator } from './embeddings'

export class MemoryRetriever {
  constructor(
    private client: MemoryClient,
    private embedder: EmbeddingGenerator
  ) {}

  async retrieve(options: RetrievalOptions): Promise<MemorySearchResult[]> {
    // Generate embedding from query if provided
    let queryEmbedding = options.embedding
    if (!queryEmbedding && options.query) {
      queryEmbedding = await this.embedder.generateEmbedding(options.query)
    }

    if (!queryEmbedding) {
      // Fallback to recent memories if no query
      const memories = await this.client.getRecentMemories(
        options.userId,
        24,
        options.limit || 10
      )
      
      return memories.map(memory => ({
        memory,
        similarity: 1.0,
        relevanceScore: this.calculateRelevance(memory, options)
      }))
    }

    // Perform vector search
    const dimension = queryEmbedding.length as 768 | 1024 | 1536
    const searchResults = await this.client.searchByVector(
      options.userId,
      queryEmbedding,
      dimension,
      (options.limit || 10) * 2, // Get more to filter
      options.threshold || 0.5
    )

    // Apply additional filters and scoring
    let results = searchResults
      .filter(result => this.matchesFilters(result.memory, options))
      .map(result => ({
        ...result,
        relevanceScore: this.calculateRelevance(result.memory, options, result.similarity),
        recencyBonus: this.calculateRecencyBonus(result.memory.timestamp)
      }))

    // Apply emotional filter if specified
    if (options.emotionalFilter && options.emotionalFilter.length > 0) {
      results = results.filter(r => 
        r.memory.emotionalContext && 
        options.emotionalFilter!.includes(r.memory.emotionalContext.mood)
      )
    }

    // Sort by combined score
    results.sort((a, b) => {
      const scoreA = this.getCombinedScore(a)
      const scoreB = this.getCombinedScore(b)
      return scoreB - scoreA
    })

    // Return top results
    return results.slice(0, options.limit || 10)
  }

  async retrieveWithContext(
    options: RetrievalOptions
  ): Promise<{
    primary: MemorySearchResult[]
    context: Memory[]
  }> {
    // Get primary results
    const primary = await this.retrieve(options)

    // Collect conversation IDs and referenced memories
    const conversationIds = new Set<string>()
    const referencedIds = new Set<string>()

    primary.forEach(result => {
      if (result.memory.conversationId) {
        conversationIds.add(result.memory.conversationId)
      }
      if (result.memory.referencedMemories) {
        (result.memory.referencedMemories as string[]).forEach(id => 
          referencedIds.add(id)
        )
      }
    })

    // Fetch contextual memories
    const contextMemories: Memory[] = []

    // Get memories from same conversations
    for (const convId of conversationIds) {
      const convMemories = await this.client.getUserMemories(options.userId, 5)
      contextMemories.push(
        ...convMemories.filter(m => 
          m.conversationId === convId && 
          !primary.some(p => p.memory.id === m.id)
        )
      )
    }

    // Get referenced memories
    for (const refId of referencedIds) {
      const memory = await this.client.getMemory(refId)
      if (memory && !primary.some(p => p.memory.id === memory.id)) {
        contextMemories.push(memory)
      }
    }

    return {
      primary,
      context: contextMemories
    }
  }

  async hybridSearch(
    userId: string,
    query: string,
    options?: Partial<RetrievalOptions>
  ): Promise<MemorySearchResult[]> {
    // Perform both vector and keyword search
    const embedding = await this.embedder.generateEmbedding(query)
    
    // Vector search
    const vectorResults = await this.retrieve({
      userId,
      embedding,
      ...options
    })

    // Keyword search (simple text matching)
    const allMemories = await this.client.getUserMemories(userId, 100)
    const keywords = this.extractKeywords(query)
    
    const keywordResults = allMemories
      .filter(memory => this.matchesKeywords(memory.content, keywords))
      .map(memory => ({
        memory,
        similarity: this.calculateKeywordSimilarity(memory.content, keywords),
        relevanceScore: this.calculateRelevance(memory, { userId, query, ...options })
      }))

    // Merge and deduplicate results
    const mergedResults = new Map<string, MemorySearchResult>()
    
    // Add vector results with higher weight
    vectorResults.forEach(result => {
      const existing = mergedResults.get(result.memory.id)
      if (existing) {
        existing.similarity = Math.max(existing.similarity, result.similarity * 1.2)
        existing.relevanceScore = Math.max(existing.relevanceScore, result.relevanceScore)
      } else {
        mergedResults.set(result.memory.id, {
          ...result,
          similarity: result.similarity * 1.2 // Boost vector matches
        })
      }
    })

    // Add keyword results
    keywordResults.forEach(result => {
      const existing = mergedResults.get(result.memory.id)
      if (existing) {
        existing.similarity = Math.max(existing.similarity, result.similarity)
        existing.relevanceScore = Math.max(existing.relevanceScore, result.relevanceScore)
      } else {
        mergedResults.set(result.memory.id, result)
      }
    })

    // Sort by combined score
    const finalResults = Array.from(mergedResults.values())
    finalResults.sort((a, b) => {
      const scoreA = this.getCombinedScore(a)
      const scoreB = this.getCombinedScore(b)
      return scoreB - scoreA
    })

    return finalResults.slice(0, options?.limit || 10)
  }

  private matchesFilters(memory: Memory, options: RetrievalOptions): boolean {
    // Platform filter
    if (options.platforms && !options.platforms.includes(memory.platform)) {
      return false
    }

    // Time range filter
    if (options.timeRange) {
      const timestamp = new Date(memory.timestamp).getTime()
      if (options.timeRange.start && timestamp < options.timeRange.start.getTime()) {
        return false
      }
      if (options.timeRange.end && timestamp > options.timeRange.end.getTime()) {
        return false
      }
    }

    return true
  }

  private calculateRelevance(
    memory: Memory, 
    options: RetrievalOptions,
    similarity?: number
  ): number {
    let score = similarity || 0.5

    // Boost by importance
    if (options.includeImportance && memory.importance) {
      score *= (1 + memory.importance * 0.5)
    }

    // Platform relevance (prefer same platform as query)
    if (memory.metadata?.queryPlatform === memory.platform) {
      score *= 1.1
    }

    // Emotional context matching
    if (memory.emotionalContext && options.emotionalFilter) {
      if (options.emotionalFilter.includes(memory.emotionalContext.mood)) {
        score *= 1.2
      }
    }

    return Math.min(score, 1.0)
  }

  private calculateRecencyBonus(timestamp: Date): number {
    const now = Date.now()
    const memoryTime = new Date(timestamp).getTime()
    const hoursSince = (now - memoryTime) / (1000 * 60 * 60)
    
    // Exponential decay with half-life of 24 hours
    return Math.exp(-0.693 * hoursSince / 24)
  }

  private getCombinedScore(result: MemorySearchResult): number {
    const recencyWeight = 0.2
    const relevanceWeight = 0.8
    
    const recency = result.recencyBonus || this.calculateRecencyBonus(result.memory.timestamp)
    
    return (result.relevanceScore * relevanceWeight) + (recency * recencyWeight)
  }

  private extractKeywords(query: string): string[] {
    // Simple keyword extraction (can be improved with NLP)
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might'
    ])

    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
  }

  private matchesKeywords(content: string, keywords: string[]): boolean {
    const lowerContent = content.toLowerCase()
    return keywords.some(keyword => lowerContent.includes(keyword))
  }

  private calculateKeywordSimilarity(content: string, keywords: string[]): number {
    const lowerContent = content.toLowerCase()
    const matches = keywords.filter(keyword => lowerContent.includes(keyword))
    return matches.length / keywords.length
  }
}
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq, sql, and, gte, lte, inArray, desc, asc } from 'drizzle-orm'
import { pgTable, text, timestamp, jsonb, integer, real, vector, uuid, index } from 'drizzle-orm/pg-core'
import type { DatabaseConfig, Memory, MemorySummary, User } from './types'

// Define database schema
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username'),
  platform: text('platform').notNull(),
  preferences: jsonb('preferences'),
  relationshipLevel: integer('relationship_level').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  platformIdx: index('users_platform_idx').on(table.platform),
  usernameIdx: index('users_username_idx').on(table.username)
}))

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  platform: text('platform').notNull(),
  content: text('content').notNull(),
  contentVector768: vector('content_vector_768', { dimensions: 768 }),
  contentVector1024: vector('content_vector_1024', { dimensions: 1024 }),
  contentVector1536: vector('content_vector_1536', { dimensions: 1536 }),
  metadata: jsonb('metadata'),
  importance: real('importance').default(0.5),
  emotionalContext: jsonb('emotional_context'),
  timestamp: timestamp('timestamp').defaultNow(),
  conversationId: text('conversation_id'),
  referencedMemories: jsonb('referenced_memories')
}, (table) => ({
  userIdx: index('messages_user_idx').on(table.userId),
  timestampIdx: index('messages_timestamp_idx').on(table.timestamp),
  conversationIdx: index('messages_conversation_idx').on(table.conversationId),
  vector768Idx: index('messages_vector_768_idx').using('ivfflat', table.contentVector768.op('vector_cosine_ops')),
  vector1024Idx: index('messages_vector_1024_idx').using('ivfflat', table.contentVector1024.op('vector_cosine_ops')),
  vector1536Idx: index('messages_vector_1536_idx').using('ivfflat', table.contentVector1536.op('vector_cosine_ops'))
}))

export const memorySummaries = pgTable('memory_summaries', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: text('conversation_id').notNull(),
  summaryText: text('summary_text').notNull(),
  summaryVector: vector('summary_vector', { dimensions: 768 }),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  messageCount: integer('message_count').default(0),
  topics: jsonb('topics'),
  emotionalTone: text('emotional_tone'),
  importanceScore: real('importance_score').default(0.5)
}, (table) => ({
  conversationIdx: index('summaries_conversation_idx').on(table.conversationId),
  timeRangeIdx: index('summaries_time_range_idx').on(table.startTime, table.endTime),
  vectorIdx: index('summaries_vector_idx').using('ivfflat', table.summaryVector.op('vector_cosine_ops'))
}))

export class MemoryClient {
  private sql: postgres.Sql
  private db: ReturnType<typeof drizzle>

  constructor(config: DatabaseConfig) {
    this.sql = postgres(config.connectionString, {
      max: config.maxConnections || 10,
      idle_timeout: config.idleTimeout || 20,
      ssl: config.ssl !== false ? 'require' : false
    })
    
    this.db = drizzle(this.sql)
  }

  async storeMemory(memory: Omit<Memory, 'id' | 'timestamp'>): Promise<string> {
    const [result] = await this.db.insert(chatMessages).values({
      userId: memory.userId,
      platform: memory.platform,
      content: memory.content,
      contentVector768: memory.contentVector768,
      contentVector1024: memory.contentVector1024,
      contentVector1536: memory.contentVector1536,
      metadata: memory.metadata,
      importance: memory.importance,
      emotionalContext: memory.emotionalContext,
      conversationId: memory.conversationId,
      referencedMemories: memory.referencedMemories
    }).returning({ id: chatMessages.id })
    
    return result.id
  }

  async getMemory(id: string): Promise<Memory | null> {
    const [result] = await this.db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.id, id))
      .limit(1)
    
    return result ? this.mapToMemory(result) : null
  }

  async getUserMemories(userId: string, limit = 100): Promise<Memory[]> {
    const results = await this.db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.timestamp))
      .limit(limit)
    
    return results.map(r => this.mapToMemory(r))
  }

  async getRecentMemories(userId: string, hours = 24, limit = 50): Promise<Memory[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)
    
    const results = await this.db
      .select()
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.userId, userId),
          gte(chatMessages.timestamp, since)
        )
      )
      .orderBy(desc(chatMessages.timestamp))
      .limit(limit)
    
    return results.map(r => this.mapToMemory(r))
  }

  async searchByVector(
    userId: string,
    queryVector: number[],
    dimension: 768 | 1024 | 1536,
    limit = 10,
    threshold = 0.7
  ): Promise<Array<{ memory: Memory; similarity: number }>> {
    const vectorColumn = dimension === 768 
      ? chatMessages.contentVector768 
      : dimension === 1024 
        ? chatMessages.contentVector1024 
        : chatMessages.contentVector1536

    const results = await this.db
      .select({
        message: chatMessages,
        similarity: sql<number>`1 - (${vectorColumn} <=> ${queryVector}::vector)`
      })
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.userId, userId),
          sql`1 - (${vectorColumn} <=> ${queryVector}::vector) > ${threshold}`
        )
      )
      .orderBy(desc(sql`1 - (${vectorColumn} <=> ${queryVector}::vector)`))
      .limit(limit)
    
    return results.map(r => ({
      memory: this.mapToMemory(r.message),
      similarity: r.similarity
    }))
  }

  async createOrUpdateUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const existing = await this.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.platform, user.platform),
          user.username ? eq(users.username, user.username) : sql`true`
        )
      )
      .limit(1)

    if (existing.length > 0) {
      await this.db
        .update(users)
        .set({
          preferences: user.preferences,
          relationshipLevel: user.relationshipLevel,
          updatedAt: new Date()
        })
        .where(eq(users.id, existing[0].id))
      
      return existing[0].id
    }

    const [result] = await this.db
      .insert(users)
      .values({
        username: user.username,
        platform: user.platform,
        preferences: user.preferences,
        relationshipLevel: user.relationshipLevel
      })
      .returning({ id: users.id })
    
    return result.id
  }

  async getUser(userId: string): Promise<User | null> {
    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
    
    return result || null
  }

  async updateRelationshipLevel(userId: string, level: number): Promise<void> {
    await this.db
      .update(users)
      .set({ 
        relationshipLevel: level,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
  }

  async storeSummary(summary: Omit<MemorySummary, 'id'>): Promise<string> {
    const [result] = await this.db
      .insert(memorySummaries)
      .values(summary)
      .returning({ id: memorySummaries.id })
    
    return result.id
  }

  async getSummaries(conversationId: string, limit = 10): Promise<MemorySummary[]> {
    const results = await this.db
      .select()
      .from(memorySummaries)
      .where(eq(memorySummaries.conversationId, conversationId))
      .orderBy(desc(memorySummaries.endTime))
      .limit(limit)
    
    return results
  }

  async close(): Promise<void> {
    await this.sql.end()
  }

  private mapToMemory(row: any): Memory {
    return {
      id: row.id,
      userId: row.userId,
      platform: row.platform,
      content: row.content,
      contentVector768: row.contentVector768,
      contentVector1024: row.contentVector1024,
      contentVector1536: row.contentVector1536,
      metadata: row.metadata,
      importance: row.importance,
      emotionalContext: row.emotionalContext,
      timestamp: row.timestamp,
      conversationId: row.conversationId,
      referencedMemories: row.referencedMemories
    }
  }
}
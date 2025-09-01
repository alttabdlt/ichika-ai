import type { EmbeddingConfig } from './types'

export class EmbeddingGenerator {
  private config: EmbeddingConfig

  constructor(config: EmbeddingConfig) {
    this.config = config
  }

  async generateEmbedding(text: string): Promise<number[]> {
    switch (this.config.provider) {
      case 'ollama':
        return this.generateOllamaEmbedding(text)
      case 'openai':
        return this.generateOpenAIEmbedding(text)
      case 'cohere':
        return this.generateCohereEmbedding(text)
      default:
        throw new Error(`Unsupported embedding provider: ${this.config.provider}`)
    }
  }

  async generateBatch(texts: string[]): Promise<number[][]> {
    // Process in batches to avoid overwhelming the API
    const batchSize = 10
    const results: number[][] = []
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize)
      const embeddings = await Promise.all(
        batch.map(text => this.generateEmbedding(text))
      )
      results.push(...embeddings)
    }
    
    return results
  }

  private async generateOllamaEmbedding(text: string): Promise<number[]> {
    const url = `${this.config.apiBaseUrl || 'http://localhost:11434'}/api/embeddings`
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt: text
        })
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const data = await response.json()
      const embedding = data.embedding
      
      // Verify dimension matches
      if (embedding.length !== this.config.dimension) {
        console.warn(`Embedding dimension mismatch: expected ${this.config.dimension}, got ${embedding.length}`)
      }
      
      return embedding
    } catch (error) {
      console.error('Failed to generate Ollama embedding:', error)
      // Return zero vector as fallback
      return new Array(this.config.dimension).fill(0)
    }
  }

  private async generateOpenAIEmbedding(text: string): Promise<number[]> {
    const url = `${this.config.apiBaseUrl || 'https://api.openai.com'}/v1/embeddings`
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model || 'text-embedding-ada-002',
          input: text
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      const embedding = data.data[0].embedding
      
      return embedding
    } catch (error) {
      console.error('Failed to generate OpenAI embedding:', error)
      return new Array(this.config.dimension).fill(0)
    }
  }

  private async generateCohereEmbedding(text: string): Promise<number[]> {
    const url = `${this.config.apiBaseUrl || 'https://api.cohere.ai'}/v1/embed`
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model || 'embed-english-v3.0',
          texts: [text],
          input_type: 'search_document'
        })
      })

      if (!response.ok) {
        throw new Error(`Cohere API error: ${response.statusText}`)
      }

      const data = await response.json()
      const embedding = data.embeddings[0]
      
      return embedding
    } catch (error) {
      console.error('Failed to generate Cohere embedding:', error)
      return new Array(this.config.dimension).fill(0)
    }
  }

  // Utility function to calculate cosine similarity
  static cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have the same dimension')
    }

    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i]
      norm1 += vec1[i] * vec1[i]
      norm2 += vec2[i] * vec2[i]
    }

    norm1 = Math.sqrt(norm1)
    norm2 = Math.sqrt(norm2)

    if (norm1 === 0 || norm2 === 0) {
      return 0
    }

    return dotProduct / (norm1 * norm2)
  }

  // Combine multiple embeddings with weighted average
  static combineEmbeddings(
    embeddings: number[][],
    weights?: number[]
  ): number[] {
    if (embeddings.length === 0) {
      throw new Error('No embeddings to combine')
    }

    const dimension = embeddings[0].length
    const finalWeights = weights || new Array(embeddings.length).fill(1 / embeddings.length)
    
    if (finalWeights.length !== embeddings.length) {
      throw new Error('Weights array must match embeddings array length')
    }

    const combined = new Array(dimension).fill(0)

    for (let i = 0; i < embeddings.length; i++) {
      const embedding = embeddings[i]
      const weight = finalWeights[i]
      
      for (let j = 0; j < dimension; j++) {
        combined[j] += embedding[j] * weight
      }
    }

    // Normalize the combined vector
    const norm = Math.sqrt(combined.reduce((sum, val) => sum + val * val, 0))
    if (norm > 0) {
      for (let i = 0; i < dimension; i++) {
        combined[i] /= norm
      }
    }

    return combined
  }
}
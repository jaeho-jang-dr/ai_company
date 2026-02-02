/**
 * AI Company - AI Provider Manager
 * AI 프로바이더 관리 및 폴백 처리
 */

import { EventEmitter } from 'events'
import {
  AIProvider,
  AIProviderType,
  AIMessage,
  AICompletionOptions,
  AICompletionResult,
  AICallLog,
  AIManagerConfig,
} from './types'
import { GeminiProvider, createGeminiProvider, MockProvider, createMockProvider } from './providers'

// ============================================================
// AI PROVIDER MANAGER
// ============================================================

export class AIProviderManager extends EventEmitter {
  private providers: Map<AIProviderType, AIProvider> = new Map()
  private primaryProvider: AIProviderType
  private fallbackProviders: AIProviderType[]
  private callLogs: AICallLog[] = []
  private enableLogging: boolean
  private logRetention: number
  private callCounter: number = 0

  constructor(config: AIManagerConfig) {
    super()
    this.primaryProvider = config.primaryProvider
    this.fallbackProviders = config.fallbackProviders || []
    this.enableLogging = config.enableLogging ?? true
    this.logRetention = config.logRetention ?? 1000
  }

  /**
   * Initialize providers from environment
   */
  async initialize(): Promise<void> {
    // Try to create Gemini provider
    const gemini = createGeminiProvider()
    if (gemini) {
      this.providers.set('gemini', gemini)
      console.log('[AIProviderManager] Gemini provider initialized')
    }

    // Always add Mock provider for testing
    const mock = createMockProvider()
    this.providers.set('mock', mock)
    console.log('[AIProviderManager] Mock provider initialized')

    // Validate primary provider
    if (!this.providers.has(this.primaryProvider)) {
      console.warn(`[AIProviderManager] Primary provider '${this.primaryProvider}' not available`)

      // Try fallback providers
      for (const fallback of this.fallbackProviders) {
        if (this.providers.has(fallback)) {
          console.log(`[AIProviderManager] Using fallback provider: ${fallback}`)
          this.primaryProvider = fallback
          break
        }
      }

      // Last resort: use mock
      if (!this.providers.has(this.primaryProvider)) {
        console.log('[AIProviderManager] Using mock provider as last resort')
        this.primaryProvider = 'mock'
      }
    }

    this.emit('initialized', {
      primary: this.primaryProvider,
      available: Array.from(this.providers.keys()),
    })
  }

  /**
   * Register a custom provider
   */
  registerProvider(provider: AIProvider): void {
    this.providers.set(provider.name, provider)
    this.emit('provider:registered', provider.name)
  }

  /**
   * Get a specific provider
   */
  getProvider(type: AIProviderType): AIProvider | undefined {
    return this.providers.get(type)
  }

  /**
   * Get the primary provider
   */
  getPrimaryProvider(): AIProvider | undefined {
    return this.providers.get(this.primaryProvider)
  }

  /**
   * List available providers
   */
  getAvailableProviders(): AIProviderType[] {
    return Array.from(this.providers.keys())
  }

  /**
   * Check provider health
   */
  async checkHealth(type?: AIProviderType): Promise<Record<AIProviderType, boolean>> {
    const results: Record<string, boolean> = {}

    if (type) {
      const provider = this.providers.get(type)
      results[type] = provider ? await provider.healthCheck() : false
    } else {
      for (const [name, provider] of this.providers) {
        try {
          results[name] = await provider.healthCheck()
        } catch {
          results[name] = false
        }
      }
    }

    return results as Record<AIProviderType, boolean>
  }

  /**
   * Complete a message with automatic fallback
   */
  async complete(
    messages: AIMessage[],
    options: AICompletionOptions & {
      agentId?: string
      taskId?: string
      preferredProvider?: AIProviderType
    } = {}
  ): Promise<AICompletionResult> {
    const startTime = Date.now()
    const logId = `call-${++this.callCounter}-${Date.now()}`

    // Determine provider order
    const providerOrder = this.getProviderOrder(options.preferredProvider)

    let lastError: Error | undefined
    let result: AICompletionResult | undefined

    for (const providerType of providerOrder) {
      const provider = this.providers.get(providerType)
      if (!provider || !provider.isConfigured) continue

      try {
        this.emit('call:start', { provider: providerType, logId })

        result = await provider.complete(messages, options)

        // Log successful call
        if (this.enableLogging) {
          this.logCall({
            id: logId,
            timestamp: new Date(),
            provider: providerType,
            model: result.model,
            agentId: options.agentId,
            taskId: options.taskId,
            request: {
              messagesCount: messages.length,
              systemPrompt: options.systemPrompt,
              options,
            },
            response: {
              contentLength: result.content.length,
              usage: result.usage,
              latencyMs: result.latencyMs,
              finishReason: result.finishReason,
            },
            success: true,
          })
        }

        this.emit('call:complete', {
          provider: providerType,
          logId,
          latencyMs: Date.now() - startTime,
        })

        return result
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.error(`[AIProviderManager] ${providerType} failed:`, lastError.message)

        // Log failed call
        if (this.enableLogging) {
          this.logCall({
            id: logId,
            timestamp: new Date(),
            provider: providerType,
            model: options.model || 'unknown',
            agentId: options.agentId,
            taskId: options.taskId,
            request: {
              messagesCount: messages.length,
              systemPrompt: options.systemPrompt,
              options,
            },
            error: lastError.message,
            success: false,
          })
        }

        this.emit('call:error', {
          provider: providerType,
          logId,
          error: lastError,
        })

        // Try next provider
        continue
      }
    }

    throw lastError || new Error('All providers failed')
  }

  /**
   * Stream completion (if supported)
   */
  async *streamComplete(
    messages: AIMessage[],
    options: AICompletionOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    // For now, fall back to regular completion
    // Streaming can be implemented per-provider later
    const result = await this.complete(messages, options)
    yield result.content
  }

  /**
   * Get provider order based on preference
   */
  private getProviderOrder(preferred?: AIProviderType): AIProviderType[] {
    const order: AIProviderType[] = []

    // Add preferred provider first
    if (preferred && this.providers.has(preferred)) {
      order.push(preferred)
    }

    // Add primary provider
    if (this.primaryProvider && !order.includes(this.primaryProvider)) {
      order.push(this.primaryProvider)
    }

    // Add fallback providers
    for (const fallback of this.fallbackProviders) {
      if (!order.includes(fallback) && this.providers.has(fallback)) {
        order.push(fallback)
      }
    }

    // Add any remaining providers
    for (const [type] of this.providers) {
      if (!order.includes(type)) {
        order.push(type)
      }
    }

    return order
  }

  /**
   * Log a call
   */
  private logCall(log: AICallLog): void {
    this.callLogs.push(log)

    // Trim logs if needed
    if (this.callLogs.length > this.logRetention) {
      this.callLogs = this.callLogs.slice(-this.logRetention)
    }

    this.emit('call:logged', log)
  }

  /**
   * Get call logs
   */
  getCallLogs(filter?: {
    provider?: AIProviderType
    agentId?: string
    taskId?: string
    success?: boolean
    since?: Date
  }): AICallLog[] {
    let logs = this.callLogs

    if (filter) {
      logs = logs.filter(log => {
        if (filter.provider && log.provider !== filter.provider) return false
        if (filter.agentId && log.agentId !== filter.agentId) return false
        if (filter.taskId && log.taskId !== filter.taskId) return false
        if (filter.success !== undefined && log.success !== filter.success) return false
        if (filter.since && log.timestamp < filter.since) return false
        return true
      })
    }

    return logs
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): {
    totalCalls: number
    successfulCalls: number
    failedCalls: number
    totalTokens: number
    averageLatency: number
    byProvider: Record<AIProviderType, {
      calls: number
      tokens: number
      avgLatency: number
    }>
  } {
    const stats = {
      totalCalls: this.callLogs.length,
      successfulCalls: 0,
      failedCalls: 0,
      totalTokens: 0,
      averageLatency: 0,
      byProvider: {} as Record<AIProviderType, { calls: number; tokens: number; avgLatency: number }>,
    }

    let totalLatency = 0

    for (const log of this.callLogs) {
      if (log.success) {
        stats.successfulCalls++
        if (log.response) {
          stats.totalTokens += log.response.usage.totalTokens
          totalLatency += log.response.latencyMs
        }
      } else {
        stats.failedCalls++
      }

      // By provider
      if (!stats.byProvider[log.provider]) {
        stats.byProvider[log.provider] = { calls: 0, tokens: 0, avgLatency: 0 }
      }
      stats.byProvider[log.provider].calls++
      if (log.response) {
        stats.byProvider[log.provider].tokens += log.response.usage.totalTokens
        stats.byProvider[log.provider].avgLatency =
          (stats.byProvider[log.provider].avgLatency * (stats.byProvider[log.provider].calls - 1) +
            log.response.latencyMs) /
          stats.byProvider[log.provider].calls
      }
    }

    stats.averageLatency = stats.successfulCalls > 0 ? totalLatency / stats.successfulCalls : 0

    return stats
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.callLogs = []
    this.emit('logs:cleared')
  }
}

// ============================================================
// FACTORY FUNCTION
// ============================================================

/**
 * Create AI Provider Manager with default configuration
 */
export function createAIProviderManager(
  config?: Partial<AIManagerConfig>
): AIProviderManager {
  return new AIProviderManager({
    primaryProvider: 'gemini',
    fallbackProviders: ['mock'],
    enableLogging: true,
    logRetention: 1000,
    ...config,
  })
}

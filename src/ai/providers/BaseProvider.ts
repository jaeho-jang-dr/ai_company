/**
 * AI Company - Base AI Provider
 * AI 프로바이더 기본 추상 클래스
 */

import {
  AIProvider,
  AIProviderType,
  AIProviderConfig,
  AIMessage,
  AICompletionOptions,
  AICompletionResult,
} from '../types'

export abstract class BaseProvider implements AIProvider {
  abstract readonly name: AIProviderType
  protected config: AIProviderConfig
  protected _isConfigured: boolean = false

  constructor(config: AIProviderConfig = {}) {
    this.config = {
      defaultTemperature: 0.7,
      defaultMaxTokens: 4096,
      timeout: 60000,
      retryAttempts: 3,
      ...config,
    }
  }

  get isConfigured(): boolean {
    return this._isConfigured
  }

  abstract complete(
    messages: AIMessage[],
    options?: AICompletionOptions
  ): Promise<AICompletionResult>

  abstract healthCheck(): Promise<boolean>

  /**
   * Retry logic for API calls with exponential backoff
   */
  protected async withRetry<T>(
    fn: () => Promise<T>,
    attempts: number = this.config.retryAttempts || 3
  ): Promise<T> {
    let lastError: Error | undefined

    for (let i = 0; i < attempts; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.error(`[${this.name}] Attempt ${i + 1}/${attempts} failed:`, lastError.message)

        if (i < attempts - 1) {
          const delay = Math.pow(2, i) * 1000
          await this.delay(delay)
        }
      }
    }

    throw lastError
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Make HTTP request with timeout
   */
  protected async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number = this.config.timeout || 60000
  ): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      return response
    } finally {
      clearTimeout(timeoutId)
    }
  }
}

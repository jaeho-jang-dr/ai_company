/**
 * AI Company - Gemini Provider
 * Google Gemini API 프로바이더 (Primary)
 */

import {
  AIProviderType,
  AIMessage,
  AICompletionOptions,
  AICompletionResult,
  GeminiConfig,
} from '../types'
import { BaseProvider } from './BaseProvider'

// Gemini API Types
interface GeminiContent {
  role: 'user' | 'model'
  parts: Array<{ text: string }>
}

interface GeminiRequest {
  contents: GeminiContent[]
  generationConfig?: {
    temperature?: number
    maxOutputTokens?: number
    stopSequences?: string[]
  }
  systemInstruction?: {
    parts: Array<{ text: string }>
  }
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>
      role: string
    }
    finishReason: string
  }>
  usageMetadata?: {
    promptTokenCount: number
    candidatesTokenCount: number
    totalTokenCount: number
  }
}

export class GeminiProvider extends BaseProvider {
  readonly name: AIProviderType = 'gemini'
  private apiKey: string
  private model: string
  private baseUrl: string

  constructor(config: GeminiConfig) {
    super(config)

    this.apiKey = config.apiKey
    this.model = config.model || 'gemini-2.0-flash'
    this.baseUrl = config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta'

    this._isConfigured = !!this.apiKey
  }

  async complete(
    messages: AIMessage[],
    options: AICompletionOptions = {}
  ): Promise<AICompletionResult> {
    if (!this._isConfigured) {
      throw new Error('Gemini provider is not configured. API key is missing.')
    }

    const startTime = Date.now()
    const model = options.model || this.model

    const request = this.buildRequest(messages, options)

    const result = await this.withRetry(async () => {
      const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`

      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
      }

      return response.json() as Promise<GeminiResponse>
    })

    return this.parseResponse(result, model, Date.now() - startTime)
  }

  async healthCheck(): Promise<boolean> {
    if (!this._isConfigured) return false

    try {
      const url = `${this.baseUrl}/models?key=${this.apiKey}`
      const response = await this.fetchWithTimeout(url, { method: 'GET' }, 10000)
      return response.ok
    } catch {
      return false
    }
  }

  private buildRequest(messages: AIMessage[], options: AICompletionOptions): GeminiRequest {
    const contents: GeminiContent[] = []
    let systemPrompt = options.systemPrompt || ''

    // Process messages
    for (const msg of messages) {
      if (msg.role === 'system') {
        systemPrompt = msg.content + (systemPrompt ? '\n\n' + systemPrompt : '')
      } else {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })
      }
    }

    // Ensure at least one user message
    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: 'Hello' }],
      })
    }

    const request: GeminiRequest = {
      contents,
      generationConfig: {
        temperature: options.temperature ?? this.config.defaultTemperature,
        maxOutputTokens: options.maxTokens ?? this.config.defaultMaxTokens,
        stopSequences: options.stopSequences,
      },
    }

    // Add system instruction if present
    if (systemPrompt) {
      request.systemInstruction = {
        parts: [{ text: systemPrompt }],
      }
    }

    return request
  }

  private parseResponse(
    response: GeminiResponse,
    model: string,
    latencyMs: number
  ): AICompletionResult {
    const candidate = response.candidates?.[0]

    if (!candidate) {
      throw new Error('No response from Gemini')
    }

    const content = candidate.content.parts.map(p => p.text).join('')
    const finishReason = this.mapFinishReason(candidate.finishReason)

    return {
      content,
      model,
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount || 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata?.totalTokenCount || 0,
      },
      finishReason,
      latencyMs,
      raw: response,
    }
  }

  private mapFinishReason(reason: string): AICompletionResult['finishReason'] {
    switch (reason) {
      case 'STOP':
        return 'complete'
      case 'MAX_TOKENS':
        return 'max_tokens'
      case 'STOP_SEQUENCE':
        return 'stop_sequence'
      default:
        return 'complete'
    }
  }
}

/**
 * Create Gemini provider from environment variables
 */
export function createGeminiProvider(): GeminiProvider | null {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    console.warn('[GeminiProvider] GEMINI_API_KEY not found in environment')
    return null
  }

  return new GeminiProvider({
    apiKey,
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  })
}

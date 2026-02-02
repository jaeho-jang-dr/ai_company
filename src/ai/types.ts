/**
 * AI Company - AI Provider Types
 * AI 프로바이더 인터페이스 및 타입 정의
 */

// ============================================================
// PROVIDER TYPES
// ============================================================

export type AIProviderType = 'gemini' | 'claude' | 'gpt' | 'grok' | 'local' | 'mock'

// ============================================================
// MESSAGE TYPES
// ============================================================

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// ============================================================
// COMPLETION TYPES
// ============================================================

export interface AICompletionOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  stopSequences?: string[]
  systemPrompt?: string
}

export interface AITokenUsage {
  inputTokens: number
  outputTokens: number
  totalTokens: number
}

export interface AICompletionResult {
  content: string
  model: string
  usage: AITokenUsage
  finishReason: 'complete' | 'max_tokens' | 'stop_sequence' | 'error'
  latencyMs: number
  raw?: unknown
}

// ============================================================
// PROVIDER CONFIG
// ============================================================

export interface AIProviderConfig {
  apiKey?: string
  baseUrl?: string
  defaultModel?: string
  defaultTemperature?: number
  defaultMaxTokens?: number
  timeout?: number
  retryAttempts?: number
}

export interface GeminiConfig extends AIProviderConfig {
  apiKey: string
  model?: string // gemini-1.5-pro, gemini-1.5-flash, gemini-pro
}

export interface ClaudeConfig extends AIProviderConfig {
  apiKey: string
  model?: string // claude-3-opus, claude-3-sonnet, claude-3-haiku
}

// ============================================================
// PROVIDER INTERFACE
// ============================================================

export interface AIProvider {
  readonly name: AIProviderType
  readonly isConfigured: boolean

  /**
   * Send a completion request
   */
  complete(
    messages: AIMessage[],
    options?: AICompletionOptions
  ): Promise<AICompletionResult>

  /**
   * Check if the provider is available
   */
  healthCheck(): Promise<boolean>
}

// ============================================================
// CALL LOGGING
// ============================================================

export interface AICallLog {
  id: string
  timestamp: Date
  provider: AIProviderType
  model: string
  agentId?: string
  taskId?: string

  request: {
    messagesCount: number
    systemPrompt?: string
    options: AICompletionOptions
  }

  response?: {
    contentLength: number
    usage: AITokenUsage
    latencyMs: number
    finishReason: string
  }

  error?: string
  success: boolean
}

// ============================================================
// MANAGER TYPES
// ============================================================

export interface AIManagerConfig {
  primaryProvider: AIProviderType
  fallbackProviders?: AIProviderType[]
  enableLogging?: boolean
  logRetention?: number
}

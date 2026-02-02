/**
 * AI Company - Message Processor
 * 메시지 처리 미들웨어 파이프라인
 */

import { EventEmitter } from 'events'
import { Message, MessageType, TaskPriority } from '../types'

export type MessageMiddleware = (
  message: Message,
  next: () => Promise<void>
) => Promise<void>

export interface ProcessingResult {
  success: boolean
  message: Message
  processingTime: number
  middlewaresApplied: string[]
  errors?: string[]
}

export class MessageProcessor extends EventEmitter {
  private middlewares: Map<string, MessageMiddleware> = new Map()
  private middlewareOrder: string[] = []
  private isProcessing: boolean = false
  private messageQueue: Message[] = []

  constructor() {
    super()
  }

  // ============================================================
  // MIDDLEWARE MANAGEMENT
  // ============================================================

  /**
   * Register a middleware
   */
  use(name: string, middleware: MessageMiddleware): this {
    this.middlewares.set(name, middleware)
    if (!this.middlewareOrder.includes(name)) {
      this.middlewareOrder.push(name)
    }
    return this
  }

  /**
   * Remove a middleware
   */
  remove(name: string): boolean {
    const deleted = this.middlewares.delete(name)
    if (deleted) {
      this.middlewareOrder = this.middlewareOrder.filter(n => n !== name)
    }
    return deleted
  }

  /**
   * Insert middleware at specific position
   */
  insertAt(position: number, name: string, middleware: MessageMiddleware): this {
    this.middlewares.set(name, middleware)
    this.middlewareOrder.splice(position, 0, name)
    return this
  }

  /**
   * Get list of registered middlewares
   */
  getMiddlewares(): string[] {
    return [...this.middlewareOrder]
  }

  // ============================================================
  // MESSAGE PROCESSING
  // ============================================================

  /**
   * Process a single message through the middleware pipeline
   */
  async process(message: Message): Promise<ProcessingResult> {
    const startTime = Date.now()
    const appliedMiddlewares: string[] = []
    const errors: string[] = []

    let index = 0
    const middlewareNames = [...this.middlewareOrder]

    const next = async (): Promise<void> => {
      if (index >= middlewareNames.length) return

      const middlewareName = middlewareNames[index++]
      const middleware = this.middlewares.get(middlewareName)

      if (middleware) {
        try {
          await middleware(message, next)
          appliedMiddlewares.push(middlewareName)
        } catch (error) {
          errors.push(`${middlewareName}: ${String(error)}`)
          // Continue to next middleware despite error
          await next()
        }
      }
    }

    try {
      await next()

      this.emit('message-processed', { message, appliedMiddlewares })

      return {
        success: errors.length === 0,
        message,
        processingTime: Date.now() - startTime,
        middlewaresApplied: appliedMiddlewares,
        errors: errors.length > 0 ? errors : undefined,
      }
    } catch (error) {
      return {
        success: false,
        message,
        processingTime: Date.now() - startTime,
        middlewaresApplied: appliedMiddlewares,
        errors: [...errors, String(error)],
      }
    }
  }

  /**
   * Process multiple messages
   */
  async processAll(messages: Message[]): Promise<ProcessingResult[]> {
    return Promise.all(messages.map(m => this.process(m)))
  }

  /**
   * Queue a message for processing
   */
  queue(message: Message): void {
    this.messageQueue.push(message)
    this.emit('message-queued', { message, queueLength: this.messageQueue.length })
  }

  /**
   * Process all queued messages
   */
  async processQueue(): Promise<ProcessingResult[]> {
    if (this.isProcessing) {
      throw new Error('Already processing queue')
    }

    this.isProcessing = true
    const results: ProcessingResult[] = []

    try {
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift()!
        const result = await this.process(message)
        results.push(result)
      }
    } finally {
      this.isProcessing = false
    }

    return results
  }

  /**
   * Get queue status
   */
  getQueueStatus(): { length: number; isProcessing: boolean } {
    return {
      length: this.messageQueue.length,
      isProcessing: this.isProcessing,
    }
  }
}

// ============================================================
// BUILT-IN MIDDLEWARES
// ============================================================

/**
 * Validation middleware - validates message structure
 */
export const validationMiddleware: MessageMiddleware = async (message, next) => {
  if (!message.id) throw new Error('Message must have an id')
  if (!message.type) throw new Error('Message must have a type')
  if (!message.from) throw new Error('Message must have a sender')
  if (!message.to) throw new Error('Message must have a recipient')
  await next()
}

/**
 * Timestamp middleware - ensures timestamp is set
 */
export const timestampMiddleware: MessageMiddleware = async (message, next) => {
  if (!message.timestamp) {
    message.timestamp = new Date()
  }
  await next()
}

/**
 * Priority middleware - sets default priority if not set
 */
export const priorityMiddleware: MessageMiddleware = async (message, next) => {
  if (!message.priority) {
    message.priority = 'normal'
  }
  await next()
}

/**
 * Logging middleware - logs message processing
 */
export const loggingMiddleware: MessageMiddleware = async (message, next) => {
  console.log(`[MessageProcessor] Processing: ${message.type} from ${message.from}`)
  await next()
  console.log(`[MessageProcessor] Processed: ${message.id}`)
}

/**
 * Rate limiting middleware factory
 */
export function createRateLimitMiddleware(
  maxMessages: number,
  windowMs: number
): MessageMiddleware {
  const messageTimestamps: Map<string, number[]> = new Map()

  return async (message, next) => {
    const senderId = message.from
    const now = Date.now()
    const timestamps = messageTimestamps.get(senderId) || []

    // Remove timestamps outside the window
    const validTimestamps = timestamps.filter(t => now - t < windowMs)

    if (validTimestamps.length >= maxMessages) {
      throw new Error(`Rate limit exceeded for sender: ${senderId}`)
    }

    validTimestamps.push(now)
    messageTimestamps.set(senderId, validTimestamps)

    await next()
  }
}

/**
 * Create a default message processor with common middlewares
 */
export function createDefaultProcessor(): MessageProcessor {
  const processor = new MessageProcessor()

  processor
    .use('validation', validationMiddleware)
    .use('timestamp', timestampMiddleware)
    .use('priority', priorityMiddleware)

  return processor
}

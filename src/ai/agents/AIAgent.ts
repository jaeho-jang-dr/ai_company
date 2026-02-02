/**
 * AI Company - AI Agent
 * AI 프로바이더와 연동된 에이전트 클래스
 */

import { EventEmitter } from 'events'
import { v4 as uuidv4 } from 'uuid'
import {
  Agent,
  AgentRole,
  AgentCapability,
  AgentStatus,
  AgentMetrics,
  Task,
  DepartmentId,
  TeamId,
  AIProvider as AIProviderTypeFromMain,
} from '../../types'
import { AIProviderManager } from '../AIProviderManager'
import { AIMessage, AICompletionOptions, AIProviderType } from '../types'
import { PromptBuilder, buildAgentTaskPrompt } from '../prompts'

// ============================================================
// AI AGENT TYPES
// ============================================================

export interface AIAgentTaskResult {
  taskId: string
  agentId: string
  status: 'completed' | 'failed'
  output: string
  error?: string
  metrics?: {
    startTime: Date
    endTime: Date
    duration: number
    tokensUsed?: number
  }
}

export interface AIAgentConfig {
  id?: string
  name: string
  nameKr?: string
  role: AgentRole
  department: DepartmentId
  team: TeamId
  capabilities: AgentCapability[]
  skills?: string[]
  providerManager: AIProviderManager
  preferredProvider?: AIProviderType
  defaultTemperature?: number
  defaultMaxTokens?: number
}

// ============================================================
// AI AGENT CLASS
// ============================================================

export class AIAgent extends EventEmitter implements Agent {
  // Agent interface fields
  readonly id: string
  readonly name: string
  readonly nameKr: string
  readonly role: AgentRole
  readonly department: DepartmentId
  readonly team: TeamId
  readonly capabilities: AgentCapability[]
  readonly skills: string[]
  readonly provider: AIProviderTypeFromMain

  private _status: AgentStatus = 'idle'
  private _currentTaskId: string | undefined = undefined
  private _currentTask: Task | null = null
  private _lastActive: Date = new Date()
  private _metrics: AgentMetrics = {
    tasksCompleted: 0,
    tasksInProgress: 0,
    tasksFailed: 0,
    avgCompletionTime: 0,
    successRate: 1,
  }

  private providerManager: AIProviderManager
  private preferredProvider?: AIProviderType
  private defaultTemperature: number
  private defaultMaxTokens: number
  private conversationHistory: AIMessage[] = []
  private taskHistory: AIAgentTaskResult[] = []

  // Internal stats
  private internalStats = {
    totalTokensUsed: 0,
    averageLatency: 0,
  }

  constructor(config: AIAgentConfig) {
    super()

    this.id = config.id || `agent-${uuidv4()}`
    this.name = config.name
    this.nameKr = config.nameKr || config.name
    this.role = config.role
    this.department = config.department
    this.team = config.team
    this.capabilities = config.capabilities
    this.skills = config.skills || []
    this.provider = 'gemini' // Default to gemini as per design
    this.providerManager = config.providerManager
    this.preferredProvider = config.preferredProvider
    this.defaultTemperature = config.defaultTemperature ?? 0.7
    this.defaultMaxTokens = config.defaultMaxTokens ?? 4096
  }

  // ============================================================
  // GETTERS (Agent interface)
  // ============================================================

  get status(): AgentStatus {
    return this._status
  }

  get currentTask(): string | undefined {
    return this._currentTaskId
  }

  get lastActive(): Date | undefined {
    return this._lastActive
  }

  get metrics(): AgentMetrics {
    return { ...this._metrics }
  }

  // ============================================================
  // ADDITIONAL GETTERS
  // ============================================================

  get workload(): number {
    return this._status === 'working' ? 100 : 0
  }

  get isAvailable(): boolean {
    return this._status === 'idle'
  }

  getCurrentTaskObject(): Task | null {
    return this._currentTask
  }

  // ============================================================
  // TASK EXECUTION
  // ============================================================

  /**
   * Execute a task
   */
  async executeTask(task: Task): Promise<AIAgentTaskResult> {
    if (!this.isAvailable) {
      return this.createErrorResult(task, 'Agent is not available')
    }

    // Update status
    this._status = 'working'
    this._currentTaskId = task.id
    this._currentTask = task
    this._metrics.tasksInProgress = 1
    this._lastActive = new Date()

    this.emit('task:start', { agentId: this.id, task })

    try {
      // Build prompt for task
      const systemPrompt = buildAgentTaskPrompt(
        this.role,
        this.department,
        task,
        {
          outputFormat: this.getOutputFormat(task),
        }
      )

      // Create user message with task details
      const userMessage = this.buildTaskMessage(task)

      // Add to conversation history
      this.conversationHistory.push(
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      )

      // Call AI
      const aiResult = await this.providerManager.complete(
        this.conversationHistory,
        {
          agentId: this.id,
          taskId: task.id,
          preferredProvider: this.preferredProvider,
          temperature: this.defaultTemperature,
          maxTokens: this.defaultMaxTokens,
        }
      )

      // Add AI response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: aiResult.content,
      })

      // Create result
      const result: AIAgentTaskResult = {
        taskId: task.id,
        agentId: this.id,
        status: 'completed',
        output: aiResult.content,
        metrics: {
          startTime: this._lastActive,
          endTime: new Date(),
          duration: aiResult.latencyMs,
          tokensUsed: aiResult.usage.totalTokens,
        },
      }

      // Update metrics
      this._metrics.tasksCompleted++
      this._metrics.tasksInProgress = 0
      this.internalStats.totalTokensUsed += aiResult.usage.totalTokens
      this.updateAverageLatency(aiResult.latencyMs)
      this.updateSuccessRate()

      this.taskHistory.push(result)
      this.emit('task:complete', { agentId: this.id, task, result })

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const result = this.createErrorResult(task, errorMessage)

      this._metrics.tasksFailed++
      this._metrics.tasksInProgress = 0
      this.updateSuccessRate()
      this.taskHistory.push(result)
      this.emit('task:error', { agentId: this.id, task, error })

      return result
    } finally {
      // Reset status
      this._status = 'idle'
      this._currentTaskId = undefined
      this._currentTask = null
    }
  }

  /**
   * Chat with the agent (for interactive conversations)
   */
  async chat(message: string, context?: string): Promise<string> {
    this._lastActive = new Date()

    // Build system prompt if not already in history
    if (this.conversationHistory.length === 0) {
      const systemPrompt = new PromptBuilder()
        .withAgent(this.role, this.department)
        .withCustom('대화 모드', '사용자와의 대화에 응답합니다. 친절하고 전문적으로 답변합니다.')
        .build()

      this.conversationHistory.push({ role: 'system', content: systemPrompt })
    }

    // Add context if provided
    let userContent = message
    if (context) {
      userContent = `컨텍스트: ${context}\n\n질문: ${message}`
    }

    this.conversationHistory.push({ role: 'user', content: userContent })

    // Call AI
    const aiResult = await this.providerManager.complete(
      this.conversationHistory,
      {
        agentId: this.id,
        preferredProvider: this.preferredProvider,
        temperature: this.defaultTemperature,
        maxTokens: this.defaultMaxTokens,
      }
    )

    // Add to history
    this.conversationHistory.push({
      role: 'assistant',
      content: aiResult.content,
    })

    // Update stats
    this.internalStats.totalTokensUsed += aiResult.usage.totalTokens

    return aiResult.content
  }

  /**
   * Analyze something
   */
  async analyze(subject: string, type: 'code' | 'architecture' | 'performance' | 'security' | 'general' = 'general'): Promise<string> {
    this._lastActive = new Date()

    const systemPrompt = new PromptBuilder()
      .withAgent(this.role, this.department)
      .withCustom('분석 유형', type)
      .withOutputFormat('analysis')
      .build()

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `다음을 분석해주세요:\n\n${subject}` },
    ]

    const aiResult = await this.providerManager.complete(messages, {
      agentId: this.id,
      preferredProvider: this.preferredProvider,
      temperature: 0.3, // Lower temperature for analysis
      maxTokens: this.defaultMaxTokens,
    })

    this.internalStats.totalTokensUsed += aiResult.usage.totalTokens

    return aiResult.content
  }

  /**
   * Review something
   */
  async review(subject: string, criteria: string[]): Promise<string> {
    this._lastActive = new Date()

    const systemPrompt = new PromptBuilder()
      .withAgent(this.role, this.department)
      .withCustom('리뷰 기준', criteria.map((c, i) => `${i + 1}. ${c}`).join('\n'))
      .withOutputFormat('review')
      .build()

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `다음을 리뷰해주세요:\n\n${subject}` },
    ]

    const aiResult = await this.providerManager.complete(messages, {
      agentId: this.id,
      preferredProvider: this.preferredProvider,
      temperature: 0.3,
      maxTokens: this.defaultMaxTokens,
    })

    this.internalStats.totalTokensUsed += aiResult.usage.totalTokens

    return aiResult.content
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================

  /**
   * Build task message
   */
  private buildTaskMessage(task: Task): string {
    const parts = [
      `## 태스크 실행 요청`,
      ``,
      `**제목**: ${task.title}`,
      `**유형**: ${task.type}`,
      `**우선순위**: ${task.priority}`,
    ]

    if (task.description) {
      parts.push(``, `### 설명`, task.description)
    }

    if (task.requirements && task.requirements.length > 0) {
      parts.push(``, `### 요구사항`)
      task.requirements.forEach((req: string, i: number) => {
        parts.push(`${i + 1}. ${req}`)
      })
    }

    if (task.acceptanceCriteria && task.acceptanceCriteria.length > 0) {
      parts.push(``, `### 인수 기준`)
      task.acceptanceCriteria.forEach((criteria: string, i: number) => {
        parts.push(`${i + 1}. ${criteria}`)
      })
    }

    if (task.context) {
      parts.push(``, `### 컨텍스트`, JSON.stringify(task.context, null, 2))
    }

    parts.push(``, `이 태스크를 수행하고 결과를 보고해주세요.`)

    return parts.join('\n')
  }

  /**
   * Get output format based on task type
   */
  private getOutputFormat(task: Task): 'analysis' | 'implementation' | 'review' | 'report' {
    switch (task.type) {
      case 'market-research':
      case 'code-analysis':
      case 'security-audit':
      case 'performance-analysis':
        return 'analysis'
      case 'code-review':
        return 'review'
      case 'feature-development':
      case 'bug-fix':
      case 'refactoring':
        return 'implementation'
      default:
        return 'report'
    }
  }

  /**
   * Create error result
   */
  private createErrorResult(task: Task, error: string): AIAgentTaskResult {
    return {
      taskId: task.id,
      agentId: this.id,
      status: 'failed',
      output: '',
      error,
      metrics: {
        startTime: this._lastActive,
        endTime: new Date(),
        duration: 0,
      },
    }
  }

  /**
   * Update average latency
   */
  private updateAverageLatency(newLatency: number): void {
    const totalTasks = this._metrics.tasksCompleted + this._metrics.tasksFailed
    if (totalTasks === 0) {
      this.internalStats.averageLatency = newLatency
    } else {
      this.internalStats.averageLatency =
        (this.internalStats.averageLatency * (totalTasks - 1) + newLatency) / totalTasks
    }
    this._metrics.avgCompletionTime = this.internalStats.averageLatency
  }

  /**
   * Update success rate
   */
  private updateSuccessRate(): void {
    const total = this._metrics.tasksCompleted + this._metrics.tasksFailed
    if (total === 0) {
      this._metrics.successRate = 1
    } else {
      this._metrics.successRate = this._metrics.tasksCompleted / total
    }
  }

  // ============================================================
  // PUBLIC UTILITIES
  // ============================================================

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = []
    this.emit('history:cleared', this.id)
  }

  /**
   * Get conversation history
   */
  getHistory(): AIMessage[] {
    return [...this.conversationHistory]
  }

  /**
   * Get task history
   */
  getTaskHistory(): AIAgentTaskResult[] {
    return [...this.taskHistory]
  }

  /**
   * Get stats
   */
  getStats(): { tasksCompleted: number; tasksFailed: number; totalTokensUsed: number; averageLatency: number } {
    return {
      tasksCompleted: this._metrics.tasksCompleted,
      tasksFailed: this._metrics.tasksFailed,
      totalTokensUsed: this.internalStats.totalTokensUsed,
      averageLatency: this.internalStats.averageLatency,
    }
  }

  /**
   * Check if agent has capability
   */
  hasCapability(capability: AgentCapability): boolean {
    return this.capabilities.includes(capability)
  }

  /**
   * Check if agent has skill
   */
  hasSkill(skill: string): boolean {
    return this.skills.some(s =>
      s.toLowerCase().includes(skill.toLowerCase())
    )
  }

  /**
   * Get success rate
   */
  getSuccessRate(): number {
    return this._metrics.successRate
  }

  /**
   * String representation
   */
  override toString(): string {
    return `AIAgent(${this.id}, ${this.name}, ${this.role}, ${this._status})`
  }
}

// ============================================================
// FACTORY FUNCTION
// ============================================================

/**
 * Create AI Agent from config
 */
export function createAIAgent(config: AIAgentConfig): AIAgent {
  return new AIAgent(config)
}

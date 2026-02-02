/**
 * AI Company - Base Agent Class
 * 모든 에이전트의 기본 클래스
 */

import { EventEmitter } from 'events'
import { v4 as uuidv4 } from 'uuid'
import {
  Agent,
  AgentConfig,
  AgentStatus,
  AgentMetrics,
  Task,
  Message,
  AIProvider,
} from '../types'

export abstract class BaseAgent extends EventEmitter implements Agent {
  // Config properties
  readonly id: string
  readonly role: AgentConfig['role']
  readonly name: string
  readonly nameKr: string
  readonly team: AgentConfig['team']
  readonly department: AgentConfig['department']
  readonly provider: AIProvider
  readonly model?: string
  readonly capabilities: AgentConfig['capabilities']
  readonly skills: string[]
  readonly systemPrompt?: string
  readonly temperature?: number
  readonly maxTokens?: number
  readonly tools?: string[]

  // Runtime properties
  status: AgentStatus = 'idle'
  currentTask?: string
  lastActive?: Date
  metrics: AgentMetrics = {
    tasksCompleted: 0,
    tasksInProgress: 0,
    tasksFailed: 0,
    avgCompletionTime: 0,
    successRate: 100,
  }

  // Internal state
  protected taskHistory: Array<{ taskId: string; completedAt: Date; duration: number }> = []
  protected messageQueue: Message[] = []

  constructor(config: AgentConfig) {
    super()
    this.id = config.id || uuidv4()
    this.role = config.role
    this.name = config.name
    this.nameKr = config.nameKr
    this.team = config.team
    this.department = config.department
    this.provider = config.provider
    this.model = config.model
    this.capabilities = config.capabilities
    this.skills = config.skills
    this.systemPrompt = config.systemPrompt
    this.temperature = config.temperature
    this.maxTokens = config.maxTokens
    this.tools = config.tools
  }

  // ============================================================
  // ABSTRACT METHODS - Must be implemented by subclasses
  // ============================================================

  /**
   * Execute a task
   */
  abstract execute(task: Task): Promise<Task>

  /**
   * Check if agent can handle a specific task
   */
  abstract canHandle(task: Task): boolean

  /**
   * Process an incoming message
   */
  abstract processMessage(message: Message): Promise<Message | null>

  // ============================================================
  // STATUS MANAGEMENT
  // ============================================================

  setStatus(status: AgentStatus): void {
    const previousStatus = this.status
    this.status = status
    this.lastActive = new Date()
    this.emit('status-changed', { agent: this.id, from: previousStatus, to: status })
  }

  isAvailable(): boolean {
    return this.status === 'idle'
  }

  isBusy(): boolean {
    return this.status === 'working' || this.status === 'waiting'
  }

  // ============================================================
  // TASK MANAGEMENT
  // ============================================================

  async assignTask(task: Task): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error(`Agent ${this.id} is not available (status: ${this.status})`)
    }

    this.currentTask = task.id
    this.setStatus('working')
    this.metrics.tasksInProgress++

    this.emit('task-assigned', { agent: this.id, task: task.id })
  }

  async completeTask(task: Task, success: boolean): Promise<void> {
    const startTime = task.startedAt?.getTime() || Date.now()
    const duration = Date.now() - startTime

    if (success) {
      this.metrics.tasksCompleted++
      this.taskHistory.push({
        taskId: task.id,
        completedAt: new Date(),
        duration,
      })
      this.updateAvgCompletionTime(duration)
    } else {
      this.metrics.tasksFailed++
    }

    this.metrics.tasksInProgress--
    this.updateSuccessRate()
    this.currentTask = undefined
    this.setStatus('idle')

    this.emit('task-completed', {
      agent: this.id,
      task: task.id,
      success,
      duration
    })
  }

  protected updateAvgCompletionTime(newDuration: number): void {
    const total = this.metrics.avgCompletionTime * (this.metrics.tasksCompleted - 1) + newDuration
    this.metrics.avgCompletionTime = total / this.metrics.tasksCompleted
  }

  protected updateSuccessRate(): void {
    const total = this.metrics.tasksCompleted + this.metrics.tasksFailed
    if (total > 0) {
      this.metrics.successRate = (this.metrics.tasksCompleted / total) * 100
    }
  }

  // ============================================================
  // MESSAGE HANDLING
  // ============================================================

  async receiveMessage(message: Message): Promise<void> {
    this.messageQueue.push(message)
    this.emit('message-received', { agent: this.id, message: message.id })

    if (message.requiresResponse) {
      const response = await this.processMessage(message)
      if (response) {
        this.emit('message-sent', { agent: this.id, message: response })
      }
    }
  }

  getMessageQueue(): Message[] {
    return [...this.messageQueue]
  }

  clearMessageQueue(): void {
    this.messageQueue = []
  }

  // ============================================================
  // CAPABILITY CHECKING
  // ============================================================

  hasCapability(capability: AgentConfig['capabilities'][number]): boolean {
    return this.capabilities.includes(capability)
  }

  hasSkill(skill: string): boolean {
    return this.skills.includes(skill)
  }

  getCapabilityScore(requiredCapabilities: AgentConfig['capabilities']): number {
    const matched = requiredCapabilities.filter(c => this.hasCapability(c))
    return matched.length / requiredCapabilities.length
  }

  // ============================================================
  // INFO & SERIALIZATION
  // ============================================================

  getInfo(): AgentConfig & { status: AgentStatus; metrics: AgentMetrics } {
    return {
      id: this.id,
      role: this.role,
      name: this.name,
      nameKr: this.nameKr,
      team: this.team,
      department: this.department,
      provider: this.provider,
      model: this.model,
      capabilities: this.capabilities,
      skills: this.skills,
      systemPrompt: this.systemPrompt,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
      tools: this.tools,
      status: this.status,
      metrics: { ...this.metrics },
    }
  }

  toJSON(): object {
    return this.getInfo()
  }

  override toString(): string {
    return `[Agent ${this.role}] ${this.name} (${this.nameKr}) - ${this.status}`
  }
}

// ============================================================
// GENERIC AGENT IMPLEMENTATION
// ============================================================

export class GenericAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super(config)
  }

  async execute(task: Task): Promise<Task> {
    await this.assignTask(task)

    try {
      // Simulate task execution
      task.status = 'in_progress'
      task.startedAt = new Date()

      this.emit('task-started', { agent: this.id, task: task.id })

      // In a real implementation, this would call the AI provider
      // For now, we simulate processing
      await this.simulateProcessing(task)

      task.status = 'completed'
      task.completedAt = new Date()
      task.output = { result: 'Task completed successfully', agent: this.id }

      await this.completeTask(task, true)
      return task

    } catch (error) {
      task.status = 'failed'
      task.output = { error: String(error), agent: this.id }
      await this.completeTask(task, false)
      throw error
    }
  }

  canHandle(task: Task): boolean {
    // Check if agent has required capabilities for task type
    const taskCapabilityMap: Record<string, AgentConfig['capabilities']> = {
      'feature-development': ['coding'],
      'bug-fix': ['coding', 'analysis'],
      'code-review': ['review', 'coding'],
      'testing': ['testing'],
      'deployment': ['deployment'],
      'ui-design': ['design'],
      'documentation': ['writing'],
      'security-audit': ['security', 'analysis'],
      'code-analysis': ['analysis', 'coding'],
    }

    const required = taskCapabilityMap[task.type] || []
    return this.getCapabilityScore(required) >= 0.5
  }

  async processMessage(message: Message): Promise<Message | null> {
    // Simple message processing - just acknowledge
    if (message.requiresResponse) {
      return {
        id: uuidv4(),
        type: 'direct',
        from: this.id,
        to: message.from,
        subject: `Re: ${message.subject}`,
        content: `Acknowledged: ${message.content}`,
        priority: message.priority,
        requiresResponse: false,
        timestamp: new Date(),
      }
    }
    return null
  }

  protected async simulateProcessing(task: Task): Promise<void> {
    // Simulate work based on task priority
    const delayMap = {
      critical: 100,
      high: 200,
      normal: 300,
      low: 500,
    }
    const delay = delayMap[task.priority] || 300
    await new Promise(resolve => setTimeout(resolve, delay))
  }
}

// ============================================================
// AGENT FACTORY
// ============================================================

export function createAgent(config: AgentConfig): BaseAgent {
  return new GenericAgent(config)
}

export function createAgentsFromConfigs(configs: AgentConfig[]): BaseAgent[] {
  return configs.map(config => createAgent(config))
}

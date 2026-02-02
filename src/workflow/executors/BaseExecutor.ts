/**
 * AI Company - Base Executor
 * 워크플로우 실행기의 기본 클래스
 */

import { EventEmitter } from 'events'
import { v4 as uuidv4 } from 'uuid'
import { Task, TaskStatus, Workflow, WorkflowStage, WorkflowConfig, TeamId } from '../../types'

export type ExecutorStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed'

export interface ExecutionContext {
  workflowId: string
  executionId: string
  startedAt: Date
  completedAt?: Date
  status: ExecutorStatus
  currentStage?: string
  completedStages: string[]
  failedStages: string[]
  results: Map<string, unknown>
  errors: Map<string, Error>
}

export interface StageResult {
  stageId: string
  success: boolean
  output?: unknown
  error?: Error
  duration: number
  tasks: TaskResult[]
}

export interface TaskResult {
  taskId: string
  success: boolean
  output?: unknown
  error?: Error
  assignedTo?: string
  duration: number
}

export interface ExecutorOptions {
  timeout?: number
  retryOnFailure?: boolean
  maxRetries?: number
  onStageStart?: (stageId: string) => void
  onStageComplete?: (stageId: string, result: StageResult) => void
  onError?: (error: Error, stageId?: string) => void
}

export type TaskExecutor = (task: Task, teams: TeamId[]) => Promise<Task>

export abstract class BaseExecutor extends EventEmitter {
  protected workflow: Workflow
  protected context: ExecutionContext
  protected options: ExecutorOptions
  protected taskExecutor: TaskExecutor
  protected aborted: boolean = false

  constructor(
    workflow: Workflow,
    taskExecutor: TaskExecutor,
    options: ExecutorOptions = {}
  ) {
    super()
    this.workflow = workflow
    this.taskExecutor = taskExecutor
    this.options = {
      timeout: options.timeout || workflow.config.timeout,
      retryOnFailure: options.retryOnFailure ?? true,
      maxRetries: options.maxRetries ?? workflow.config.retryPolicy.maxAttempts,
      ...options,
    }
    this.context = this.createContext()
  }

  // ============================================================
  // ABSTRACT METHODS
  // ============================================================

  /**
   * Execute the workflow - must be implemented by subclasses
   */
  abstract execute(input?: unknown): Promise<ExecutionContext>

  /**
   * Execute a single stage - must be implemented by subclasses
   */
  protected abstract executeStage(stage: WorkflowStage, input?: unknown): Promise<StageResult>

  // ============================================================
  // CONTEXT MANAGEMENT
  // ============================================================

  protected createContext(): ExecutionContext {
    return {
      workflowId: this.workflow.id,
      executionId: uuidv4(),
      startedAt: new Date(),
      status: 'idle',
      completedStages: [],
      failedStages: [],
      results: new Map(),
      errors: new Map(),
    }
  }

  protected updateContext(updates: Partial<ExecutionContext>): void {
    Object.assign(this.context, updates)
  }

  getContext(): ExecutionContext {
    return { ...this.context }
  }

  // ============================================================
  // STATUS MANAGEMENT
  // ============================================================

  protected setStatus(status: ExecutorStatus): void {
    this.context.status = status
    this.emit('status-changed', { executionId: this.context.executionId, status })
  }

  getStatus(): ExecutorStatus {
    return this.context.status
  }

  isRunning(): boolean {
    return this.context.status === 'running'
  }

  // ============================================================
  // CONTROL METHODS
  // ============================================================

  pause(): void {
    if (this.context.status === 'running') {
      this.setStatus('paused')
      this.emit('paused', { executionId: this.context.executionId })
    }
  }

  resume(): void {
    if (this.context.status === 'paused') {
      this.setStatus('running')
      this.emit('resumed', { executionId: this.context.executionId })
    }
  }

  abort(): void {
    this.aborted = true
    this.setStatus('failed')
    this.emit('aborted', { executionId: this.context.executionId })
  }

  // ============================================================
  // STAGE EXECUTION HELPERS
  // ============================================================

  protected async executeWithRetry(
    stage: WorkflowStage,
    input?: unknown
  ): Promise<StageResult> {
    let lastError: Error | undefined
    const maxRetries = this.options.maxRetries || 1

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      if (this.aborted) {
        throw new Error('Execution aborted')
      }

      try {
        this.emit('stage-attempt', { stageId: stage.id, attempt, maxRetries })
        const result = await this.executeStage(stage, input)

        if (result.success) {
          return result
        }

        lastError = result.error
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
      }

      if (attempt < maxRetries && this.options.retryOnFailure) {
        const backoff = this.calculateBackoff(attempt)
        await this.delay(backoff)
      }
    }

    return {
      stageId: stage.id,
      success: false,
      error: lastError,
      duration: 0,
      tasks: [],
    }
  }

  protected calculateBackoff(attempt: number): number {
    const { backoffMs, exponential } = this.workflow.config.retryPolicy
    if (exponential) {
      return backoffMs * Math.pow(2, attempt - 1)
    }
    return backoffMs
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // ============================================================
  // TASK HELPERS
  // ============================================================

  protected createTaskFromStage(stage: WorkflowStage, taskType: string): Task {
    return {
      id: uuidv4(),
      type: taskType as Task['type'],
      title: `${stage.name} - ${taskType}`,
      description: `Task for stage: ${stage.name}`,
      status: 'pending',
      priority: 'normal',
      assignedTeam: stage.teams[0],
      createdAt: new Date(),
    }
  }

  protected async executeTask(task: Task, teams: TeamId[]): Promise<TaskResult> {
    const startTime = Date.now()

    try {
      task.startedAt = new Date()
      const completedTask = await this.taskExecutor(task, teams)

      return {
        taskId: task.id,
        success: completedTask.status === 'completed',
        output: completedTask.output,
        assignedTo: completedTask.assignedTo?.[0],
        duration: Date.now() - startTime,
      }
    } catch (error) {
      return {
        taskId: task.id,
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        duration: Date.now() - startTime,
      }
    }
  }

  // ============================================================
  // RESULT HANDLING
  // ============================================================

  protected handleStageComplete(stage: WorkflowStage, result: StageResult): void {
    if (result.success) {
      this.context.completedStages.push(stage.id)
      this.context.results.set(stage.id, result.output)
    } else {
      this.context.failedStages.push(stage.id)
      if (result.error) {
        this.context.errors.set(stage.id, result.error)
      }
    }

    this.options.onStageComplete?.(stage.id, result)
    this.emit('stage-completed', { stageId: stage.id, result })
  }

  protected handleError(error: Error, stageId?: string): void {
    this.options.onError?.(error, stageId)
    this.emit('error', { error, stageId })
  }

  // ============================================================
  // PROGRESS
  // ============================================================

  getProgress(): { completed: number; total: number; percentage: number } {
    const total = this.workflow.stages.length
    const completed = this.context.completedStages.length
    return {
      completed,
      total,
      percentage: (completed / total) * 100,
    }
  }
}

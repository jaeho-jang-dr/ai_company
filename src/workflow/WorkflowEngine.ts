/**
 * AI Company - Workflow Engine
 * 워크플로우 실행 및 관리 엔진
 */

import { EventEmitter } from 'events'
import { v4 as uuidv4 } from 'uuid'
import { Workflow, WorkflowPattern, Task, TeamId } from '../types'
import { DependencyResolver } from './DependencyResolver'
import {
  BaseExecutor,
  ExecutionContext,
  ExecutorOptions,
  TaskExecutor,
} from './executors/BaseExecutor'
import { SequentialExecutor } from './executors/SequentialExecutor'
import { ParallelExecutor } from './executors/ParallelExecutor'
import { PipelineExecutor } from './executors/PipelineExecutor'
import { AgileSprintExecutor } from './executors/AgileSprintExecutor'
import { KanbanExecutor } from './executors/KanbanExecutor'
import { SwarmExecutor, SwarmConfig } from './executors/SwarmExecutor'

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt?: Date
  completedAt?: Date
  context?: ExecutionContext
  error?: Error
}

export interface WorkflowEngineConfig {
  defaultExecutorOptions?: ExecutorOptions
  maxConcurrentExecutions?: number
  enableEventLogging?: boolean
}

export class WorkflowEngine extends EventEmitter {
  private workflows: Map<string, Workflow> = new Map()
  private executions: Map<string, WorkflowExecution> = new Map()
  private activeExecutors: Map<string, BaseExecutor> = new Map()
  private taskExecutor: TaskExecutor
  private resolver: DependencyResolver
  private config: Required<WorkflowEngineConfig>

  constructor(taskExecutor: TaskExecutor, config: WorkflowEngineConfig = {}) {
    super()
    this.taskExecutor = taskExecutor
    this.resolver = new DependencyResolver()
    this.config = {
      defaultExecutorOptions: config.defaultExecutorOptions || {},
      maxConcurrentExecutions: config.maxConcurrentExecutions || 10,
      enableEventLogging: config.enableEventLogging ?? false,
    }
  }

  // ============================================================
  // WORKFLOW REGISTRATION
  // ============================================================

  /**
   * Register a workflow
   */
  registerWorkflow(workflow: Workflow): void {
    // Validate workflow
    this.validateWorkflow(workflow)

    this.workflows.set(workflow.id, workflow)
    this.emit('workflow-registered', { workflowId: workflow.id })
  }

  /**
   * Register multiple workflows
   */
  registerWorkflows(workflows: Workflow[]): void {
    for (const workflow of workflows) {
      this.registerWorkflow(workflow)
    }
  }

  /**
   * Get a registered workflow
   */
  getWorkflow(id: string): Workflow | undefined {
    return this.workflows.get(id)
  }

  /**
   * Get all registered workflows
   */
  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values())
  }

  /**
   * Unregister a workflow
   */
  unregisterWorkflow(id: string): boolean {
    return this.workflows.delete(id)
  }

  // ============================================================
  // WORKFLOW VALIDATION
  // ============================================================

  private validateWorkflow(workflow: Workflow): void {
    if (!workflow.id) {
      throw new Error('Workflow must have an id')
    }

    if (!workflow.stages || workflow.stages.length === 0) {
      throw new Error('Workflow must have at least one stage')
    }

    // Check for circular dependencies
    const graph = this.resolver.buildStageGraph(workflow.stages)
    const cycles = this.resolver.detectCircularDependencies(graph)

    if (cycles.length > 0) {
      throw new Error(
        `Workflow has circular dependencies: ${cycles.map(c => c.join(' -> ')).join('; ')}`
      )
    }

    // Validate stage references
    const stageIds = new Set(workflow.stages.map(s => s.id))
    for (const stage of workflow.stages) {
      for (const dep of stage.dependencies || []) {
        if (!stageIds.has(dep)) {
          throw new Error(`Stage ${stage.id} references unknown dependency: ${dep}`)
        }
      }
    }
  }

  // ============================================================
  // WORKFLOW EXECUTION
  // ============================================================

  /**
   * Execute a workflow
   */
  async execute(
    workflowId: string,
    input?: unknown,
    options?: ExecutorOptions
  ): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`)
    }

    // Check concurrent execution limit
    const runningCount = Array.from(this.executions.values())
      .filter(e => e.status === 'running').length

    if (runningCount >= this.config.maxConcurrentExecutions) {
      throw new Error(`Max concurrent executions reached: ${this.config.maxConcurrentExecutions}`)
    }

    // Create execution record
    const execution: WorkflowExecution = {
      id: uuidv4(),
      workflowId,
      status: 'pending',
    }
    this.executions.set(execution.id, execution)

    try {
      // Create executor
      const executor = this.createExecutor(
        workflow,
        { ...this.config.defaultExecutorOptions, ...options }
      )

      this.activeExecutors.set(execution.id, executor)

      // Set up event forwarding
      this.setupExecutorEvents(executor, execution.id)

      // Start execution
      execution.status = 'running'
      execution.startedAt = new Date()
      this.emit('execution-started', { executionId: execution.id, workflowId })

      const context = await executor.execute(input)

      // Update execution record
      execution.status = context.status === 'completed' ? 'completed' : 'failed'
      execution.completedAt = new Date()
      execution.context = context

      if (context.errors.size > 0) {
        execution.error = Array.from(context.errors.values())[0]
      }

      this.emit('execution-completed', {
        executionId: execution.id,
        workflowId,
        status: execution.status,
      })

    } catch (error) {
      execution.status = 'failed'
      execution.completedAt = new Date()
      execution.error = error instanceof Error ? error : new Error(String(error))

      this.emit('execution-failed', {
        executionId: execution.id,
        workflowId,
        error: execution.error,
      })
    } finally {
      this.activeExecutors.delete(execution.id)
    }

    return execution
  }

  /**
   * Execute a workflow by pattern
   */
  async executeWithPattern(
    workflow: Workflow,
    pattern: WorkflowPattern,
    input?: unknown,
    options?: ExecutorOptions
  ): Promise<WorkflowExecution> {
    // Override workflow pattern
    const modifiedWorkflow = { ...workflow, pattern }
    const tempId = `temp-${workflow.id}-${pattern}`
    modifiedWorkflow.id = tempId

    this.registerWorkflow(modifiedWorkflow)

    try {
      return await this.execute(tempId, input, options)
    } finally {
      this.unregisterWorkflow(tempId)
    }
  }

  // ============================================================
  // EXECUTOR CREATION
  // ============================================================

  private createExecutor(workflow: Workflow, options: ExecutorOptions): BaseExecutor {
    switch (workflow.pattern) {
      case 'sequential':
      case 'waterfall':
        return new SequentialExecutor(workflow, this.taskExecutor, options)

      case 'parallel':
        return new ParallelExecutor(workflow, this.taskExecutor, options)

      case 'pipeline':
        return new PipelineExecutor(workflow, this.taskExecutor, options)

      case 'agile-sprint':
        return new AgileSprintExecutor(workflow, this.taskExecutor, options)

      case 'kanban':
        return new KanbanExecutor(workflow, this.taskExecutor, options)

      case 'swarm':
        return new SwarmExecutor(workflow, this.taskExecutor, {
          ...options,
          swarmConfig: this.inferSwarmConfig(workflow),
        })

      default:
        // Default to sequential
        return new SequentialExecutor(workflow, this.taskExecutor, options)
    }
  }

  private inferSwarmConfig(workflow: Workflow): Partial<SwarmConfig> {
    // Infer swarm pattern from workflow characteristics
    const stageCount = workflow.stages.length
    const hasReviewStages = workflow.stages.some(s =>
      s.tasks.includes('code-review') || s.tasks.includes('security-audit')
    )

    if (hasReviewStages) {
      return { pattern: 'council', consensusThreshold: 0.7 }
    }

    if (stageCount > 5) {
      return { pattern: 'pipeline' }
    }

    return { pattern: 'hive' }
  }

  private setupExecutorEvents(executor: BaseExecutor, executionId: string): void {
    const events = [
      'status-changed',
      'stage-started',
      'stage-completed',
      'stage-attempt',
      'error',
      'paused',
      'resumed',
      'aborted',
    ]

    for (const event of events) {
      executor.on(event, (data) => {
        if (this.config.enableEventLogging) {
          console.log(`[WorkflowEngine] ${event}:`, data)
        }
        this.emit(`executor:${event}`, { executionId, ...data })
      })
    }
  }

  // ============================================================
  // EXECUTION CONTROL
  // ============================================================

  /**
   * Pause an execution
   */
  pauseExecution(executionId: string): boolean {
    const executor = this.activeExecutors.get(executionId)
    if (executor) {
      executor.pause()
      return true
    }
    return false
  }

  /**
   * Resume an execution
   */
  resumeExecution(executionId: string): boolean {
    const executor = this.activeExecutors.get(executionId)
    if (executor) {
      executor.resume()
      return true
    }
    return false
  }

  /**
   * Cancel an execution
   */
  cancelExecution(executionId: string): boolean {
    const executor = this.activeExecutors.get(executionId)
    const execution = this.executions.get(executionId)

    if (executor && execution) {
      executor.abort()
      execution.status = 'cancelled'
      execution.completedAt = new Date()
      this.emit('execution-cancelled', { executionId })
      return true
    }
    return false
  }

  // ============================================================
  // EXECUTION QUERIES
  // ============================================================

  /**
   * Get an execution by ID
   */
  getExecution(id: string): WorkflowExecution | undefined {
    return this.executions.get(id)
  }

  /**
   * Get all executions
   */
  getAllExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values())
  }

  /**
   * Get executions by workflow ID
   */
  getExecutionsByWorkflow(workflowId: string): WorkflowExecution[] {
    return this.getAllExecutions().filter(e => e.workflowId === workflowId)
  }

  /**
   * Get running executions
   */
  getRunningExecutions(): WorkflowExecution[] {
    return this.getAllExecutions().filter(e => e.status === 'running')
  }

  /**
   * Get execution progress
   */
  getExecutionProgress(executionId: string): { completed: number; total: number; percentage: number } | undefined {
    const executor = this.activeExecutors.get(executionId)
    if (executor) {
      return executor.getProgress()
    }
    return undefined
  }

  // ============================================================
  // STATISTICS
  // ============================================================

  getStats(): object {
    const executions = this.getAllExecutions()

    return {
      registeredWorkflows: this.workflows.size,
      totalExecutions: executions.length,
      executionsByStatus: {
        pending: executions.filter(e => e.status === 'pending').length,
        running: executions.filter(e => e.status === 'running').length,
        completed: executions.filter(e => e.status === 'completed').length,
        failed: executions.filter(e => e.status === 'failed').length,
        cancelled: executions.filter(e => e.status === 'cancelled').length,
      },
      activeExecutors: this.activeExecutors.size,
    }
  }

  /**
   * Clear completed executions
   */
  clearCompletedExecutions(): number {
    let count = 0
    for (const [id, execution] of this.executions) {
      if (execution.status === 'completed' || execution.status === 'failed' || execution.status === 'cancelled') {
        this.executions.delete(id)
        count++
      }
    }
    return count
  }
}

/**
 * Create a default task executor that simulates task execution
 */
export function createDefaultTaskExecutor(): TaskExecutor {
  return async (task: Task, teams: TeamId[]): Promise<Task> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100))

    task.status = 'completed'
    task.completedAt = new Date()
    task.output = {
      result: 'Task completed',
      teams,
      timestamp: new Date().toISOString(),
    }

    return task
  }
}

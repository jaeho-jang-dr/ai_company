/**
 * AI Company - Agile Sprint Executor
 * 애자일 스프린트 스타일 워크플로우 실행
 */

import { v4 as uuidv4 } from 'uuid'
import { Workflow, WorkflowStage, Task } from '../../types'
import {
  BaseExecutor,
  ExecutionContext,
  ExecutorOptions,
  StageResult,
  TaskExecutor,
  TaskResult,
} from './BaseExecutor'

export interface SprintConfig {
  sprintDurationMs: number
  dailyStandupEnabled: boolean
  retrospectiveEnabled: boolean
  velocityTracking: boolean
}

export interface SprintMetrics {
  sprintNumber: number
  plannedPoints: number
  completedPoints: number
  velocity: number
  burndownData: Array<{ day: number; remaining: number }>
}

export interface AgileSprintExecutorOptions extends ExecutorOptions {
  sprintConfig?: Partial<SprintConfig>
}

export class AgileSprintExecutor extends BaseExecutor {
  private sprintConfig: SprintConfig
  private currentSprint: number = 1
  private sprintMetrics: SprintMetrics[] = []
  private backlog: Task[] = []

  constructor(
    workflow: Workflow,
    taskExecutor: TaskExecutor,
    options: AgileSprintExecutorOptions = {}
  ) {
    super(workflow, taskExecutor, options)
    this.sprintConfig = {
      sprintDurationMs: options.sprintConfig?.sprintDurationMs || 2 * 7 * 24 * 60 * 60 * 1000, // 2 weeks
      dailyStandupEnabled: options.sprintConfig?.dailyStandupEnabled ?? true,
      retrospectiveEnabled: options.sprintConfig?.retrospectiveEnabled ?? true,
      velocityTracking: options.sprintConfig?.velocityTracking ?? true,
    }
  }

  async execute(input?: unknown): Promise<ExecutionContext> {
    this.setStatus('running')
    this.context.startedAt = new Date()
    this.emit('workflow-started', { workflowId: this.workflow.id, executionId: this.context.executionId })

    try {
      // Initialize backlog from workflow stages
      this.initializeBacklog()

      // Run sprint planning
      await this.runSprintPlanning()

      // Execute each stage as part of the sprint
      for (const stage of this.workflow.stages) {
        if (this.aborted) {
          throw new Error('Execution aborted')
        }

        while (this.context.status === 'paused') {
          await this.delay(100)
        }

        this.context.currentStage = stage.id
        this.options.onStageStart?.(stage.id)

        this.emit('stage-started', { stageId: stage.id, sprint: this.currentSprint })

        const result = await this.executeWithRetry(stage, input)
        this.handleStageComplete(stage, result)

        // Update metrics
        this.updateSprintMetrics(stage, result)

        if (!result.success) {
          // In agile, we continue but track the failure
          this.emit('stage-failed', { stageId: stage.id, sprint: this.currentSprint })
          // Optionally move to next sprint or continue
        }

        // Use output as input for next stage
        input = result.output
      }

      // Run sprint retrospective
      if (this.sprintConfig.retrospectiveEnabled) {
        await this.runRetrospective()
      }

      this.setStatus('completed')
      this.context.completedAt = new Date()

      this.emit('workflow-completed', {
        workflowId: this.workflow.id,
        executionId: this.context.executionId,
        sprintMetrics: this.sprintMetrics,
      })

    } catch (error) {
      this.setStatus('failed')
      this.context.completedAt = new Date()
      this.handleError(error instanceof Error ? error : new Error(String(error)))
    }

    return this.context
  }

  protected async executeStage(stage: WorkflowStage, input?: unknown): Promise<StageResult> {
    const startTime = Date.now()
    const taskResults: TaskResult[] = []

    try {
      // Get tasks for this stage from backlog
      const stageTasks = this.getTasksForStage(stage)

      // Execute tasks
      for (const task of stageTasks) {
        task.input = input
        const result = await this.executeTask(task, stage.teams)
        taskResults.push(result)

        if (result.success) {
          this.markTaskComplete(task)
        }

        // Continue even if individual task fails (agile approach)
        input = result.output
      }

      // Check overall stage success (all tasks must succeed)
      const allSucceeded = taskResults.every(r => r.success)

      return {
        stageId: stage.id,
        success: allSucceeded,
        output: input,
        error: allSucceeded ? undefined : new Error('Some tasks failed'),
        duration: Date.now() - startTime,
        tasks: taskResults,
      }
    } catch (error) {
      return {
        stageId: stage.id,
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        duration: Date.now() - startTime,
        tasks: taskResults,
      }
    }
  }

  // ============================================================
  // BACKLOG MANAGEMENT
  // ============================================================

  private initializeBacklog(): void {
    this.backlog = []

    for (const stage of this.workflow.stages) {
      for (const taskType of stage.tasks) {
        const task = this.createTaskFromStage(stage, taskType)
        this.backlog.push(task)
      }
    }

    this.emit('backlog-initialized', { taskCount: this.backlog.length })
  }

  private getTasksForStage(stage: WorkflowStage): Task[] {
    return this.backlog.filter(task =>
      stage.tasks.some(type => task.type === type) &&
      task.status !== 'completed'
    )
  }

  private markTaskComplete(task: Task): void {
    const index = this.backlog.findIndex(t => t.id === task.id)
    if (index !== -1) {
      this.backlog[index].status = 'completed'
      this.backlog[index].completedAt = new Date()
    }
  }

  // ============================================================
  // SPRINT CEREMONIES
  // ============================================================

  private async runSprintPlanning(): Promise<void> {
    this.emit('sprint-planning', {
      sprint: this.currentSprint,
      backlogItems: this.backlog.length,
    })

    // Simulate planning meeting
    await this.delay(100)

    const metrics: SprintMetrics = {
      sprintNumber: this.currentSprint,
      plannedPoints: this.backlog.length * 3, // Rough estimate
      completedPoints: 0,
      velocity: 0,
      burndownData: [],
    }

    this.sprintMetrics.push(metrics)
  }

  private async runRetrospective(): Promise<void> {
    const currentMetrics = this.sprintMetrics[this.currentSprint - 1]

    // Calculate velocity
    if (currentMetrics) {
      currentMetrics.velocity = currentMetrics.completedPoints

      this.emit('sprint-retrospective', {
        sprint: this.currentSprint,
        metrics: currentMetrics,
      })
    }

    await this.delay(100)
  }

  private updateSprintMetrics(stage: WorkflowStage, result: StageResult): void {
    const currentMetrics = this.sprintMetrics[this.currentSprint - 1]
    if (!currentMetrics) return

    // Update completed points
    const completedTasks = result.tasks.filter(t => t.success).length
    currentMetrics.completedPoints += completedTasks * 3 // Points per task

    // Update burndown
    const remaining = this.backlog.filter(t => t.status !== 'completed').length * 3
    currentMetrics.burndownData.push({
      day: currentMetrics.burndownData.length + 1,
      remaining,
    })
  }

  // ============================================================
  // METRICS
  // ============================================================

  getSprintMetrics(): SprintMetrics[] {
    return [...this.sprintMetrics]
  }

  getCurrentVelocity(): number {
    if (this.sprintMetrics.length === 0) return 0

    const totalVelocity = this.sprintMetrics.reduce((sum, m) => sum + m.velocity, 0)
    return totalVelocity / this.sprintMetrics.length
  }

  getBacklogSize(): number {
    return this.backlog.filter(t => t.status !== 'completed').length
  }
}

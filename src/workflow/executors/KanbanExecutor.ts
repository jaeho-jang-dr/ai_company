/**
 * AI Company - Kanban Executor
 * 칸반 스타일 워크플로우 실행 (WIP 제한)
 */

import { Workflow, WorkflowStage, Task } from '../../types'
import {
  BaseExecutor,
  ExecutionContext,
  ExecutorOptions,
  StageResult,
  TaskExecutor,
  TaskResult,
} from './BaseExecutor'

export interface KanbanColumn {
  id: string
  name: string
  wipLimit: number
  tasks: Task[]
}

export interface KanbanMetrics {
  cycleTime: Map<string, number>
  leadTime: Map<string, number>
  throughput: number
  wipViolations: number
}

export interface KanbanExecutorOptions extends ExecutorOptions {
  wipLimits?: Record<string, number>
  defaultWipLimit?: number
  pullBased?: boolean
}

export class KanbanExecutor extends BaseExecutor {
  private columns: Map<string, KanbanColumn> = new Map()
  private wipLimits: Record<string, number>
  private defaultWipLimit: number
  private pullBased: boolean
  private metrics: KanbanMetrics = {
    cycleTime: new Map(),
    leadTime: new Map(),
    throughput: 0,
    wipViolations: 0,
  }

  constructor(
    workflow: Workflow,
    taskExecutor: TaskExecutor,
    options: KanbanExecutorOptions = {}
  ) {
    super(workflow, taskExecutor, options)
    this.wipLimits = options.wipLimits || {}
    this.defaultWipLimit = options.defaultWipLimit || 3
    this.pullBased = options.pullBased ?? true

    this.initializeColumns()
  }

  private initializeColumns(): void {
    // Create columns based on workflow stages
    for (const stage of this.workflow.stages) {
      this.columns.set(stage.id, {
        id: stage.id,
        name: stage.name,
        wipLimit: this.wipLimits[stage.id] || this.defaultWipLimit,
        tasks: [],
      })
    }

    // Add done column
    this.columns.set('done', {
      id: 'done',
      name: 'Done',
      wipLimit: Infinity,
      tasks: [],
    })
  }

  async execute(input?: unknown): Promise<ExecutionContext> {
    this.setStatus('running')
    this.context.startedAt = new Date()
    this.emit('workflow-started', { workflowId: this.workflow.id, executionId: this.context.executionId })

    try {
      // Create tasks from stages and add to first column
      const firstStage = this.workflow.stages[0]
      if (firstStage) {
        const firstColumn = this.columns.get(firstStage.id)
        if (firstColumn) {
          for (const taskType of firstStage.tasks) {
            const task = this.createTaskFromStage(firstStage, taskType)
            task.input = input
            firstColumn.tasks.push(task)
          }
        }
      }

      // Process all stages
      for (let i = 0; i < this.workflow.stages.length; i++) {
        const stage = this.workflow.stages[i]

        if (this.aborted) {
          throw new Error('Execution aborted')
        }

        while (this.context.status === 'paused') {
          await this.delay(100)
        }

        this.context.currentStage = stage.id
        this.options.onStageStart?.(stage.id)
        this.emit('stage-started', { stageId: stage.id })

        const result = await this.executeWithRetry(stage, input)
        this.handleStageComplete(stage, result)

        if (!result.success && !this.pullBased) {
          // In strict mode, fail on first error
          this.setStatus('failed')
          this.context.completedAt = new Date()
          return this.context
        }

        // Move completed tasks to next column
        await this.moveCompletedTasks(stage.id, i + 1)

        input = result.output
      }

      this.setStatus('completed')
      this.context.completedAt = new Date()

      // Calculate final metrics
      this.calculateThroughput()

      this.emit('workflow-completed', {
        workflowId: this.workflow.id,
        executionId: this.context.executionId,
        metrics: this.getKanbanMetrics(),
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
    const column = this.columns.get(stage.id)

    if (!column) {
      return {
        stageId: stage.id,
        success: false,
        error: new Error(`Column not found for stage: ${stage.id}`),
        duration: 0,
        tasks: [],
      }
    }

    try {
      // Check WIP limit
      if (column.tasks.length > column.wipLimit) {
        this.metrics.wipViolations++
        this.emit('wip-violation', {
          stageId: stage.id,
          current: column.tasks.length,
          limit: column.wipLimit,
        })

        // Wait until WIP is under limit if pull-based
        if (this.pullBased) {
          await this.waitForWipCapacity(column)
        }
      }

      // Execute tasks in the column
      const tasksToExecute = column.tasks.filter(t => t.status === 'pending')

      for (const task of tasksToExecute) {
        task.startedAt = new Date()
        task.status = 'in_progress'

        const result = await this.executeTask(task, stage.teams)
        taskResults.push(result)

        if (result.success) {
          task.status = 'completed'
          task.completedAt = new Date()

          // Calculate cycle time
          if (task.startedAt) {
            this.metrics.cycleTime.set(
              task.id,
              task.completedAt.getTime() - task.startedAt.getTime()
            )
          }
        } else {
          task.status = 'blocked'
        }
      }

      const allSucceeded = taskResults.every(r => r.success)

      return {
        stageId: stage.id,
        success: allSucceeded,
        output: taskResults.map(r => r.output),
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
  // KANBAN OPERATIONS
  // ============================================================

  private async moveCompletedTasks(fromColumnId: string, nextIndex: number): Promise<void> {
    const fromColumn = this.columns.get(fromColumnId)
    if (!fromColumn) return

    const completedTasks = fromColumn.tasks.filter(t => t.status === 'completed')

    // Determine next column
    let toColumnId: string
    if (nextIndex >= this.workflow.stages.length) {
      toColumnId = 'done'
    } else {
      toColumnId = this.workflow.stages[nextIndex].id
    }

    const toColumn = this.columns.get(toColumnId)
    if (!toColumn) return

    // Check WIP limit of target column
    for (const task of completedTasks) {
      if (toColumn.tasks.length >= toColumn.wipLimit && toColumn.wipLimit !== Infinity) {
        if (this.pullBased) {
          await this.waitForWipCapacity(toColumn)
        }
      }

      // Move task
      const index = fromColumn.tasks.indexOf(task)
      if (index !== -1) {
        fromColumn.tasks.splice(index, 1)
        task.status = 'pending' // Reset for next stage
        toColumn.tasks.push(task)
      }

      this.emit('task-moved', {
        taskId: task.id,
        from: fromColumnId,
        to: toColumnId,
      })
    }
  }

  private async waitForWipCapacity(column: KanbanColumn): Promise<void> {
    while (column.tasks.length >= column.wipLimit) {
      await this.delay(100)
    }
  }

  private calculateThroughput(): void {
    const doneColumn = this.columns.get('done')
    if (doneColumn) {
      this.metrics.throughput = doneColumn.tasks.length
    }
  }

  // ============================================================
  // METRICS
  // ============================================================

  getKanbanMetrics(): object {
    const cycleTimeArray = Array.from(this.metrics.cycleTime.values())
    const avgCycleTime = cycleTimeArray.length > 0
      ? cycleTimeArray.reduce((a, b) => a + b, 0) / cycleTimeArray.length
      : 0

    return {
      throughput: this.metrics.throughput,
      avgCycleTimeMs: avgCycleTime,
      wipViolations: this.metrics.wipViolations,
      columnStats: Array.from(this.columns.entries()).map(([id, col]) => ({
        id,
        name: col.name,
        taskCount: col.tasks.length,
        wipLimit: col.wipLimit,
      })),
    }
  }

  getColumnState(): Map<string, KanbanColumn> {
    return new Map(this.columns)
  }

  getWipStatus(): Record<string, { current: number; limit: number; utilization: number }> {
    const status: Record<string, { current: number; limit: number; utilization: number }> = {}

    for (const [id, column] of this.columns) {
      status[id] = {
        current: column.tasks.length,
        limit: column.wipLimit,
        utilization: column.wipLimit === Infinity
          ? 0
          : (column.tasks.length / column.wipLimit) * 100,
      }
    }

    return status
  }
}

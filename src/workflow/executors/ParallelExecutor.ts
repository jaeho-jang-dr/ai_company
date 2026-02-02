/**
 * AI Company - Parallel Executor
 * 병렬 워크플로우 실행
 */

import { Workflow, WorkflowStage } from '../../types'
import { DependencyResolver } from '../DependencyResolver'
import {
  BaseExecutor,
  ExecutionContext,
  ExecutorOptions,
  StageResult,
  TaskExecutor,
  TaskResult,
} from './BaseExecutor'

export interface ParallelExecutorOptions extends ExecutorOptions {
  maxConcurrency?: number
}

export class ParallelExecutor extends BaseExecutor {
  private resolver: DependencyResolver
  private maxConcurrency: number

  constructor(
    workflow: Workflow,
    taskExecutor: TaskExecutor,
    options: ParallelExecutorOptions = {}
  ) {
    super(workflow, taskExecutor, options)
    this.resolver = new DependencyResolver()
    this.maxConcurrency = options.maxConcurrency || workflow.config.maxConcurrency
  }

  async execute(input?: unknown): Promise<ExecutionContext> {
    this.setStatus('running')
    this.context.startedAt = new Date()
    this.emit('workflow-started', { workflowId: this.workflow.id, executionId: this.context.executionId })

    try {
      // Build dependency graph
      const graph = this.resolver.buildStageGraph(this.workflow.stages)

      // Get execution order (groups of parallel stages)
      const executionOrder = this.resolver.topologicalSort(graph)

      // Execute each group
      for (const stageGroup of executionOrder.stages) {
        if (this.aborted) {
          throw new Error('Execution aborted')
        }

        while (this.context.status === 'paused') {
          await this.delay(100)
        }

        // Execute stages in parallel with concurrency limit
        await this.executeStageGroup(stageGroup, input)

        // Check for failures
        if (this.context.failedStages.length > 0) {
          this.setStatus('failed')
          this.context.completedAt = new Date()
          this.emit('workflow-failed', {
            workflowId: this.workflow.id,
            executionId: this.context.executionId,
            failedStages: this.context.failedStages,
          })
          return this.context
        }
      }

      this.setStatus('completed')
      this.context.completedAt = new Date()
      this.emit('workflow-completed', {
        workflowId: this.workflow.id,
        executionId: this.context.executionId,
        results: Object.fromEntries(this.context.results),
      })

    } catch (error) {
      this.setStatus('failed')
      this.context.completedAt = new Date()
      this.handleError(error instanceof Error ? error : new Error(String(error)))
    }

    return this.context
  }

  private async executeStageGroup(stageIds: string[], input?: unknown): Promise<void> {
    const stages = stageIds
      .map(id => this.workflow.stages.find(s => s.id === id))
      .filter((s): s is WorkflowStage => s !== undefined)

    // Execute in batches based on concurrency limit
    for (let i = 0; i < stages.length; i += this.maxConcurrency) {
      const batch = stages.slice(i, i + this.maxConcurrency)

      const promises = batch.map(async stage => {
        this.context.currentStage = stage.id
        this.options.onStageStart?.(stage.id)
        this.emit('stage-started', { stageId: stage.id })

        const result = await this.executeWithRetry(stage, input)
        this.handleStageComplete(stage, result)
        return result
      })

      await Promise.all(promises)
    }
  }

  protected async executeStage(stage: WorkflowStage, input?: unknown): Promise<StageResult> {
    const startTime = Date.now()
    const taskResults: TaskResult[] = []

    try {
      // Execute all tasks in the stage in parallel
      const taskPromises = stage.tasks.map(async taskType => {
        const task = this.createTaskFromStage(stage, taskType)
        task.input = input
        return this.executeTask(task, stage.teams)
      })

      const results = await Promise.all(taskPromises)
      taskResults.push(...results)

      // Check if any task failed
      const failed = results.find(r => !r.success)
      if (failed) {
        return {
          stageId: stage.id,
          success: false,
          error: failed.error,
          duration: Date.now() - startTime,
          tasks: taskResults,
        }
      }

      // Combine outputs
      const combinedOutput = results.map(r => r.output)

      return {
        stageId: stage.id,
        success: true,
        output: combinedOutput,
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
}

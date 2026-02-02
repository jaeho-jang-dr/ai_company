/**
 * AI Company - Sequential Executor
 * 순차적 워크플로우 실행
 */

import { Workflow, WorkflowStage } from '../../types'
import {
  BaseExecutor,
  ExecutionContext,
  ExecutorOptions,
  StageResult,
  TaskExecutor,
  TaskResult,
} from './BaseExecutor'

export class SequentialExecutor extends BaseExecutor {
  constructor(
    workflow: Workflow,
    taskExecutor: TaskExecutor,
    options: ExecutorOptions = {}
  ) {
    super(workflow, taskExecutor, options)
  }

  async execute(input?: unknown): Promise<ExecutionContext> {
    this.setStatus('running')
    this.context.startedAt = new Date()
    this.emit('workflow-started', { workflowId: this.workflow.id, executionId: this.context.executionId })

    let stageInput = input

    try {
      for (const stage of this.workflow.stages) {
        if (this.aborted) {
          throw new Error('Execution aborted')
        }

        while (this.context.status === 'paused') {
          await this.delay(100)
        }

        this.context.currentStage = stage.id
        this.options.onStageStart?.(stage.id)
        this.emit('stage-started', { stageId: stage.id })

        const result = await this.executeWithRetry(stage, stageInput)
        this.handleStageComplete(stage, result)

        if (!result.success) {
          this.setStatus('failed')
          this.context.completedAt = new Date()
          this.emit('workflow-failed', {
            workflowId: this.workflow.id,
            executionId: this.context.executionId,
            failedStage: stage.id,
            error: result.error,
          })
          return this.context
        }

        // Use output as input for next stage
        stageInput = result.output
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

  protected async executeStage(stage: WorkflowStage, input?: unknown): Promise<StageResult> {
    const startTime = Date.now()
    const taskResults: TaskResult[] = []

    try {
      // Execute tasks sequentially for each task type in the stage
      for (const taskType of stage.tasks) {
        const task = this.createTaskFromStage(stage, taskType)
        task.input = input

        const result = await this.executeTask(task, stage.teams)
        taskResults.push(result)

        if (!result.success) {
          return {
            stageId: stage.id,
            success: false,
            error: result.error,
            duration: Date.now() - startTime,
            tasks: taskResults,
          }
        }

        // Pass output to next task
        input = result.output
      }

      return {
        stageId: stage.id,
        success: true,
        output: input,
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

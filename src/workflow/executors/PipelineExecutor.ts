/**
 * AI Company - Pipeline Executor
 * 데이터 파이프라인 스타일 워크플로우 실행
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

export interface PipelineExecutorOptions extends ExecutorOptions {
  validateOutput?: boolean
  transformOutput?: (output: unknown, stageId: string) => unknown
}

export class PipelineExecutor extends BaseExecutor {
  private validateOutput: boolean
  private transformOutput?: (output: unknown, stageId: string) => unknown

  constructor(
    workflow: Workflow,
    taskExecutor: TaskExecutor,
    options: PipelineExecutorOptions = {}
  ) {
    super(workflow, taskExecutor, options)
    this.validateOutput = options.validateOutput ?? true
    this.transformOutput = options.transformOutput
  }

  async execute(input?: unknown): Promise<ExecutionContext> {
    this.setStatus('running')
    this.context.startedAt = new Date()
    this.emit('workflow-started', { workflowId: this.workflow.id, executionId: this.context.executionId })

    let pipelineData = input

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
        this.emit('pipeline-data', { stageId: stage.id, input: pipelineData })

        const result = await this.executeWithRetry(stage, pipelineData)
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

        // Transform and validate output
        pipelineData = this.processStageOutput(result.output, stage.id)

        // Validate the output for the next stage
        if (this.validateOutput && pipelineData === undefined) {
          throw new Error(`Stage ${stage.id} produced undefined output`)
        }
      }

      this.setStatus('completed')
      this.context.completedAt = new Date()
      this.context.results.set('final', pipelineData)

      this.emit('workflow-completed', {
        workflowId: this.workflow.id,
        executionId: this.context.executionId,
        finalOutput: pipelineData,
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
    let stageData = input

    try {
      // Execute tasks as a pipeline within the stage
      for (const taskType of stage.tasks) {
        const task = this.createTaskFromStage(stage, taskType)
        task.input = stageData

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

        // Pass output to next task in pipeline
        stageData = result.output
      }

      return {
        stageId: stage.id,
        success: true,
        output: stageData,
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

  private processStageOutput(output: unknown, stageId: string): unknown {
    if (this.transformOutput) {
      return this.transformOutput(output, stageId)
    }
    return output
  }

  /**
   * Get the current pipeline data
   */
  getCurrentData(): unknown | undefined {
    const currentStage = this.context.currentStage
    if (currentStage) {
      return this.context.results.get(currentStage)
    }
    return undefined
  }

  /**
   * Get the final pipeline output
   */
  getFinalOutput(): unknown | undefined {
    return this.context.results.get('final')
  }
}

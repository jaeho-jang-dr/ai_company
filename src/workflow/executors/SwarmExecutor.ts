/**
 * AI Company - Swarm Executor
 * 스웜 패턴 기반 멀티 에이전트 워크플로우 실행
 */

import { v4 as uuidv4 } from 'uuid'
import { Workflow, WorkflowStage, Task, SwarmPattern, TeamId } from '../../types'
import {
  BaseExecutor,
  ExecutionContext,
  ExecutorOptions,
  StageResult,
  TaskExecutor,
  TaskResult,
} from './BaseExecutor'

export interface SwarmConfig {
  pattern: SwarmPattern
  minAgents: number
  maxAgents: number
  consensusThreshold?: number  // For council pattern (0-1)
  watchInterval?: number       // For watchdog pattern (ms)
  specialistMatching?: boolean // For specialist pattern
}

export interface SwarmExecutorOptions extends ExecutorOptions {
  swarmConfig?: Partial<SwarmConfig>
}

export interface SwarmMetrics {
  pattern: SwarmPattern
  agentsUsed: number
  tasksDistributed: number
  consensusReached?: boolean
  watchdogAlerts?: number
}

export class SwarmExecutor extends BaseExecutor {
  private swarmConfig: SwarmConfig
  private activeAgents: Set<string> = new Set()
  private swarmMetrics: SwarmMetrics

  constructor(
    workflow: Workflow,
    taskExecutor: TaskExecutor,
    options: SwarmExecutorOptions = {}
  ) {
    super(workflow, taskExecutor, options)
    this.swarmConfig = {
      pattern: options.swarmConfig?.pattern || 'hive',
      minAgents: options.swarmConfig?.minAgents || 2,
      maxAgents: options.swarmConfig?.maxAgents || 10,
      consensusThreshold: options.swarmConfig?.consensusThreshold || 0.6,
      watchInterval: options.swarmConfig?.watchInterval || 5000,
      specialistMatching: options.swarmConfig?.specialistMatching ?? true,
    }
    this.swarmMetrics = {
      pattern: this.swarmConfig.pattern,
      agentsUsed: 0,
      tasksDistributed: 0,
    }
  }

  async execute(input?: unknown): Promise<ExecutionContext> {
    this.setStatus('running')
    this.context.startedAt = new Date()
    this.emit('workflow-started', {
      workflowId: this.workflow.id,
      executionId: this.context.executionId,
      swarmPattern: this.swarmConfig.pattern,
    })

    try {
      // Execute based on swarm pattern
      switch (this.swarmConfig.pattern) {
        case 'hive':
          await this.executeHive(input)
          break
        case 'pipeline':
          await this.executePipeline(input)
          break
        case 'council':
          await this.executeCouncil(input)
          break
        case 'watchdog':
          await this.executeWatchdog(input)
          break
        case 'specialist':
          await this.executeSpecialist(input)
          break
        default:
          throw new Error(`Unknown swarm pattern: ${this.swarmConfig.pattern}`)
      }

      if (this.context.failedStages.length === 0) {
        this.setStatus('completed')
      } else {
        this.setStatus('failed')
      }

      this.context.completedAt = new Date()

      this.emit('workflow-completed', {
        workflowId: this.workflow.id,
        executionId: this.context.executionId,
        swarmMetrics: this.swarmMetrics,
      })

    } catch (error) {
      this.setStatus('failed')
      this.context.completedAt = new Date()
      this.handleError(error instanceof Error ? error : new Error(String(error)))
    }

    return this.context
  }

  protected async executeStage(stage: WorkflowStage, input?: unknown): Promise<StageResult> {
    // Default stage execution for patterns that use it
    const startTime = Date.now()
    const taskResults: TaskResult[] = []

    try {
      for (const taskType of stage.tasks) {
        const task = this.createTaskFromStage(stage, taskType)
        task.input = input

        const result = await this.executeTask(task, stage.teams)
        taskResults.push(result)
        this.swarmMetrics.tasksDistributed++

        if (!result.success) {
          return {
            stageId: stage.id,
            success: false,
            error: result.error,
            duration: Date.now() - startTime,
            tasks: taskResults,
          }
        }

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

  // ============================================================
  // HIVE PATTERN - Parallel task processing
  // ============================================================

  private async executeHive(input?: unknown): Promise<void> {
    this.emit('swarm-pattern-started', { pattern: 'hive' })

    // Create all tasks upfront
    const allTasks: Array<{ task: Task; stage: WorkflowStage }> = []

    for (const stage of this.workflow.stages) {
      for (const taskType of stage.tasks) {
        const task = this.createTaskFromStage(stage, taskType)
        task.input = input
        allTasks.push({ task, stage })
      }
    }

    // Execute all tasks in parallel with concurrency limit
    const concurrency = Math.min(this.swarmConfig.maxAgents, allTasks.length)
    const batches: Array<Array<{ task: Task; stage: WorkflowStage }>> = []

    for (let i = 0; i < allTasks.length; i += concurrency) {
      batches.push(allTasks.slice(i, i + concurrency))
    }

    for (const batch of batches) {
      if (this.aborted) break

      const results = await Promise.all(
        batch.map(async ({ task, stage }) => {
          this.swarmMetrics.agentsUsed++
          this.swarmMetrics.tasksDistributed++
          return this.executeTask(task, stage.teams)
        })
      )

      // Track completed stages
      for (let i = 0; i < batch.length; i++) {
        const stageId = batch[i].stage.id
        if (results[i].success) {
          if (!this.context.completedStages.includes(stageId)) {
            this.context.completedStages.push(stageId)
          }
        } else {
          if (!this.context.failedStages.includes(stageId)) {
            this.context.failedStages.push(stageId)
          }
        }
      }
    }
  }

  // ============================================================
  // PIPELINE PATTERN - Sequential stages
  // ============================================================

  private async executePipeline(input?: unknown): Promise<void> {
    this.emit('swarm-pattern-started', { pattern: 'pipeline' })

    let stageInput = input

    for (const stage of this.workflow.stages) {
      if (this.aborted) break

      this.context.currentStage = stage.id
      this.options.onStageStart?.(stage.id)
      this.emit('stage-started', { stageId: stage.id })

      const result = await this.executeStage(stage, stageInput)
      this.handleStageComplete(stage, result)
      this.swarmMetrics.agentsUsed += result.tasks.length

      if (!result.success) {
        return
      }

      stageInput = result.output
    }
  }

  // ============================================================
  // COUNCIL PATTERN - Consensus-based decision making
  // ============================================================

  private async executeCouncil(input?: unknown): Promise<void> {
    this.emit('swarm-pattern-started', { pattern: 'council' })

    for (const stage of this.workflow.stages) {
      if (this.aborted) break

      this.context.currentStage = stage.id
      this.emit('stage-started', { stageId: stage.id })

      // Get multiple opinions/votes
      const votes: Array<{ agentId: string; vote: unknown; confidence: number }> = []
      const numVoters = Math.min(this.swarmConfig.maxAgents, stage.teams.length * 2)

      for (let i = 0; i < numVoters; i++) {
        const task = this.createTaskFromStage(stage, stage.tasks[0] || 'code-review')
        task.input = input

        const result = await this.executeTask(task, stage.teams)
        this.swarmMetrics.agentsUsed++
        this.swarmMetrics.tasksDistributed++

        if (result.success) {
          votes.push({
            agentId: result.assignedTo || `agent-${i}`,
            vote: result.output,
            confidence: 0.8, // Simulated confidence
          })
        }
      }

      // Calculate consensus
      const consensusResult = this.calculateConsensus(votes)
      this.swarmMetrics.consensusReached = consensusResult.reached

      this.emit('council-vote', {
        stageId: stage.id,
        votes: votes.length,
        consensusReached: consensusResult.reached,
        threshold: this.swarmConfig.consensusThreshold,
      })

      if (consensusResult.reached) {
        this.context.completedStages.push(stage.id)
        this.context.results.set(stage.id, consensusResult.decision)
        input = consensusResult.decision
      } else {
        this.context.failedStages.push(stage.id)
        return
      }
    }
  }

  private calculateConsensus(votes: Array<{ agentId: string; vote: unknown; confidence: number }>): {
    reached: boolean
    decision?: unknown
  } {
    if (votes.length === 0) {
      return { reached: false }
    }

    // Simple majority consensus
    const threshold = this.swarmConfig.consensusThreshold || 0.6
    const requiredVotes = Math.ceil(votes.length * threshold)

    // For now, use first successful vote as "consensus"
    // In real implementation, would compare votes
    const highConfidenceVotes = votes.filter(v => v.confidence >= 0.7)

    if (highConfidenceVotes.length >= requiredVotes) {
      return {
        reached: true,
        decision: highConfidenceVotes[0].vote,
      }
    }

    return { reached: false }
  }

  // ============================================================
  // WATCHDOG PATTERN - Background monitoring
  // ============================================================

  private async executeWatchdog(input?: unknown): Promise<void> {
    this.emit('swarm-pattern-started', { pattern: 'watchdog' })
    this.swarmMetrics.watchdogAlerts = 0

    // Start watchdog monitoring
    const watchdogInterval = setInterval(() => {
      this.performHealthCheck()
    }, this.swarmConfig.watchInterval)

    try {
      // Execute stages normally while monitoring
      for (const stage of this.workflow.stages) {
        if (this.aborted) break

        this.context.currentStage = stage.id
        this.emit('stage-started', { stageId: stage.id })

        const result = await this.executeWithRetry(stage, input)
        this.handleStageComplete(stage, result)
        this.swarmMetrics.agentsUsed += result.tasks.length

        if (!result.success) {
          this.swarmMetrics.watchdogAlerts!++
          this.emit('watchdog-alert', {
            type: 'stage-failure',
            stageId: stage.id,
            error: result.error?.message,
          })
        }

        input = result.output
      }
    } finally {
      clearInterval(watchdogInterval)
    }
  }

  private performHealthCheck(): void {
    const progress = this.getProgress()

    this.emit('watchdog-check', {
      status: this.context.status,
      progress: progress.percentage,
      currentStage: this.context.currentStage,
      failedStages: this.context.failedStages.length,
    })

    // Alert if stuck
    if (this.context.status === 'running' && progress.percentage === 0) {
      this.swarmMetrics.watchdogAlerts!++
      this.emit('watchdog-alert', { type: 'stuck', message: 'No progress detected' })
    }
  }

  // ============================================================
  // SPECIALIST PATTERN - Expert matching
  // ============================================================

  private async executeSpecialist(input?: unknown): Promise<void> {
    this.emit('swarm-pattern-started', { pattern: 'specialist' })

    for (const stage of this.workflow.stages) {
      if (this.aborted) break

      this.context.currentStage = stage.id
      this.emit('stage-started', { stageId: stage.id })

      // Match specialists to tasks
      const specialists = this.matchSpecialists(stage)
      this.emit('specialists-matched', {
        stageId: stage.id,
        specialists: specialists.map(s => s.teamId),
      })

      const taskResults: TaskResult[] = []

      for (const { taskType, teamId } of specialists) {
        const task = this.createTaskFromStage(stage, taskType)
        task.input = input
        task.assignedTeam = teamId

        const result = await this.executeTask(task, [teamId])
        taskResults.push(result)
        this.swarmMetrics.agentsUsed++
        this.swarmMetrics.tasksDistributed++

        input = result.output
      }

      const allSucceeded = taskResults.every(r => r.success)

      if (allSucceeded) {
        this.context.completedStages.push(stage.id)
        this.context.results.set(stage.id, taskResults.map(r => r.output))
      } else {
        this.context.failedStages.push(stage.id)
        return
      }
    }
  }

  private matchSpecialists(stage: WorkflowStage): Array<{ taskType: string; teamId: TeamId }> {
    const matches: Array<{ taskType: string; teamId: TeamId }> = []

    for (const taskType of stage.tasks) {
      // Match task type to most appropriate team
      const teamId = this.findBestTeamForTask(taskType, stage.teams)
      matches.push({ taskType, teamId })
    }

    return matches
  }

  private findBestTeamForTask(taskType: string, availableTeams: TeamId[]): TeamId {
    // Task type to team affinity mapping
    const affinityMap: Record<string, TeamId[]> = {
      'feature-development': ['backend', 'frontend'],
      'bug-fix': ['backend', 'frontend', 'devops'],
      'code-review': ['architecture', 'security'],
      'testing': ['quality-assurance'],
      'deployment': ['devops'],
      'ui-design': ['design'],
      'documentation': ['content'],
      'security-audit': ['security'],
    }

    const preferredTeams = affinityMap[taskType] || []

    // Find first matching team
    for (const preferred of preferredTeams) {
      if (availableTeams.includes(preferred)) {
        return preferred
      }
    }

    // Default to first available
    return availableTeams[0] || 'backend'
  }

  // ============================================================
  // METRICS
  // ============================================================

  getSwarmMetrics(): SwarmMetrics {
    return { ...this.swarmMetrics }
  }
}

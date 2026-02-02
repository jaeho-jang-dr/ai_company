/**
 * AI Company - Swarm Orchestrator
 * 스웜 패턴 기반 멀티 에이전트 오케스트레이션
 */

import { EventEmitter } from 'events'
import { v4 as uuidv4 } from 'uuid'
import { BaseAgent } from '../agents/BaseAgent'
import { Task, SwarmPattern, TeamId, TaskPriority } from '../types'

export interface SwarmTask {
  id: string
  originalTask: Task
  pattern: SwarmPattern
  agents: string[]
  results: Map<string, unknown>
  votes?: Map<string, unknown>
  consensusResult?: unknown
  status: 'pending' | 'running' | 'completed' | 'failed'
  startedAt?: Date
  completedAt?: Date
}

export interface SwarmOrchestratorConfig {
  defaultPattern: SwarmPattern
  minAgentsForSwarm: number
  maxAgentsForSwarm: number
  consensusThreshold: number
  watchdogIntervalMs: number
  taskTimeoutMs: number
}

const DEFAULT_CONFIG: SwarmOrchestratorConfig = {
  defaultPattern: 'hive',
  minAgentsForSwarm: 2,
  maxAgentsForSwarm: 10,
  consensusThreshold: 0.6,
  watchdogIntervalMs: 5000,
  taskTimeoutMs: 300000, // 5 minutes
}

export class SwarmOrchestrator extends EventEmitter {
  private config: SwarmOrchestratorConfig
  private agents: Map<string, BaseAgent> = new Map()
  private activeTasks: Map<string, SwarmTask> = new Map()
  private watchdogIntervals: Map<string, NodeJS.Timeout> = new Map()

  constructor(config: Partial<SwarmOrchestratorConfig> = {}) {
    super()
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  // ============================================================
  // AGENT MANAGEMENT
  // ============================================================

  registerAgents(agents: BaseAgent[]): void {
    for (const agent of agents) {
      this.agents.set(agent.id, agent)
    }
    this.emit('agents-registered', { count: agents.length })
  }

  getAgents(): BaseAgent[] {
    return Array.from(this.agents.values())
  }

  getAvailableAgents(): BaseAgent[] {
    return this.getAgents().filter(a => a.isAvailable())
  }

  // ============================================================
  // SWARM EXECUTION
  // ============================================================

  /**
   * Execute a task using swarm intelligence
   */
  async executeSwarm(
    task: Task,
    options: {
      pattern?: SwarmPattern
      agentIds?: string[]
      teamId?: TeamId
    } = {}
  ): Promise<SwarmTask> {
    const pattern = options.pattern || this.config.defaultPattern
    const agents = this.selectAgentsForSwarm(task, options)

    if (agents.length < this.config.minAgentsForSwarm) {
      throw new Error(`Not enough agents for swarm: ${agents.length}/${this.config.minAgentsForSwarm}`)
    }

    const swarmTask: SwarmTask = {
      id: uuidv4(),
      originalTask: task,
      pattern,
      agents: agents.map(a => a.id),
      results: new Map(),
      votes: pattern === 'council' ? new Map() : undefined,
      status: 'pending',
    }

    this.activeTasks.set(swarmTask.id, swarmTask)

    try {
      swarmTask.status = 'running'
      swarmTask.startedAt = new Date()

      this.emit('swarm-started', {
        taskId: swarmTask.id,
        pattern,
        agentCount: agents.length,
      })

      // Execute based on pattern
      switch (pattern) {
        case 'hive':
          await this.executeHivePattern(swarmTask, agents)
          break
        case 'pipeline':
          await this.executePipelinePattern(swarmTask, agents)
          break
        case 'council':
          await this.executeCouncilPattern(swarmTask, agents)
          break
        case 'watchdog':
          await this.executeWatchdogPattern(swarmTask, agents)
          break
        case 'specialist':
          await this.executeSpecialistPattern(swarmTask, agents)
          break
      }

      swarmTask.status = 'completed'
      swarmTask.completedAt = new Date()

      this.emit('swarm-completed', {
        taskId: swarmTask.id,
        pattern,
        results: Object.fromEntries(swarmTask.results),
      })

    } catch (error) {
      swarmTask.status = 'failed'
      swarmTask.completedAt = new Date()

      this.emit('swarm-failed', {
        taskId: swarmTask.id,
        error: error instanceof Error ? error.message : String(error),
      })

      throw error
    } finally {
      // Clean up watchdog if exists
      const watchdog = this.watchdogIntervals.get(swarmTask.id)
      if (watchdog) {
        clearInterval(watchdog)
        this.watchdogIntervals.delete(swarmTask.id)
      }
    }

    return swarmTask
  }

  // ============================================================
  // PATTERN IMPLEMENTATIONS
  // ============================================================

  /**
   * Hive Pattern: Parallel execution with result aggregation
   */
  private async executeHivePattern(swarmTask: SwarmTask, agents: BaseAgent[]): Promise<void> {
    const task = swarmTask.originalTask

    // Execute task on all agents in parallel
    const promises = agents.map(async (agent) => {
      try {
        const result = await agent.execute({ ...task, id: `${task.id}-${agent.id}` })
        swarmTask.results.set(agent.id, result.output)
        return { agentId: agent.id, success: true, output: result.output }
      } catch (error) {
        swarmTask.results.set(agent.id, { error: String(error) })
        return { agentId: agent.id, success: false, error }
      }
    })

    const results = await Promise.all(promises)

    // Aggregate results
    const successResults = results.filter(r => r.success)
    if (successResults.length === 0) {
      throw new Error('All agents failed in hive pattern')
    }

    this.emit('hive-completed', {
      taskId: swarmTask.id,
      successCount: successResults.length,
      failCount: results.length - successResults.length,
    })
  }

  /**
   * Pipeline Pattern: Sequential execution through agents
   */
  private async executePipelinePattern(swarmTask: SwarmTask, agents: BaseAgent[]): Promise<void> {
    let currentInput = swarmTask.originalTask.input

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i]

      this.emit('pipeline-stage', {
        taskId: swarmTask.id,
        stage: i + 1,
        totalStages: agents.length,
        agentId: agent.id,
      })

      const stageTask: Task = {
        ...swarmTask.originalTask,
        id: `${swarmTask.originalTask.id}-stage-${i}`,
        input: currentInput,
      }

      const result = await agent.execute(stageTask)
      swarmTask.results.set(agent.id, result.output)

      // Pass output to next stage
      currentInput = result.output
    }

    this.emit('pipeline-completed', {
      taskId: swarmTask.id,
      stages: agents.length,
    })
  }

  /**
   * Council Pattern: Voting-based decision making
   */
  private async executeCouncilPattern(swarmTask: SwarmTask, agents: BaseAgent[]): Promise<void> {
    const task = swarmTask.originalTask
    const votes = swarmTask.votes!

    // Collect votes from all agents
    const votePromises = agents.map(async (agent) => {
      try {
        const result = await agent.execute({ ...task, id: `${task.id}-vote-${agent.id}` })
        votes.set(agent.id, result.output)
        return { agentId: agent.id, vote: result.output }
      } catch (error) {
        votes.set(agent.id, null)
        return { agentId: agent.id, vote: null }
      }
    })

    const voteResults = await Promise.all(votePromises)
    const validVotes = voteResults.filter(v => v.vote !== null)

    this.emit('council-votes-collected', {
      taskId: swarmTask.id,
      totalVotes: voteResults.length,
      validVotes: validVotes.length,
    })

    // Determine consensus
    const consensusReached = validVotes.length / agents.length >= this.config.consensusThreshold

    if (consensusReached) {
      // Use first valid vote as consensus (in real implementation, would analyze votes)
      swarmTask.consensusResult = validVotes[0]?.vote
      swarmTask.results.set('consensus', swarmTask.consensusResult)
    } else {
      throw new Error(`Consensus not reached: ${validVotes.length}/${agents.length}`)
    }

    this.emit('council-consensus', {
      taskId: swarmTask.id,
      reached: consensusReached,
      threshold: this.config.consensusThreshold,
    })
  }

  /**
   * Watchdog Pattern: Continuous monitoring with alerts
   */
  private async executeWatchdogPattern(swarmTask: SwarmTask, agents: BaseAgent[]): Promise<void> {
    const task = swarmTask.originalTask
    const [primaryAgent, ...watchdogs] = agents

    // Start watchdog monitoring
    const watchdogInterval = setInterval(() => {
      this.performWatchdogCheck(swarmTask, watchdogs)
    }, this.config.watchdogIntervalMs)

    this.watchdogIntervals.set(swarmTask.id, watchdogInterval)

    // Execute primary task
    try {
      const result = await primaryAgent.execute(task)
      swarmTask.results.set(primaryAgent.id, result.output)
      swarmTask.results.set('primary', result.output)
    } finally {
      clearInterval(watchdogInterval)
      this.watchdogIntervals.delete(swarmTask.id)
    }

    this.emit('watchdog-completed', {
      taskId: swarmTask.id,
      primaryAgent: primaryAgent.id,
      watchdogCount: watchdogs.length,
    })
  }

  private performWatchdogCheck(swarmTask: SwarmTask, watchdogs: BaseAgent[]): void {
    this.emit('watchdog-check', {
      taskId: swarmTask.id,
      status: swarmTask.status,
      elapsed: swarmTask.startedAt ? Date.now() - swarmTask.startedAt.getTime() : 0,
    })

    // Check for timeout
    if (swarmTask.startedAt) {
      const elapsed = Date.now() - swarmTask.startedAt.getTime()
      if (elapsed > this.config.taskTimeoutMs) {
        this.emit('watchdog-alert', {
          taskId: swarmTask.id,
          type: 'timeout',
          message: `Task exceeded timeout: ${elapsed}ms`,
        })
      }
    }
  }

  /**
   * Specialist Pattern: Match specific agents to task components
   */
  private async executeSpecialistPattern(swarmTask: SwarmTask, agents: BaseAgent[]): Promise<void> {
    const task = swarmTask.originalTask

    // Find specialists for this task type
    const specialists = agents.filter(a => a.canHandle(task))

    if (specialists.length === 0) {
      throw new Error('No specialists found for task')
    }

    this.emit('specialists-identified', {
      taskId: swarmTask.id,
      count: specialists.length,
      specialists: specialists.map(s => ({ id: s.id, role: s.role })),
    })

    // Execute with best specialist
    const specialist = specialists[0]
    const result = await specialist.execute(task)

    swarmTask.results.set(specialist.id, result.output)
    swarmTask.results.set('specialist', {
      agentId: specialist.id,
      role: specialist.role,
      output: result.output,
    })

    this.emit('specialist-completed', {
      taskId: swarmTask.id,
      specialist: specialist.id,
    })
  }

  // ============================================================
  // AGENT SELECTION
  // ============================================================

  private selectAgentsForSwarm(
    task: Task,
    options: { agentIds?: string[]; teamId?: TeamId }
  ): BaseAgent[] {
    let candidates: BaseAgent[]

    if (options.agentIds && options.agentIds.length > 0) {
      // Use specified agents
      candidates = options.agentIds
        .map(id => this.agents.get(id))
        .filter((a): a is BaseAgent => a !== undefined)
    } else if (options.teamId) {
      // Use team agents
      candidates = this.getAgents().filter(a => a.team === options.teamId)
    } else {
      // Use all available agents
      candidates = this.getAvailableAgents()
    }

    // Filter by capability and limit
    const eligible = candidates
      .filter(a => a.canHandle(task))
      .slice(0, this.config.maxAgentsForSwarm)

    return eligible
  }

  // ============================================================
  // QUERIES
  // ============================================================

  getActiveSwarmTasks(): SwarmTask[] {
    return Array.from(this.activeTasks.values())
  }

  getSwarmTask(id: string): SwarmTask | undefined {
    return this.activeTasks.get(id)
  }

  // ============================================================
  // CONFIGURATION
  // ============================================================

  setConfig(config: Partial<SwarmOrchestratorConfig>): void {
    this.config = { ...this.config, ...config }
  }

  getConfig(): SwarmOrchestratorConfig {
    return { ...this.config }
  }
}

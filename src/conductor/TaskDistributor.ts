/**
 * AI Company - Task Distributor
 * 태스크 분배 및 할당 관리
 */

import { EventEmitter } from 'events'
import { v4 as uuidv4 } from 'uuid'
import { BaseAgent } from '../agents/BaseAgent'
import { Task, TaskStatus, TaskPriority, TeamId, DepartmentId } from '../types'
import { AgentScorer, AgentScore } from './AgentScorer'

export interface DistributionPolicy {
  strategy: 'best-fit' | 'round-robin' | 'least-loaded' | 'random'
  maxTasksPerAgent: number
  priorityBoost: Record<TaskPriority, number>
  teamAffinity: boolean
  departmentAffinity: boolean
}

export interface DistributionResult {
  taskId: string
  agentId: string | null
  score?: AgentScore
  reason: string
  timestamp: Date
}

export interface TaskQueue {
  pending: Task[]
  assigned: Map<string, Task>
  completed: Task[]
  failed: Task[]
}

const DEFAULT_POLICY: DistributionPolicy = {
  strategy: 'best-fit',
  maxTasksPerAgent: 3,
  priorityBoost: {
    critical: 0.3,
    high: 0.15,
    normal: 0,
    low: -0.1,
  },
  teamAffinity: true,
  departmentAffinity: false,
}

export class TaskDistributor extends EventEmitter {
  private agents: Map<string, BaseAgent> = new Map()
  private agentsByTeam: Map<TeamId, BaseAgent[]> = new Map()
  private agentsByDepartment: Map<DepartmentId, BaseAgent[]> = new Map()
  private scorer: AgentScorer
  private policy: DistributionPolicy
  private queue: TaskQueue = {
    pending: [],
    assigned: new Map(),
    completed: [],
    failed: [],
  }
  private roundRobinIndex: number = 0
  private distributionHistory: DistributionResult[] = []

  constructor(
    agents: BaseAgent[],
    policy: Partial<DistributionPolicy> = {},
    scorer?: AgentScorer
  ) {
    super()
    this.policy = { ...DEFAULT_POLICY, ...policy }
    this.scorer = scorer || new AgentScorer()

    // Register agents
    for (const agent of agents) {
      this.registerAgent(agent)
    }
  }

  // ============================================================
  // AGENT MANAGEMENT
  // ============================================================

  registerAgent(agent: BaseAgent): void {
    this.agents.set(agent.id, agent)

    // Add to team index
    const teamAgents = this.agentsByTeam.get(agent.team) || []
    teamAgents.push(agent)
    this.agentsByTeam.set(agent.team, teamAgents)

    // Add to department index
    const deptAgents = this.agentsByDepartment.get(agent.department) || []
    deptAgents.push(agent)
    this.agentsByDepartment.set(agent.department, deptAgents)
  }

  unregisterAgent(agentId: string): boolean {
    const agent = this.agents.get(agentId)
    if (!agent) return false

    this.agents.delete(agentId)

    // Remove from team index
    const teamAgents = this.agentsByTeam.get(agent.team) || []
    const teamIndex = teamAgents.findIndex(a => a.id === agentId)
    if (teamIndex !== -1) teamAgents.splice(teamIndex, 1)

    // Remove from department index
    const deptAgents = this.agentsByDepartment.get(agent.department) || []
    const deptIndex = deptAgents.findIndex(a => a.id === agentId)
    if (deptIndex !== -1) deptAgents.splice(deptIndex, 1)

    return true
  }

  getAgent(id: string): BaseAgent | undefined {
    return this.agents.get(id)
  }

  getAgentsByTeam(teamId: TeamId): BaseAgent[] {
    return this.agentsByTeam.get(teamId) || []
  }

  getAgentsByDepartment(deptId: DepartmentId): BaseAgent[] {
    return this.agentsByDepartment.get(deptId) || []
  }

  // ============================================================
  // TASK DISTRIBUTION
  // ============================================================

  /**
   * Distribute a single task
   */
  async distributeTask(task: Task): Promise<DistributionResult> {
    // Get eligible agents
    const eligibleAgents = this.getEligibleAgents(task)

    if (eligibleAgents.length === 0) {
      const result: DistributionResult = {
        taskId: task.id,
        agentId: null,
        reason: 'No eligible agents available',
        timestamp: new Date(),
      }
      this.queue.pending.push(task)
      this.distributionHistory.push(result)
      this.emit('distribution-failed', { task, result })
      return result
    }

    // Select agent based on strategy
    const selectedAgent = this.selectAgent(eligibleAgents, task)

    if (!selectedAgent) {
      const result: DistributionResult = {
        taskId: task.id,
        agentId: null,
        reason: 'No suitable agent found',
        timestamp: new Date(),
      }
      this.queue.pending.push(task)
      this.distributionHistory.push(result)
      this.emit('distribution-failed', { task, result })
      return result
    }

    // Get score for reporting
    const score = this.scorer.scoreAgent(selectedAgent, task)

    // Assign task
    await this.assignTaskToAgent(task, selectedAgent)

    const result: DistributionResult = {
      taskId: task.id,
      agentId: selectedAgent.id,
      score,
      reason: 'Successfully assigned',
      timestamp: new Date(),
    }

    this.distributionHistory.push(result)
    this.emit('task-distributed', { task, agent: selectedAgent, result })

    return result
  }

  /**
   * Distribute multiple tasks
   */
  async distributeTasks(tasks: Task[]): Promise<DistributionResult[]> {
    // Sort by priority
    const sortedTasks = [...tasks].sort((a, b) => {
      const priorityOrder: Record<TaskPriority, number> = {
        critical: 0,
        high: 1,
        normal: 2,
        low: 3,
      }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

    const results: DistributionResult[] = []

    for (const task of sortedTasks) {
      const result = await this.distributeTask(task)
      results.push(result)
    }

    return results
  }

  /**
   * Redistribute pending tasks
   */
  async redistributePending(): Promise<DistributionResult[]> {
    const pending = [...this.queue.pending]
    this.queue.pending = []

    return this.distributeTasks(pending)
  }

  // ============================================================
  // AGENT SELECTION
  // ============================================================

  private getEligibleAgents(task: Task): BaseAgent[] {
    let candidates: BaseAgent[] = []

    // Get candidates based on affinity settings
    if (this.policy.teamAffinity && task.assignedTeam) {
      candidates = this.getAgentsByTeam(task.assignedTeam)
    } else if (this.policy.departmentAffinity && task.assignedDepartment) {
      candidates = this.getAgentsByDepartment(task.assignedDepartment)
    } else {
      candidates = Array.from(this.agents.values())
    }

    // Filter by availability and workload
    return candidates.filter(agent => {
      // Check if agent is available or has capacity
      if (agent.status === 'offline' || agent.status === 'error') return false

      // Check workload limit
      if (agent.metrics.tasksInProgress >= this.policy.maxTasksPerAgent) return false

      // Check if agent can handle the task type
      if (!agent.canHandle(task)) return false

      return true
    })
  }

  private selectAgent(agents: BaseAgent[], task: Task): BaseAgent | undefined {
    switch (this.policy.strategy) {
      case 'best-fit':
        return this.selectBestFit(agents, task)
      case 'round-robin':
        return this.selectRoundRobin(agents)
      case 'least-loaded':
        return this.selectLeastLoaded(agents)
      case 'random':
        return this.selectRandom(agents)
      default:
        return this.selectBestFit(agents, task)
    }
  }

  private selectBestFit(agents: BaseAgent[], task: Task): BaseAgent | undefined {
    const ranked = this.scorer.rankAgents(agents, task)

    // Apply priority boost
    const boost = this.policy.priorityBoost[task.priority] || 0
    for (const score of ranked) {
      score.totalScore += boost
    }

    // Re-sort after boost
    ranked.sort((a, b) => b.totalScore - a.totalScore)

    if (ranked.length === 0) return undefined

    return agents.find(a => a.id === ranked[0].agentId)
  }

  private selectRoundRobin(agents: BaseAgent[]): BaseAgent | undefined {
    if (agents.length === 0) return undefined

    const agent = agents[this.roundRobinIndex % agents.length]
    this.roundRobinIndex++
    return agent
  }

  private selectLeastLoaded(agents: BaseAgent[]): BaseAgent | undefined {
    if (agents.length === 0) return undefined

    return agents.reduce((least, current) => {
      if (current.metrics.tasksInProgress < least.metrics.tasksInProgress) {
        return current
      }
      return least
    })
  }

  private selectRandom(agents: BaseAgent[]): BaseAgent | undefined {
    if (agents.length === 0) return undefined
    return agents[Math.floor(Math.random() * agents.length)]
  }

  // ============================================================
  // TASK ASSIGNMENT
  // ============================================================

  private async assignTaskToAgent(task: Task, agent: BaseAgent): Promise<void> {
    task.status = 'assigned'
    task.assignedTo = [agent.id]

    this.queue.assigned.set(task.id, task)
    await agent.assignTask(task)

    this.emit('task-assigned', { taskId: task.id, agentId: agent.id })
  }

  /**
   * Mark a task as completed
   */
  markTaskCompleted(taskId: string): void {
    const task = this.queue.assigned.get(taskId)
    if (task) {
      task.status = 'completed'
      task.completedAt = new Date()
      this.queue.assigned.delete(taskId)
      this.queue.completed.push(task)
      this.emit('task-completed', { taskId })
    }
  }

  /**
   * Mark a task as failed
   */
  markTaskFailed(taskId: string, error?: Error): void {
    const task = this.queue.assigned.get(taskId)
    if (task) {
      task.status = 'failed'
      this.queue.assigned.delete(taskId)
      this.queue.failed.push(task)
      this.emit('task-failed', { taskId, error })
    }
  }

  /**
   * Reassign a task to a different agent
   */
  async reassignTask(taskId: string, reason: string): Promise<DistributionResult | undefined> {
    const task = this.queue.assigned.get(taskId)
    if (!task) return undefined

    // Remove from current assignment
    this.queue.assigned.delete(taskId)

    // Clear current assignment
    const previousAgent = task.assignedTo?.[0]
    task.assignedTo = undefined
    task.status = 'pending'

    // Redistribute
    const result = await this.distributeTask(task)

    this.emit('task-reassigned', {
      taskId,
      previousAgent,
      newAgent: result.agentId,
      reason,
    })

    return result
  }

  // ============================================================
  // QUEUE MANAGEMENT
  // ============================================================

  getQueue(): TaskQueue {
    return {
      pending: [...this.queue.pending],
      assigned: new Map(this.queue.assigned),
      completed: [...this.queue.completed],
      failed: [...this.queue.failed],
    }
  }

  getQueueStats(): object {
    return {
      pending: this.queue.pending.length,
      assigned: this.queue.assigned.size,
      completed: this.queue.completed.length,
      failed: this.queue.failed.length,
    }
  }

  clearCompletedTasks(): number {
    const count = this.queue.completed.length
    this.queue.completed = []
    return count
  }

  clearFailedTasks(): number {
    const count = this.queue.failed.length
    this.queue.failed = []
    return count
  }

  // ============================================================
  // CONFIGURATION
  // ============================================================

  setPolicy(policy: Partial<DistributionPolicy>): void {
    this.policy = { ...this.policy, ...policy }
    this.emit('policy-updated', { policy: this.policy })
  }

  getPolicy(): DistributionPolicy {
    return { ...this.policy }
  }

  // ============================================================
  // HISTORY & ANALYTICS
  // ============================================================

  getDistributionHistory(limit?: number): DistributionResult[] {
    if (limit) {
      return this.distributionHistory.slice(-limit)
    }
    return [...this.distributionHistory]
  }

  getAgentDistributionStats(): Record<string, { assigned: number; completed: number; failed: number }> {
    const stats: Record<string, { assigned: number; completed: number; failed: number }> = {}

    for (const agent of this.agents.values()) {
      stats[agent.id] = {
        assigned: agent.metrics.tasksInProgress,
        completed: agent.metrics.tasksCompleted,
        failed: agent.metrics.tasksFailed,
      }
    }

    return stats
  }
}

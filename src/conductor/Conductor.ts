/**
 * AI Company - Conductor
 * CEO 오케스트레이터 - 회사 전체 조율 및 관리
 */

import { EventEmitter } from 'events'
import { v4 as uuidv4 } from 'uuid'
import { BaseAgent, GenericAgent, createAgentsFromConfigs } from '../agents/BaseAgent'
import { MessageBus, getMessageBus } from '../communication'
import { WorkflowEngine, createDefaultTaskExecutor, WorkflowExecution } from '../workflow'
import { AgentScorer } from './AgentScorer'
import { TaskDistributor, DistributionResult } from './TaskDistributor'
import {
  Task,
  TaskStatus,
  TaskPriority,
  TeamId,
  DepartmentId,
  Workflow,
  CompanyConfig,
  CompanyMetrics,
  DepartmentMetrics,
  TeamMetrics,
  Message,
} from '../types'
import {
  COMPANY_CONFIG,
  DEPARTMENTS,
  TEAMS,
  WORKFLOWS,
  getAllAgents,
  getTeamsByDepartment,
  getAgentsByTeam,
  getAgentsByDepartment,
} from '../config/company'

export interface ConductorConfig {
  autoDistribute: boolean
  enableEscalation: boolean
  escalationTimeoutMs: number
  maxConcurrentWorkflows: number
  enableMetrics: boolean
  logLevel: 'none' | 'info' | 'debug'
}

export interface ConductorState {
  isRunning: boolean
  agentCount: number
  activeTaskCount: number
  activeWorkflowCount: number
  uptime: number
  startedAt?: Date
}

const DEFAULT_CONFIG: ConductorConfig = {
  autoDistribute: true,
  enableEscalation: true,
  escalationTimeoutMs: 60 * 60 * 1000, // 1 hour
  maxConcurrentWorkflows: 10,
  enableMetrics: true,
  logLevel: 'info',
}

export class Conductor extends EventEmitter {
  // Core components
  private agents: Map<string, BaseAgent> = new Map()
  private agentsByTeam: Map<TeamId, BaseAgent[]> = new Map()
  private agentsByDepartment: Map<DepartmentId, BaseAgent[]> = new Map()
  private messageBus: MessageBus
  private workflowEngine: WorkflowEngine
  private taskDistributor: TaskDistributor
  private agentScorer: AgentScorer

  // Configuration
  private config: ConductorConfig
  private companyConfig: CompanyConfig

  // State
  private isRunning: boolean = false
  private startedAt?: Date
  private tasks: Map<string, Task> = new Map()
  private escalationTimers: Map<string, NodeJS.Timeout> = new Map()

  constructor(config: Partial<ConductorConfig> = {}) {
    super()
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.companyConfig = COMPANY_CONFIG
    this.messageBus = getMessageBus()
    this.agentScorer = new AgentScorer()

    // Initialize agents
    this.initializeAgents()

    // Initialize task distributor
    this.taskDistributor = new TaskDistributor(
      Array.from(this.agents.values()),
      { strategy: 'best-fit', teamAffinity: true }
    )

    // Initialize workflow engine
    this.workflowEngine = new WorkflowEngine(
      this.createTaskExecutor(),
      { maxConcurrentExecutions: this.config.maxConcurrentWorkflows }
    )

    // Register workflows
    this.workflowEngine.registerWorkflows(WORKFLOWS)

    // Set up event handlers
    this.setupEventHandlers()
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================

  private initializeAgents(): void {
    const agentConfigs = getAllAgents()

    for (const config of agentConfigs) {
      const agent = new GenericAgent(config)
      this.agents.set(agent.id, agent)

      // Add to team index
      if (!this.agentsByTeam.has(agent.team)) {
        this.agentsByTeam.set(agent.team, [])
      }
      this.agentsByTeam.get(agent.team)!.push(agent)

      // Add to department index
      if (!this.agentsByDepartment.has(agent.department)) {
        this.agentsByDepartment.set(agent.department, [])
      }
      this.agentsByDepartment.get(agent.department)!.push(agent)
    }

    this.log('info', `Initialized ${this.agents.size} agents`)
  }

  private setupEventHandlers(): void {
    // Task distributor events
    this.taskDistributor.on('task-distributed', ({ task, agent }) => {
      this.log('debug', `Task ${task.id} distributed to ${agent.id}`)
      this.emit('task-distributed', { taskId: task.id, agentId: agent.id })
    })

    this.taskDistributor.on('task-completed', ({ taskId }) => {
      this.handleTaskCompleted(taskId)
    })

    this.taskDistributor.on('task-failed', ({ taskId, error }) => {
      this.handleTaskFailed(taskId, error)
    })

    // Workflow engine events
    this.workflowEngine.on('execution-started', ({ executionId, workflowId }) => {
      this.log('info', `Workflow ${workflowId} started (${executionId})`)
      this.emit('workflow-started', { executionId, workflowId })
    })

    this.workflowEngine.on('execution-completed', ({ executionId, workflowId, status }) => {
      this.log('info', `Workflow ${workflowId} ${status} (${executionId})`)
      this.emit('workflow-completed', { executionId, workflowId, status })
    })
  }

  private createTaskExecutor() {
    return async (task: Task, teams: TeamId[]): Promise<Task> => {
      // Find best agent for the task
      const candidates = teams.flatMap(t => this.agentsByTeam.get(t) || [])
      const agent = this.agentScorer.findBestAgent(candidates, task)

      if (!agent) {
        task.status = 'failed'
        return task
      }

      // Execute task
      try {
        const result = await agent.execute(task)
        return result
      } catch (error) {
        task.status = 'failed'
        task.output = { error: String(error) }
        return task
      }
    }
  }

  // ============================================================
  // LIFECYCLE
  // ============================================================

  start(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.startedAt = new Date()

    this.log('info', '🏢 AI Nexus Corporation started')
    this.emit('started', { timestamp: this.startedAt })
  }

  stop(): void {
    if (!this.isRunning) return

    // Clear all escalation timers
    for (const timer of this.escalationTimers.values()) {
      clearTimeout(timer)
    }
    this.escalationTimers.clear()

    this.isRunning = false
    this.log('info', '🏢 AI Nexus Corporation stopped')
    this.emit('stopped', { timestamp: new Date() })
  }

  getState(): ConductorState {
    return {
      isRunning: this.isRunning,
      agentCount: this.agents.size,
      activeTaskCount: this.tasks.size,
      activeWorkflowCount: this.workflowEngine.getRunningExecutions().length,
      uptime: this.startedAt ? Date.now() - this.startedAt.getTime() : 0,
      startedAt: this.startedAt,
    }
  }

  // ============================================================
  // AGENT ACCESS
  // ============================================================

  getAgent(id: string): BaseAgent | undefined {
    return this.agents.get(id)
  }

  getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values())
  }

  getAgentsByTeam(teamId: TeamId): BaseAgent[] {
    return this.agentsByTeam.get(teamId) || []
  }

  getAgentsByDepartment(deptId: DepartmentId): BaseAgent[] {
    return this.agentsByDepartment.get(deptId) || []
  }

  getAvailableAgents(): BaseAgent[] {
    return this.getAllAgents().filter(a => a.isAvailable())
  }

  // ============================================================
  // TASK MANAGEMENT
  // ============================================================

  /**
   * Create and distribute a new task
   */
  async createTask(
    type: Task['type'],
    title: string,
    description: string,
    options: {
      priority?: TaskPriority
      assignedTeam?: TeamId
      assignedDepartment?: DepartmentId
      input?: unknown
      dueDate?: Date
    } = {}
  ): Promise<Task> {
    const task: Task = {
      id: uuidv4(),
      type,
      title,
      description,
      status: 'pending',
      priority: options.priority || 'normal',
      assignedTeam: options.assignedTeam,
      assignedDepartment: options.assignedDepartment,
      input: options.input,
      dueDate: options.dueDate,
      createdAt: new Date(),
    }

    this.tasks.set(task.id, task)

    // Auto-distribute if enabled
    if (this.config.autoDistribute) {
      await this.distributeTask(task)
    }

    // Set up escalation timer if enabled
    if (this.config.enableEscalation) {
      this.setupEscalationTimer(task)
    }

    this.emit('task-created', { taskId: task.id, type, priority: task.priority })
    return task
  }

  /**
   * Distribute a task to an agent
   */
  async distributeTask(task: Task): Promise<DistributionResult> {
    return this.taskDistributor.distributeTask(task)
  }

  /**
   * Get task by ID
   */
  getTask(id: string): Task | undefined {
    return this.tasks.get(id)
  }

  /**
   * Get all tasks
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values())
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: TaskStatus): Task[] {
    return this.getAllTasks().filter(t => t.status === status)
  }

  private handleTaskCompleted(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (task) {
      task.status = 'completed'
      task.completedAt = new Date()

      // Clear escalation timer
      const timer = this.escalationTimers.get(taskId)
      if (timer) {
        clearTimeout(timer)
        this.escalationTimers.delete(taskId)
      }
    }

    this.log('info', `Task ${taskId} completed`)
    this.emit('task-completed', { taskId })
  }

  private handleTaskFailed(taskId: string, error?: Error): void {
    const task = this.tasks.get(taskId)
    if (task) {
      task.status = 'failed'
    }

    this.log('info', `Task ${taskId} failed: ${error?.message || 'Unknown error'}`)
    this.emit('task-failed', { taskId, error })
  }

  // ============================================================
  // ESCALATION
  // ============================================================

  private setupEscalationTimer(task: Task): void {
    const timer = setTimeout(() => {
      this.escalateTask(task.id, 'Timeout exceeded')
    }, this.config.escalationTimeoutMs)

    this.escalationTimers.set(task.id, timer)
  }

  /**
   * Escalate a task
   */
  async escalateTask(taskId: string, reason: string): Promise<void> {
    const task = this.tasks.get(taskId)
    if (!task) return

    task.status = 'blocked'

    // Determine escalation targets
    const escalationTargets = this.getEscalationTargets(task)

    // Send escalation messages
    for (const targetId of escalationTargets) {
      await this.messageBus.sendEscalation(
        'conductor',
        targetId,
        `Escalation: Task ${task.title}`,
        reason,
        taskId
      )
    }

    this.log('info', `Task ${taskId} escalated: ${reason}`)
    this.emit('task-escalated', { taskId, reason, targets: escalationTargets })
  }

  private getEscalationTargets(task: Task): string[] {
    const targets: string[] = []

    // Get team lead
    if (task.assignedTeam) {
      const teamAgents = this.agentsByTeam.get(task.assignedTeam) || []
      const lead = teamAgents.find(a => a.role.includes('lead'))
      if (lead) targets.push(lead.id)
    }

    // Get department head
    if (task.assignedDepartment) {
      const dept = DEPARTMENTS.find(d => d.id === task.assignedDepartment)
      if (dept) {
        const head = this.getAllAgents().find(a => a.role === dept.head)
        if (head) targets.push(head.id)
      }
    }

    // Add CTO for technical tasks, COO for operations
    if (['feature-development', 'bug-fix', 'code-review'].includes(task.type)) {
      const cto = this.getAllAgents().find(a => a.role === 'cto')
      if (cto) targets.push(cto.id)
    } else {
      const coo = this.getAllAgents().find(a => a.role === 'coo')
      if (coo) targets.push(coo.id)
    }

    return [...new Set(targets)] // Remove duplicates
  }

  // ============================================================
  // WORKFLOW EXECUTION
  // ============================================================

  /**
   * Execute a workflow by ID
   */
  async executeWorkflow(workflowId: string, input?: unknown): Promise<WorkflowExecution> {
    return this.workflowEngine.execute(workflowId, input)
  }

  /**
   * Get workflow execution status
   */
  getWorkflowExecution(executionId: string): WorkflowExecution | undefined {
    return this.workflowEngine.getExecution(executionId)
  }

  /**
   * Get all workflow executions
   */
  getAllWorkflowExecutions(): WorkflowExecution[] {
    return this.workflowEngine.getAllExecutions()
  }

  // ============================================================
  // COMMUNICATION
  // ============================================================

  /**
   * Send a broadcast message to all agents
   */
  async broadcast(subject: string, content: string): Promise<void> {
    await this.messageBus.broadcast('conductor', subject, content, { priority: 'high' })
  }

  /**
   * Send a direct message to an agent
   */
  async sendMessage(agentId: string, subject: string, content: string): Promise<void> {
    await this.messageBus.sendDirect('conductor', agentId, subject, content)
  }

  // ============================================================
  // METRICS
  // ============================================================

  /**
   * Get company-wide metrics
   */
  getCompanyMetrics(): CompanyMetrics {
    const allTasks = this.getAllTasks()
    const completedTasks = allTasks.filter(t => t.status === 'completed')
    const inProgressTasks = allTasks.filter(t => t.status === 'in_progress')

    // Calculate average completion time
    let avgCompletionTime = 0
    const completedWithTime = completedTasks.filter(t => t.startedAt && t.completedAt)
    if (completedWithTime.length > 0) {
      const totalTime = completedWithTime.reduce((sum, t) => {
        return sum + (t.completedAt!.getTime() - t.startedAt!.getTime())
      }, 0)
      avgCompletionTime = totalTime / completedWithTime.length
    }

    // Calculate success rate
    const failedTasks = allTasks.filter(t => t.status === 'failed')
    const totalFinished = completedTasks.length + failedTasks.length
    const successRate = totalFinished > 0 ? (completedTasks.length / totalFinished) * 100 : 100

    // Get department metrics
    const departmentMetrics: Record<DepartmentId, DepartmentMetrics> = {} as Record<DepartmentId, DepartmentMetrics>
    for (const dept of DEPARTMENTS) {
      departmentMetrics[dept.id] = this.getDepartmentMetrics(dept.id)
    }

    return {
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      inProgressTasks: inProgressTasks.length,
      avgCompletionTime,
      successRate,
      activeAgents: this.getAvailableAgents().length,
      departmentMetrics,
    }
  }

  /**
   * Get department metrics
   */
  getDepartmentMetrics(deptId: DepartmentId): DepartmentMetrics {
    const agents = this.agentsByDepartment.get(deptId) || []
    const teams = getTeamsByDepartment(deptId)

    const teamPerformance: Record<TeamId, TeamMetrics> = {} as Record<TeamId, TeamMetrics>
    let totalCompleted = 0
    let totalResponseTime = 0
    let responseCount = 0

    for (const team of teams) {
      const teamMetrics = this.getTeamMetrics(team.id)
      teamPerformance[team.id] = teamMetrics
      totalCompleted += teamMetrics.tasksCompleted

      if (teamMetrics.avgCompletionTime > 0) {
        totalResponseTime += teamMetrics.avgCompletionTime
        responseCount++
      }
    }

    return {
      tasksCompleted: totalCompleted,
      avgResponseTime: responseCount > 0 ? totalResponseTime / responseCount : 0,
      teamPerformance,
    }
  }

  /**
   * Get team metrics
   */
  getTeamMetrics(teamId: TeamId): TeamMetrics {
    const agents = this.agentsByTeam.get(teamId) || []

    let tasksCompleted = 0
    let tasksInProgress = 0
    let tasksFailed = 0
    let totalCompletionTime = 0
    let completionCount = 0

    for (const agent of agents) {
      tasksCompleted += agent.metrics.tasksCompleted
      tasksInProgress += agent.metrics.tasksInProgress
      tasksFailed += agent.metrics.tasksFailed

      if (agent.metrics.avgCompletionTime > 0) {
        totalCompletionTime += agent.metrics.avgCompletionTime
        completionCount++
      }
    }

    const avgCompletionTime = completionCount > 0 ? totalCompletionTime / completionCount : 0
    const busyAgents = agents.filter(a => a.isBusy()).length
    const agentUtilization = agents.length > 0 ? (busyAgents / agents.length) * 100 : 0

    return {
      tasksCompleted,
      tasksInProgress,
      tasksFailed,
      avgCompletionTime,
      agentUtilization,
    }
  }

  // ============================================================
  // DISPLAY
  // ============================================================

  /**
   * Print company status to console
   */
  printStatus(): void {
    const state = this.getState()
    const metrics = this.getCompanyMetrics()

    console.log('\n🏢 AI Nexus Corporation')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📊 Departments: ${DEPARTMENTS.length}`)
    console.log(`👥 Teams: ${TEAMS.length}`)
    console.log(`🤖 Agents: ${this.agents.size}`)
    console.log(`⚡ Workflows: ${WORKFLOWS.length}`)
    console.log('')
    console.log('Department Status:')

    for (const dept of DEPARTMENTS) {
      const agents = this.agentsByDepartment.get(dept.id) || []
      const available = agents.filter(a => a.isAvailable()).length
      const status = available > 0 ? '✅' : '🔄'
      console.log(`├── ${dept.name} (${agents.length} agents) ${status}`)
    }

    console.log('')
    console.log(`Status: ${state.isRunning ? '🟢 Running' : '🔴 Stopped'}`)
    console.log(`Active Tasks: ${state.activeTaskCount}`)
    console.log(`Active Workflows: ${state.activeWorkflowCount}`)
    console.log(`Success Rate: ${metrics.successRate.toFixed(1)}%`)
    console.log('')
    console.log('Ready to execute workflows...')
  }

  // ============================================================
  // LOGGING
  // ============================================================

  private log(level: 'info' | 'debug', message: string): void {
    if (this.config.logLevel === 'none') return
    if (this.config.logLevel === 'info' && level === 'debug') return

    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] [Conductor] ${message}`)
  }
}

// ============================================================
// SINGLETON
// ============================================================

let conductorInstance: Conductor | null = null

export function getConductor(config?: Partial<ConductorConfig>): Conductor {
  if (!conductorInstance) {
    conductorInstance = new Conductor(config)
  }
  return conductorInstance
}

export function resetConductor(): void {
  if (conductorInstance) {
    conductorInstance.stop()
    conductorInstance = null
  }
}

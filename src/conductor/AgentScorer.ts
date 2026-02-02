/**
 * AI Company - Agent Scorer
 * 에이전트 점수 및 매칭 알고리즘
 */

import { BaseAgent } from '../agents/BaseAgent'
import { Task, AgentCapability, TaskType } from '../types'

export interface ScoringWeights {
  capabilityMatch: number    // 40%
  skillMatch: number         // 25%
  availability: number       // 20%
  workloadBalance: number    // 10%
  successRate: number        // 5%
}

export interface AgentScore {
  agentId: string
  totalScore: number
  breakdown: {
    capabilityMatch: number
    skillMatch: number
    availability: number
    workloadBalance: number
    successRate: number
  }
  rank: number
}

export interface TaskRequirements {
  requiredCapabilities: AgentCapability[]
  preferredSkills: string[]
  priority: 'critical' | 'high' | 'normal' | 'low'
  estimatedDuration?: number
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  capabilityMatch: 0.40,
  skillMatch: 0.25,
  availability: 0.20,
  workloadBalance: 0.10,
  successRate: 0.05,
}

// Mapping of task types to required capabilities
const TASK_CAPABILITY_MAP: Record<TaskType, AgentCapability[]> = {
  'feature-development': ['coding'],
  'bug-fix': ['coding', 'analysis'],
  'code-review': ['review', 'coding'],
  'refactoring': ['coding', 'analysis'],
  'testing': ['testing'],
  'deployment': ['deployment'],
  'ui-design': ['design'],
  'ux-research': ['research', 'analysis'],
  'brand-design': ['design', 'creativity'],
  'documentation': ['writing'],
  'copywriting': ['writing', 'creativity'],
  'translation': ['writing'],
  'code-analysis': ['analysis', 'coding'],
  'security-audit': ['security', 'analysis'],
  'performance-analysis': ['analysis'],
  'market-research': ['research', 'analysis'],
  'sprint-planning': ['planning'],
  'roadmap': ['planning'],
  'architecture-design': ['planning', 'coding'],
  'incident-response': ['analysis', 'coding'],
  'support-ticket': ['communication'],
  'onboarding': ['communication', 'writing'],
  'custom': [],
}

// Mapping of task types to preferred skills
const TASK_SKILL_MAP: Record<TaskType, string[]> = {
  'feature-development': ['system-design', 'api-design'],
  'bug-fix': ['debugging', 'troubleshooting'],
  'code-review': ['code-review', 'best-practices'],
  'refactoring': ['design-patterns', 'clean-code'],
  'testing': ['test-automation', 'test-case-design'],
  'deployment': ['ci-cd', 'kubernetes'],
  'ui-design': ['ui-design', 'figma'],
  'ux-research': ['user-research', 'usability-testing'],
  'brand-design': ['brand-identity', 'visual-design'],
  'documentation': ['technical-writing', 'api-docs'],
  'copywriting': ['marketing-copy', 'storytelling'],
  'translation': ['localization', 'cultural-adaptation'],
  'code-analysis': ['static-analysis', 'code-quality'],
  'security-audit': ['vulnerability-assessment', 'penetration-testing'],
  'performance-analysis': ['profiling', 'optimization'],
  'market-research': ['market-analysis', 'competitive-intelligence'],
  'sprint-planning': ['agile', 'scrum'],
  'roadmap': ['product-strategy', 'prioritization'],
  'architecture-design': ['system-architecture', 'design-patterns'],
  'incident-response': ['incident-management', 'root-cause-analysis'],
  'support-ticket': ['customer-service', 'troubleshooting'],
  'onboarding': ['training', 'documentation'],
  'custom': [],
}

export class AgentScorer {
  private weights: ScoringWeights

  constructor(weights: Partial<ScoringWeights> = {}) {
    this.weights = { ...DEFAULT_WEIGHTS, ...weights }

    // Normalize weights to sum to 1
    const total = Object.values(this.weights).reduce((a, b) => a + b, 0)
    for (const key of Object.keys(this.weights) as (keyof ScoringWeights)[]) {
      this.weights[key] /= total
    }
  }

  /**
   * Score a single agent for a task
   */
  scoreAgent(agent: BaseAgent, task: Task): AgentScore {
    const requirements = this.getTaskRequirements(task)

    const breakdown = {
      capabilityMatch: this.calculateCapabilityScore(agent, requirements),
      skillMatch: this.calculateSkillScore(agent, requirements),
      availability: this.calculateAvailabilityScore(agent),
      workloadBalance: this.calculateWorkloadScore(agent),
      successRate: this.calculateSuccessRateScore(agent),
    }

    const totalScore =
      breakdown.capabilityMatch * this.weights.capabilityMatch +
      breakdown.skillMatch * this.weights.skillMatch +
      breakdown.availability * this.weights.availability +
      breakdown.workloadBalance * this.weights.workloadBalance +
      breakdown.successRate * this.weights.successRate

    return {
      agentId: agent.id,
      totalScore,
      breakdown,
      rank: 0, // Will be set when ranking multiple agents
    }
  }

  /**
   * Score and rank multiple agents for a task
   */
  rankAgents(agents: BaseAgent[], task: Task): AgentScore[] {
    const scores = agents.map(agent => this.scoreAgent(agent, task))

    // Sort by total score descending
    scores.sort((a, b) => b.totalScore - a.totalScore)

    // Assign ranks
    scores.forEach((score, index) => {
      score.rank = index + 1
    })

    return scores
  }

  /**
   * Find the best agent for a task
   */
  findBestAgent(agents: BaseAgent[], task: Task): BaseAgent | undefined {
    const ranked = this.rankAgents(agents, task)

    if (ranked.length === 0) return undefined

    const bestScore = ranked[0]
    return agents.find(a => a.id === bestScore.agentId)
  }

  /**
   * Find multiple suitable agents for a task
   */
  findSuitableAgents(
    agents: BaseAgent[],
    task: Task,
    options: { minScore?: number; maxAgents?: number } = {}
  ): BaseAgent[] {
    const { minScore = 0.5, maxAgents = 5 } = options
    const ranked = this.rankAgents(agents, task)

    const suitable = ranked
      .filter(score => score.totalScore >= minScore)
      .slice(0, maxAgents)

    return suitable
      .map(score => agents.find(a => a.id === score.agentId))
      .filter((a): a is BaseAgent => a !== undefined)
  }

  /**
   * Get requirements for a task type
   */
  getTaskRequirements(task: Task): TaskRequirements {
    return {
      requiredCapabilities: TASK_CAPABILITY_MAP[task.type] || [],
      preferredSkills: TASK_SKILL_MAP[task.type] || [],
      priority: task.priority,
      estimatedDuration: task.estimatedHours,
    }
  }

  // ============================================================
  // SCORING CALCULATIONS
  // ============================================================

  private calculateCapabilityScore(agent: BaseAgent, requirements: TaskRequirements): number {
    if (requirements.requiredCapabilities.length === 0) return 1.0

    const matched = requirements.requiredCapabilities.filter(cap =>
      agent.hasCapability(cap)
    )

    return matched.length / requirements.requiredCapabilities.length
  }

  private calculateSkillScore(agent: BaseAgent, requirements: TaskRequirements): number {
    if (requirements.preferredSkills.length === 0) return 1.0

    const matched = requirements.preferredSkills.filter(skill =>
      agent.hasSkill(skill)
    )

    return matched.length / requirements.preferredSkills.length
  }

  private calculateAvailabilityScore(agent: BaseAgent): number {
    if (agent.isAvailable()) return 1.0
    if (agent.status === 'waiting') return 0.5
    if (agent.status === 'working') return 0.25
    return 0.0 // blocked, error, offline
  }

  private calculateWorkloadScore(agent: BaseAgent): number {
    const metrics = agent.metrics
    const tasksInProgress = metrics.tasksInProgress

    // Lower workload = higher score
    if (tasksInProgress === 0) return 1.0
    if (tasksInProgress === 1) return 0.8
    if (tasksInProgress === 2) return 0.6
    if (tasksInProgress === 3) return 0.4
    return 0.2
  }

  private calculateSuccessRateScore(agent: BaseAgent): number {
    const metrics = agent.metrics
    const total = metrics.tasksCompleted + metrics.tasksFailed

    if (total === 0) return 0.8 // Default score for new agents

    return metrics.successRate / 100
  }

  // ============================================================
  // CONFIGURATION
  // ============================================================

  setWeights(weights: Partial<ScoringWeights>): void {
    this.weights = { ...this.weights, ...weights }

    // Normalize
    const total = Object.values(this.weights).reduce((a, b) => a + b, 0)
    for (const key of Object.keys(this.weights) as (keyof ScoringWeights)[]) {
      this.weights[key] /= total
    }
  }

  getWeights(): ScoringWeights {
    return { ...this.weights }
  }
}

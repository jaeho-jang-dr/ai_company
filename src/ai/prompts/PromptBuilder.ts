/**
 * AI Company - Prompt Builder
 * 프롬프트 조합 및 빌드
 */

import { AgentRole, DepartmentId, TaskType, TaskPriority, Task } from '../../types'
import {
  getAgentSystemPrompt,
  getDepartmentPrompt,
  getRolePrompt,
  BASE_SYSTEM_PROMPT,
} from './SystemPrompts'
import {
  getTaskTypePrompt,
  getPriorityContext,
  getOutputFormat,
  getCollaborationPrompt,
  OUTPUT_FORMATS,
} from './TaskPrompts'
import { AIMessage } from '../types'

// ============================================================
// PROMPT BUILDER OPTIONS
// ============================================================

export interface PromptBuilderOptions {
  /** Include base system prompt */
  includeBase?: boolean
  /** Include department context */
  includeDepartment?: boolean
  /** Include role context */
  includeRole?: boolean
  /** Include task type context */
  includeTaskType?: boolean
  /** Include priority context */
  includePriority?: boolean
  /** Output format */
  outputFormat?: keyof typeof OUTPUT_FORMATS
  /** Collaboration type */
  collaborationType?: 'handoff' | 'escalation' | 'collaboration'
  /** Additional context */
  additionalContext?: string
  /** Max prompt length (characters) */
  maxLength?: number
}

// ============================================================
// PROMPT BUILDER CLASS
// ============================================================

export class PromptBuilder {
  private parts: string[] = []
  private options: PromptBuilderOptions

  constructor(options: PromptBuilderOptions = {}) {
    this.options = {
      includeBase: true,
      includeDepartment: true,
      includeRole: true,
      includeTaskType: true,
      includePriority: true,
      ...options,
    }
  }

  /**
   * Add base system prompt
   */
  withBase(): PromptBuilder {
    this.parts.push(BASE_SYSTEM_PROMPT)
    return this
  }

  /**
   * Add department context
   */
  withDepartment(department: DepartmentId): PromptBuilder {
    const prompt = getDepartmentPrompt(department)
    if (prompt) {
      this.parts.push(`## 부서 컨텍스트\n${prompt}`)
    }
    return this
  }

  /**
   * Add role context
   */
  withRole(role: AgentRole): PromptBuilder {
    const prompt = getRolePrompt(role)
    if (prompt) {
      this.parts.push(`## 역할 컨텍스트\n${prompt}`)
    }
    return this
  }

  /**
   * Add agent context (combines department and role)
   */
  withAgent(role: AgentRole, department: DepartmentId): PromptBuilder {
    const prompt = getAgentSystemPrompt(role, department)
    this.parts.push(prompt)
    return this
  }

  /**
   * Add task type context
   */
  withTaskType(type: TaskType): PromptBuilder {
    const prompt = getTaskTypePrompt(type)
    if (prompt) {
      this.parts.push(prompt)
    }
    return this
  }

  /**
   * Add priority context
   */
  withPriority(priority: TaskPriority): PromptBuilder {
    const context = getPriorityContext(priority)
    if (context) {
      this.parts.push(`## 우선순위\n${context}`)
    }
    return this
  }

  /**
   * Add output format
   */
  withOutputFormat(format: keyof typeof OUTPUT_FORMATS): PromptBuilder {
    const template = getOutputFormat(format)
    if (template) {
      this.parts.push(`## 응답 형식\n다음 형식으로 응답해주세요:\n\n${template}`)
    }
    return this
  }

  /**
   * Add collaboration context
   */
  withCollaboration(type: 'handoff' | 'escalation' | 'collaboration'): PromptBuilder {
    const prompt = getCollaborationPrompt(type)
    if (prompt) {
      this.parts.push(prompt)
    }
    return this
  }

  /**
   * Add task details
   */
  withTask(task: Partial<Task>): PromptBuilder {
    const taskSection = [
      '## 태스크 정보',
      `- **ID**: ${task.id || 'N/A'}`,
      `- **제목**: ${task.title || 'N/A'}`,
      `- **유형**: ${task.type || 'N/A'}`,
      `- **우선순위**: ${task.priority || 'N/A'}`,
      `- **상태**: ${task.status || 'N/A'}`,
    ]

    if (task.description) {
      taskSection.push(`\n### 설명\n${task.description}`)
    }

    if (task.requirements && task.requirements.length > 0) {
      taskSection.push('\n### 요구사항')
      task.requirements.forEach((req, i) => {
        taskSection.push(`${i + 1}. ${req}`)
      })
    }

    if (task.acceptanceCriteria && task.acceptanceCriteria.length > 0) {
      taskSection.push('\n### 인수 기준')
      task.acceptanceCriteria.forEach((criteria, i) => {
        taskSection.push(`${i + 1}. ${criteria}`)
      })
    }

    this.parts.push(taskSection.join('\n'))
    return this
  }

  /**
   * Add custom section
   */
  withCustom(title: string, content: string): PromptBuilder {
    this.parts.push(`## ${title}\n${content}`)
    return this
  }

  /**
   * Add raw text
   */
  withRaw(text: string): PromptBuilder {
    this.parts.push(text)
    return this
  }

  /**
   * Add context from previous messages
   */
  withMessageContext(messages: AIMessage[], maxMessages: number = 5): PromptBuilder {
    if (messages.length === 0) return this

    const recentMessages = messages.slice(-maxMessages)
    const contextSection = ['## 이전 컨텍스트']

    recentMessages.forEach(msg => {
      const roleLabel = msg.role === 'user' ? '사용자' : msg.role === 'assistant' ? '어시스턴트' : '시스템'
      const truncatedContent = msg.content.length > 500
        ? msg.content.substring(0, 500) + '...'
        : msg.content
      contextSection.push(`\n**${roleLabel}**: ${truncatedContent}`)
    })

    this.parts.push(contextSection.join('\n'))
    return this
  }

  /**
   * Add instructions
   */
  withInstructions(instructions: string[]): PromptBuilder {
    const section = ['## 지시사항']
    instructions.forEach((instruction, i) => {
      section.push(`${i + 1}. ${instruction}`)
    })
    this.parts.push(section.join('\n'))
    return this
  }

  /**
   * Add constraints
   */
  withConstraints(constraints: string[]): PromptBuilder {
    const section = ['## 제약사항']
    constraints.forEach((constraint, i) => {
      section.push(`${i + 1}. ${constraint}`)
    })
    this.parts.push(section.join('\n'))
    return this
  }

  /**
   * Add examples
   */
  withExamples(examples: Array<{ input: string; output: string }>): PromptBuilder {
    const section = ['## 예시']
    examples.forEach((example, i) => {
      section.push(`\n### 예시 ${i + 1}`)
      section.push(`**입력**: ${example.input}`)
      section.push(`**출력**: ${example.output}`)
    })
    this.parts.push(section.join('\n'))
    return this
  }

  /**
   * Build the final prompt
   */
  build(): string {
    let prompt = this.parts.join('\n\n')

    // Truncate if needed
    if (this.options.maxLength && prompt.length > this.options.maxLength) {
      prompt = prompt.substring(0, this.options.maxLength - 3) + '...'
    }

    return prompt
  }

  /**
   * Build as system message
   */
  buildAsSystemMessage(): AIMessage {
    return {
      role: 'system',
      content: this.build(),
    }
  }

  /**
   * Reset builder
   */
  reset(): PromptBuilder {
    this.parts = []
    return this
  }

  /**
   * Get current parts count
   */
  getPartsCount(): number {
    return this.parts.length
  }

  /**
   * Get estimated token count (rough approximation)
   */
  getEstimatedTokens(): number {
    const content = this.parts.join('\n\n')
    // Rough approximation: 1 token ≈ 4 characters for English, 2-3 for Korean
    return Math.ceil(content.length / 3)
  }
}

// ============================================================
// BUILDER FACTORY FUNCTIONS
// ============================================================

/**
 * Create prompt for agent task execution
 */
export function buildAgentTaskPrompt(
  role: AgentRole,
  department: DepartmentId,
  task: Partial<Task>,
  options?: PromptBuilderOptions
): string {
  const builder = new PromptBuilder(options)
    .withAgent(role, department)
    .withTask(task)

  if (task.type) {
    builder.withTaskType(task.type)
  }

  if (task.priority) {
    builder.withPriority(task.priority)
  }

  if (options?.outputFormat) {
    builder.withOutputFormat(options.outputFormat)
  }

  if (options?.collaborationType) {
    builder.withCollaboration(options.collaborationType)
  }

  if (options?.additionalContext) {
    builder.withCustom('추가 컨텍스트', options.additionalContext)
  }

  return builder.build()
}

/**
 * Create simple task prompt
 */
export function buildSimpleTaskPrompt(
  taskDescription: string,
  context?: string
): string {
  const builder = new PromptBuilder()
    .withBase()
    .withCustom('태스크', taskDescription)

  if (context) {
    builder.withCustom('컨텍스트', context)
  }

  return builder.build()
}

/**
 * Create analysis prompt
 */
export function buildAnalysisPrompt(
  subject: string,
  analysisType: 'code' | 'architecture' | 'performance' | 'security' | 'general',
  context?: string
): string {
  const analysisInstructions: Record<string, string[]> = {
    code: [
      '코드 품질을 분석합니다',
      '잠재적 버그나 이슈를 식별합니다',
      '개선점을 제안합니다',
      '베스트 프랙티스 준수 여부를 확인합니다',
    ],
    architecture: [
      '아키텍처 패턴을 분석합니다',
      '확장성과 유지보수성을 평가합니다',
      '의존성 관계를 파악합니다',
      '개선 방향을 제안합니다',
    ],
    performance: [
      '성능 병목 지점을 식별합니다',
      '리소스 사용량을 분석합니다',
      '최적화 방안을 제안합니다',
      '벤치마크 결과를 분석합니다',
    ],
    security: [
      '보안 취약점을 식별합니다',
      '보안 베스트 프랙티스 준수를 확인합니다',
      '리스크를 평가합니다',
      '보안 강화 방안을 제안합니다',
    ],
    general: [
      '전반적인 상태를 분석합니다',
      '주요 특징을 파악합니다',
      '개선점을 식별합니다',
      '권고사항을 제시합니다',
    ],
  }

  return new PromptBuilder()
    .withBase()
    .withCustom('분석 대상', subject)
    .withInstructions(analysisInstructions[analysisType] || analysisInstructions.general)
    .withOutputFormat('analysis')
    .withRaw(context ? `\n## 추가 컨텍스트\n${context}` : '')
    .build()
}

/**
 * Create review prompt
 */
export function buildReviewPrompt(
  subject: string,
  reviewCriteria: string[],
  context?: string
): string {
  return new PromptBuilder()
    .withBase()
    .withCustom('리뷰 대상', subject)
    .withInstructions([
      '제공된 기준에 따라 리뷰합니다',
      '구체적인 피드백을 제공합니다',
      '개선 방안을 제안합니다',
    ])
    .withCustom('리뷰 기준', reviewCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n'))
    .withOutputFormat('review')
    .withRaw(context ? `\n## 추가 컨텍스트\n${context}` : '')
    .build()
}

// ============================================================
// EXPORTS
// ============================================================

export {
  getAgentSystemPrompt,
  getDepartmentPrompt,
  getRolePrompt,
  getTaskTypePrompt,
  getPriorityContext,
  getOutputFormat,
  getCollaborationPrompt,
}

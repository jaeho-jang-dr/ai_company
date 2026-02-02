/**
 * AI Company - Core Type Definitions
 * 클로드 코드와 에이전틱 코딩 기반 AI 조직
 */

// ============================================================
// ORGANIZATION STRUCTURE
// ============================================================

export type DepartmentId =
  | 'executive'          // 경영진
  | 'planning'           // 기획
  | 'engineering'        // 엔지니어링
  | 'creative'           // 크리에이티브
  | 'operations'         // 운영
  | 'research'           // 연구개발
  | 'sales'              // 영업/마케팅
  | 'hr'                 // 인사
  | 'corporate-services' // 경영지원
  | 'external-affairs'   // 대외협력

export type TeamId =
  // Executive Teams
  | 'c-suite'
  | 'secretariat'
  | 'strategy'
  // Planning Teams (기획)
  | 'product-planning'
  | 'business-planning'
  | 'data-analytics'
  // Finance Teams
  | 'financial-planning'
  | 'accounting'
  | 'treasury'
  // Legal Teams
  | 'corporate-legal'
  | 'compliance'
  | 'intellectual-property'
  // Engineering Teams
  | 'backend'
  | 'frontend'
  | 'devops'
  | 'security'
  | 'architecture'
  | 'data'
  // Creative Teams
  | 'design'
  | 'content'
  | 'ux-research'
  // Operations Teams
  | 'project-management'
  | 'quality-assurance'
  | 'support'
  | 'task-force'
  // Research Teams
  | 'ai-research'
  | 'innovation'
  // Sales Teams
  | 'marketing'
  | 'business-dev'
  | 'pr-communications'
  | 'customer-success'
  // HR Teams (인사)
  | 'talent-acquisition'
  | 'hr-operations'
  | 'org-development'
  | 'learning-development'
  // Corporate Services Teams (경영지원)
  | 'general-affairs'
  | 'procurement'
  | 'it-support'
  // Internal Audit (내부감사)
  | 'internal-audit'
  // External Affairs Teams (대외협력)
  | 'government-relations'
  | 'esg'

export type AgentRole =
  // C-Suite
  | 'ceo' | 'cto' | 'coo' | 'cfo' | 'cmo' | 'cpo'
  // Secretariat (비서실)
  | 'chief-of-staff' | 'schedule-secretary' | 'communications-secretary'
  | 'research-secretary' | 'administrative-secretary' | 'special-advisor'
  // Strategy
  | 'strategist' | 'analyst' | 'advisor'
  // Product Planning (제품기획)
  | 'product-planning-lead' | 'senior-product-manager' | 'product-manager'
  | 'service-planner' | 'feature-planner' | 'requirements-analyst'
  // Business Planning (사업기획)
  | 'business-planning-lead' | 'business-model-architect' | 'market-research-analyst'
  | 'competitive-intelligence-analyst' | 'opportunity-analyst' | 'go-to-market-strategist'
  // Data Analytics (데이터분석)
  | 'analytics-lead' | 'product-analyst' | 'user-behavior-analyst'
  | 'ab-test-analyst' | 'metrics-specialist' | 'insights-manager'
  // Finance - FP&A
  | 'finance-lead' | 'financial-analyst' | 'budget-analyst'
  // Finance - Accounting
  | 'accounting-lead' | 'senior-accountant' | 'ap-ar-specialist'
  // Finance - Treasury
  | 'treasury-manager' | 'risk-analyst' | 'investment-analyst'
  // Legal - Corporate
  | 'general-counsel' | 'corporate-lawyer' | 'contract-specialist'
  // Legal - Compliance
  | 'compliance-lead' | 'privacy-officer' | 'regulatory-specialist'
  // Legal - IP
  | 'ip-counsel' | 'patent-analyst' | 'trademark-specialist'
  // Backend
  | 'backend-lead' | 'api-developer' | 'database-engineer'
  // Frontend
  | 'frontend-lead' | 'ui-developer' | 'mobile-developer'
  // DevOps
  | 'devops-lead' | 'sre-engineer' | 'platform-engineer'
  // Security
  | 'security-lead' | 'security-analyst' | 'compliance-officer'
  // Architecture
  | 'chief-architect' | 'solution-architect' | 'tech-lead'
  // Data
  | 'data-lead' | 'data-engineer' | 'ml-engineer'
  // Design
  | 'design-lead' | 'ui-designer' | 'brand-designer'
  // Content
  | 'content-lead' | 'copywriter' | 'technical-writer'
  // UX Research
  | 'ux-lead' | 'ux-researcher' | 'usability-analyst'
  // Project Management
  | 'pm-lead' | 'scrum-master' | 'coordinator'
  // QA
  | 'qa-lead' | 'test-engineer' | 'automation-engineer'
  // Support
  | 'support-lead' | 'support-agent' | 'success-manager'
  // Task Force (긴급 대응팀)
  | 'task-force-lead' | 'senior-debugger' | 'debugger'
  | 'coding-support-senior' | 'coding-support' | 'data-investigator-senior' | 'data-investigator'
  // AI Research
  | 'research-lead' | 'ai-scientist' | 'prompt-engineer'
  // Innovation
  | 'innovation-lead' | 'futurist' | 'prototype-engineer'
  // Marketing
  | 'marketing-lead' | 'growth-hacker' | 'seo-specialist'
  // Business Dev
  | 'bizdev-lead' | 'partnership-manager' | 'sales-rep'
  // PR & Communications
  | 'pr-lead' | 'pr-specialist' | 'media-relations-manager'
  | 'product-page-specialist' | 'social-media-manager' | 'visual-content-creator'
  // Customer Success (고객성공)
  | 'customer-success-lead' | 'customer-success-manager' | 'onboarding-specialist' | 'retention-specialist'
  // HR - Talent Acquisition (채용)
  | 'chro' | 'talent-acquisition-lead' | 'senior-recruiter' | 'recruiter'
  // HR - HR Operations (인사관리)
  | 'hr-operations-lead' | 'hr-specialist' | 'payroll-specialist'
  // HR - Organization Development (조직개발)
  | 'org-dev-lead' | 'culture-specialist' | 'performance-specialist'
  // HR - Learning & Development (교육)
  | 'learning-dev-lead' | 'training-specialist' | 'e-learning-specialist'
  // Corporate Services (경영지원)
  | 'corporate-services-head'
  // Corporate Services - General Affairs (총무)
  | 'general-affairs-lead' | 'facilities-manager' | 'admin-specialist'
  // Corporate Services - Procurement (구매)
  | 'procurement-lead' | 'sourcing-specialist' | 'vendor-manager'
  // Corporate Services - IT Support (정보시스템)
  | 'it-support-lead' | 'system-admin' | 'helpdesk-specialist'
  // Internal Audit (내부감사)
  | 'internal-audit-lead' | 'senior-auditor' | 'auditor'
  // External Affairs (대외협력)
  | 'external-affairs-head'
  // External Affairs - Government Relations (대관)
  | 'government-relations-lead' | 'policy-specialist'
  // External Affairs - ESG
  | 'esg-lead' | 'csr-specialist' | 'sustainability-analyst'

// ============================================================
// AGENT SYSTEM
// ============================================================

export type AIProvider =
  | 'claude'      // Anthropic Claude
  | 'gemini'      // Google Gemini
  | 'gpt'         // OpenAI GPT
  | 'grok'        // xAI Grok
  | 'local'       // Local models
  | 'custom'      // Custom implementations

export type AgentStatus =
  | 'idle'        // 대기중
  | 'working'     // 작업중
  | 'waiting'     // 응답대기
  | 'blocked'     // 차단됨
  | 'error'       // 에러
  | 'offline'     // 오프라인

export type AgentCapability =
  | 'coding'
  | 'analysis'
  | 'design'
  | 'writing'
  | 'planning'
  | 'review'
  | 'communication'
  | 'research'
  | 'testing'
  | 'deployment'
  | 'security'
  | 'data-processing'
  | 'decision-making'
  | 'creativity'
  | 'reporting'
  | 'documentation'
  | 'coordination'

export interface AgentConfig {
  id: string
  role: AgentRole
  name: string
  nameKr: string
  team: TeamId
  department: DepartmentId
  provider: AIProvider
  model?: string
  capabilities: AgentCapability[]
  skills: string[]
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  tools?: string[]
}

export interface Agent extends AgentConfig {
  status: AgentStatus
  currentTask?: string
  lastActive?: Date
  metrics: AgentMetrics
}

export interface AgentMetrics {
  tasksCompleted: number
  tasksInProgress: number
  tasksFailed: number
  avgCompletionTime: number
  successRate: number
}

// ============================================================
// TASK SYSTEM
// ============================================================

export type TaskType =
  // Development
  | 'feature-development'
  | 'bug-fix'
  | 'code-review'
  | 'refactoring'
  | 'testing'
  | 'deployment'
  // Design
  | 'ui-design'
  | 'ux-research'
  | 'brand-design'
  // Content
  | 'documentation'
  | 'copywriting'
  | 'translation'
  // Analysis
  | 'code-analysis'
  | 'security-audit'
  | 'performance-analysis'
  | 'market-research'
  // Planning
  | 'sprint-planning'
  | 'roadmap'
  | 'architecture-design'
  // Operations
  | 'incident-response'
  | 'support-ticket'
  | 'onboarding'
  // Custom
  | 'custom'

export type TaskStatus =
  | 'draft'
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'blocked'

export type TaskPriority = 'critical' | 'high' | 'normal' | 'low'

export interface Task {
  id: string
  type: TaskType
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority

  // Assignment
  assignedTo?: string[]
  assignedTeam?: TeamId
  assignedDepartment?: DepartmentId

  // Workflow
  dependencies?: string[]
  blockedBy?: string[]
  subtasks?: string[]
  parentTask?: string

  // Requirements (for AI processing)
  requirements?: string[]
  acceptanceCriteria?: string[]

  // Metadata
  input?: unknown
  output?: unknown
  context?: Record<string, unknown>
  tags?: string[]

  // Timestamps
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  dueDate?: Date

  // Metrics
  estimatedHours?: number
  actualHours?: number
}

// ============================================================
// WORKFLOW SYSTEM
// ============================================================

export type WorkflowPattern =
  | 'sequential'    // 순차 실행
  | 'parallel'      // 병렬 실행
  | 'pipeline'      // 파이프라인
  | 'waterfall'     // 폭포수
  | 'agile-sprint'  // 애자일 스프린트
  | 'kanban'        // 칸반
  | 'swarm'         // 스웜 패턴

export type SwarmPattern =
  | 'hive'          // 병렬 태스크 처리
  | 'pipeline'      // 순차 스테이지
  | 'council'       // 의결 투표
  | 'watchdog'      // 백그라운드 모니터링
  | 'specialist'    // 전문가 매칭

export interface Workflow {
  id: string
  name: string
  pattern: WorkflowPattern
  stages: WorkflowStage[]
  config: WorkflowConfig
}

export interface WorkflowStage {
  id: string
  name: string
  teams: TeamId[]
  tasks: TaskType[]
  dependencies?: string[]
  timeout?: number
}

export interface WorkflowConfig {
  maxConcurrency: number
  timeout: number
  retryPolicy: RetryPolicy
  escalationPolicy?: EscalationPolicy
}

export interface RetryPolicy {
  maxAttempts: number
  backoffMs: number
  exponential: boolean
}

export interface EscalationPolicy {
  timeoutMinutes: number
  escalateTo: AgentRole[]
}

// ============================================================
// COMMUNICATION SYSTEM
// ============================================================

export type MessageType =
  | 'task-assignment'
  | 'task-update'
  | 'task-complete'
  | 'request-help'
  | 'approval-request'
  | 'approval-response'
  | 'broadcast'
  | 'direct'
  | 'vote'
  | 'escalation'
  | 'notification'

export interface Message {
  id: string
  type: MessageType
  from: string
  to: string | string[] | 'all' | TeamId | DepartmentId
  subject: string
  content: string
  data?: unknown
  priority: TaskPriority
  requiresResponse: boolean
  timestamp: Date
  expiresAt?: Date
}

export interface Channel {
  id: string
  name: string
  type: 'team' | 'department' | 'project' | 'direct' | 'broadcast'
  members: string[]
  messages: Message[]
}

// ============================================================
// COMPANY STRUCTURE
// ============================================================

export interface Department {
  id: DepartmentId
  name: string
  nameKr: string
  description: string
  head: AgentRole
  teams: TeamId[]
  budget?: number
  kpis?: string[]
}

export interface Team {
  id: TeamId
  name: string
  nameKr: string
  department: DepartmentId
  description: string
  lead: AgentRole
  agents: AgentConfig[]
  responsibilities: string[]
  tools: string[]
  workflows: string[]
}

export interface CompanyConfig {
  name: string
  nameKr: string
  mission: string
  vision: string
  values: string[]
  departments: Department[]
  teams: Team[]
  workflows: Workflow[]
  settings: CompanySettings
}

export interface CompanySettings {
  defaultProvider: AIProvider
  maxConcurrentTasks: number
  workingHours: { start: number; end: number }
  timezone: string
  language: string[]
  escalationTimeout: number
  reviewRequired: boolean
}

// ============================================================
// METRICS & REPORTING
// ============================================================

export interface CompanyMetrics {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  avgCompletionTime: number
  successRate: number
  activeAgents: number
  departmentMetrics: Record<DepartmentId, DepartmentMetrics>
}

export interface DepartmentMetrics {
  tasksCompleted: number
  avgResponseTime: number
  teamPerformance: Record<TeamId, TeamMetrics>
}

export interface TeamMetrics {
  tasksCompleted: number
  tasksInProgress: number
  tasksFailed: number
  avgCompletionTime: number
  agentUtilization: number
}

// ============================================================
// EVENTS
// ============================================================

export type EventType =
  | 'agent:status-changed'
  | 'task:created'
  | 'task:assigned'
  | 'task:started'
  | 'task:completed'
  | 'task:failed'
  | 'task:escalated'
  | 'workflow:started'
  | 'workflow:stage-completed'
  | 'workflow:completed'
  | 'message:sent'
  | 'message:received'
  | 'system:alert'
  | 'system:error'

export interface CompanyEvent {
  type: EventType
  timestamp: Date
  source: string
  data: unknown
}

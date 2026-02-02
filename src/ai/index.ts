/**
 * AI Company - AI Module
 * AI 프로바이더, 프롬프트, 에이전트 통합 모듈
 */

// Types
export * from './types'

// Providers
export {
  BaseProvider,
  GeminiProvider,
  createGeminiProvider,
  MockProvider,
  createMockProvider,
  type MockResponse,
} from './providers'

// Prompts
export {
  PromptBuilder,
  buildAgentTaskPrompt,
  buildSimpleTaskPrompt,
  buildAnalysisPrompt,
  buildReviewPrompt,
  getAgentSystemPrompt,
  getDepartmentPrompt,
  getRolePrompt,
  getTaskTypePrompt,
  getPriorityContext,
  getOutputFormat,
  getCollaborationPrompt,
  DEPARTMENT_PROMPTS,
  ROLE_PROMPTS,
  BASE_SYSTEM_PROMPT,
  TASK_TYPE_PROMPTS,
  PRIORITY_CONTEXT,
  OUTPUT_FORMATS,
  COLLABORATION_PROMPTS,
} from './prompts'

// Provider Manager
export {
  AIProviderManager,
  createAIProviderManager,
} from './AIProviderManager'

// AI Agents
export {
  AIAgent,
  createAIAgent,
  type AIAgentConfig,
  type AIAgentTaskResult,
} from './agents'

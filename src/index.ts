/**
 * AI Company - Main Entry Point
 * AI Nexus Corporation
 *
 * 6개 부서, 18개 팀, 54개 에이전트로 구성된 완전한 AI 회사
 */

// Core types
export * from './types'

// Configuration
export * from './config'

// Agents
export * from './agents'

// Communication
export * from './communication'

// Workflow
export * from './workflow'

// Conductor (CEO)
export * from './conductor'

// Swarm
export * from './swarm'

// Utils
export * from './utils'

// AI Module
export * from './ai'

// ============================================================
// QUICK START
// ============================================================

import { getConductor, resetConductor } from './conductor'
import { COMPANY_INFO, TOTAL_DEPARTMENTS, TOTAL_TEAMS, TOTAL_AGENTS, TOTAL_WORKFLOWS } from './config'

/**
 * Start the AI Company
 */
export function startCompany(options: { logLevel?: 'none' | 'info' | 'debug' } = {}) {
  const conductor = getConductor({
    logLevel: options.logLevel || 'info',
    autoDistribute: true,
    enableEscalation: true,
  })

  conductor.start()
  return conductor
}

/**
 * Stop the AI Company
 */
export function stopCompany() {
  resetConductor()
}

/**
 * Get company info
 */
export function getCompanyInfo() {
  return {
    ...COMPANY_INFO,
    stats: {
      departments: TOTAL_DEPARTMENTS,
      teams: TOTAL_TEAMS,
      agents: TOTAL_AGENTS,
      workflows: TOTAL_WORKFLOWS,
    },
  }
}

// Default export
export default {
  startCompany,
  stopCompany,
  getCompanyInfo,
  getConductor,
}

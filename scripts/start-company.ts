#!/usr/bin/env npx ts-node
/**
 * AI Company - Start Script
 * 회사 시작 및 상태 출력
 */

import { getConductor } from '../src/conductor'
import { COMPANY_INFO, DEPARTMENTS, TEAMS, WORKFLOWS } from '../src/config'

async function main() {
  console.log('🚀 Starting AI Company...\n')

  // Initialize conductor
  const conductor = getConductor({
    logLevel: 'info',
    autoDistribute: true,
    enableEscalation: true,
  })

  // Start the company
  conductor.start()

  // Print company status
  conductor.printStatus()

  // Print additional stats
  console.log('\n📊 Detailed Statistics:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━')

  const metrics = conductor.getCompanyMetrics()
  console.log(`Total Tasks: ${metrics.totalTasks}`)
  console.log(`Completed Tasks: ${metrics.completedTasks}`)
  console.log(`In Progress: ${metrics.inProgressTasks}`)
  console.log(`Active Agents: ${metrics.activeAgents}`)

  console.log('\n✅ AI Company is ready!')
  console.log('\nUse the Conductor to:')
  console.log('  - Create and distribute tasks')
  console.log('  - Execute workflows')
  console.log('  - Monitor agent performance')
  console.log('  - Handle escalations')

  return conductor
}

main().catch(console.error)

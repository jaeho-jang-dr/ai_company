#!/usr/bin/env npx ts-node
/**
 * AI Company - Demo Script
 * 워크플로우 실행 및 에이전트 협업 데모
 */

import { getConductor, resetConductor } from '../src/conductor'
import { WORKFLOWS } from '../src/config'

async function runDemo() {
  console.log('🎬 AI Company Demo')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Initialize
  resetConductor()
  const conductor = getConductor({ logLevel: 'info' })
  conductor.start()

  // Print initial status
  console.log('📊 Initial Company Status:')
  conductor.printStatus()

  // Demo 1: Create and distribute a task
  console.log('\n\n🔄 Demo 1: Creating and Distributing a Task')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const task1 = await conductor.createTask(
    'feature-development',
    'Implement User Authentication',
    'Create a secure authentication system with JWT tokens',
    {
      priority: 'high',
      assignedTeam: 'backend',
    }
  )

  console.log(`✅ Task created: ${task1.id}`)
  console.log(`   Title: ${task1.title}`)
  console.log(`   Status: ${task1.status}`)
  console.log(`   Priority: ${task1.priority}`)
  console.log(`   Assigned To: ${task1.assignedTo?.join(', ') || 'Pending'}`)

  // Demo 2: Create multiple tasks
  console.log('\n\n🔄 Demo 2: Creating Multiple Tasks')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const tasks = await Promise.all([
    conductor.createTask('ui-design', 'Design Login Page', 'Create wireframes and mockups for login', { priority: 'normal', assignedTeam: 'design' }),
    conductor.createTask('testing', 'Write Auth Tests', 'Create unit and integration tests', { priority: 'normal', assignedTeam: 'quality-assurance' }),
    conductor.createTask('documentation', 'Document Auth API', 'Write API documentation', { priority: 'low', assignedTeam: 'content' }),
  ])

  console.log(`✅ Created ${tasks.length} tasks:`)
  for (const task of tasks) {
    console.log(`   - ${task.title} [${task.priority}] → ${task.assignedTo?.[0] || 'Pending'}`)
  }

  // Demo 3: Check agent availability
  console.log('\n\n🔄 Demo 3: Agent Availability')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const allAgents = conductor.getAllAgents()
  const availableAgents = conductor.getAvailableAgents()

  console.log(`Total Agents: ${allAgents.length}`)
  console.log(`Available Agents: ${availableAgents.length}`)
  console.log(`Busy Agents: ${allAgents.length - availableAgents.length}`)

  console.log('\nSample Available Agents:')
  availableAgents.slice(0, 5).forEach(agent => {
    console.log(`   - ${agent.name} (${agent.role}) [${agent.team}]`)
  })

  // Demo 4: Execute a workflow
  console.log('\n\n🔄 Demo 4: Executing Feature Development Workflow')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const workflow = WORKFLOWS.find(w => w.id === 'feature-development')
  if (workflow) {
    console.log(`Workflow: ${workflow.name}`)
    console.log(`Pattern: ${workflow.pattern}`)
    console.log(`Stages: ${workflow.stages.length}`)
    console.log('')

    for (const stage of workflow.stages) {
      console.log(`   📍 ${stage.name}`)
      console.log(`      Teams: ${stage.teams.join(', ')}`)
      console.log(`      Tasks: ${stage.tasks.join(', ')}`)
    }

    console.log('\n⏳ Starting workflow execution...')

    try {
      const execution = await conductor.executeWorkflow('feature-development', {
        feature: 'User Authentication',
        requirements: ['JWT', 'OAuth', 'MFA'],
      })

      console.log(`\n✅ Workflow execution ${execution.status}`)
      console.log(`   Execution ID: ${execution.id}`)
      console.log(`   Duration: ${execution.completedAt && execution.startedAt
        ? `${((execution.completedAt.getTime() - execution.startedAt.getTime()) / 1000).toFixed(2)}s`
        : 'N/A'
      }`)
    } catch (error) {
      console.log(`\n❌ Workflow execution failed: ${error}`)
    }
  }

  // Demo 5: Company Metrics
  console.log('\n\n🔄 Demo 5: Company Metrics')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const metrics = conductor.getCompanyMetrics()

  console.log('📈 Overall Metrics:')
  console.log(`   Total Tasks: ${metrics.totalTasks}`)
  console.log(`   Completed: ${metrics.completedTasks}`)
  console.log(`   In Progress: ${metrics.inProgressTasks}`)
  console.log(`   Success Rate: ${metrics.successRate.toFixed(1)}%`)
  console.log(`   Active Agents: ${metrics.activeAgents}`)

  console.log('\n📊 Department Performance:')
  for (const [deptId, deptMetrics] of Object.entries(metrics.departmentMetrics)) {
    console.log(`\n   ${deptId}:`)
    console.log(`      Tasks Completed: ${deptMetrics.tasksCompleted}`)
    console.log(`      Avg Response Time: ${deptMetrics.avgResponseTime.toFixed(0)}ms`)
  }

  // Final status
  console.log('\n\n📊 Final Company Status:')
  conductor.printStatus()

  // Cleanup
  conductor.stop()
  console.log('\n🛑 Demo completed. Company stopped.')
}

// Run demo
runDemo().catch(console.error)

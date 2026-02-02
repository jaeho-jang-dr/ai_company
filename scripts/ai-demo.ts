#!/usr/bin/env npx ts-node
/**
 * AI Company - AI Integration Demo
 * AI 프로바이더 연동 데모
 */

import * as dotenv from 'dotenv'
import {
  AIProviderManager,
  createAIProviderManager,
  AIAgent,
  createAIAgent,
  PromptBuilder,
} from '../src/ai'
import { DEPARTMENTS, TEAMS, getAllAgents } from '../src/config'

// Load environment variables
dotenv.config()

async function runAIDemo() {
  console.log('🤖 AI Company - AI Integration Demo')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // ============================================================
  // Demo 1: Initialize AI Provider Manager
  // ============================================================
  console.log('📡 Demo 1: AI Provider Manager Initialization')
  console.log('─────────────────────────────────────────────')

  const providerManager = createAIProviderManager({
    primaryProvider: 'gemini',
    fallbackProviders: ['mock'],
  })

  await providerManager.initialize()

  const availableProviders = providerManager.getAvailableProviders()
  console.log(`Available Providers: ${availableProviders.join(', ')}`)

  // Check health
  const health = await providerManager.checkHealth()
  console.log('\nProvider Health:')
  for (const [provider, isHealthy] of Object.entries(health)) {
    console.log(`   ${provider}: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`)
  }

  // ============================================================
  // Demo 2: Create AI Agents
  // ============================================================
  console.log('\n\n🤖 Demo 2: Creating AI Agents')
  console.log('─────────────────────────────────────────────')

  // Get some agent configs from company setup
  const agentConfigs = getAllAgents().slice(0, 3)
  const aiAgents: AIAgent[] = []

  for (const config of agentConfigs) {
    const agent = createAIAgent({
      id: config.id,
      name: config.name,
      role: config.role,
      department: config.department,
      team: config.team,
      capabilities: config.capabilities,
      skills: config.skills,
      providerManager,
    })

    aiAgents.push(agent)
    console.log(`   ✅ Created: ${agent.name} (${agent.role})`)
  }

  // ============================================================
  // Demo 3: Chat with an Agent
  // ============================================================
  console.log('\n\n💬 Demo 3: Chat with AI Agent')
  console.log('─────────────────────────────────────────────')

  const ceoAgent = aiAgents.find(a => a.role === 'ceo') || aiAgents[0]
  console.log(`Chatting with: ${ceoAgent.name} (${ceoAgent.role})`)
  console.log('')

  try {
    const response = await ceoAgent.chat('회사의 현재 전략적 방향에 대해 설명해주세요.')
    console.log('📝 Response:')
    console.log('─────────────────────────────────────────────')
    console.log(response.substring(0, 500) + (response.length > 500 ? '...' : ''))
    console.log('─────────────────────────────────────────────')

    const stats = ceoAgent.getStats()
    console.log(`\n📊 Agent Stats:`)
    console.log(`   Tokens Used: ${stats.totalTokensUsed}`)
  } catch (error) {
    console.log(`❌ Chat failed: ${error instanceof Error ? error.message : error}`)
  }

  // ============================================================
  // Demo 4: Execute Task with AI Agent
  // ============================================================
  console.log('\n\n📋 Demo 4: Execute Task with AI Agent')
  console.log('─────────────────────────────────────────────')

  const task = {
    id: 'task-001',
    type: 'feature-development' as const,
    title: '사용자 인증 시스템 설계',
    description: 'JWT 기반 인증 시스템을 설계하고 구현 계획을 수립하세요.',
    status: 'pending' as const,
    priority: 'high' as const,
    requirements: [
      'JWT 토큰 기반 인증',
      'Refresh Token 지원',
      '소셜 로그인 (Google, GitHub)',
    ],
    acceptanceCriteria: [
      '보안 모범 사례 준수',
      '성능 요구사항 충족',
      '문서화 완료',
    ],
    createdAt: new Date(),
  }

  console.log(`Task: ${task.title}`)
  console.log(`Type: ${task.type} | Priority: ${task.priority}`)
  console.log('')

  const techLeadAgent = aiAgents.find(a => a.role.includes('lead')) || aiAgents[0]
  console.log(`Assigning to: ${techLeadAgent.name}`)
  console.log('Executing...\n')

  try {
    const result = await techLeadAgent.executeTask(task)

    console.log(`📝 Task Result:`)
    console.log(`   Status: ${result.status === 'completed' ? '✅ Completed' : '❌ Failed'}`)
    if (result.metrics) {
      console.log(`   Duration: ${result.metrics.duration}ms`)
      console.log(`   Tokens Used: ${result.metrics.tokensUsed || 'N/A'}`)
    }

    if (result.output) {
      console.log('\n📄 Output:')
      console.log('─────────────────────────────────────────────')
      const output = String(result.output)
      console.log(output.substring(0, 800) + (output.length > 800 ? '...' : ''))
      console.log('─────────────────────────────────────────────')
    }
  } catch (error) {
    console.log(`❌ Task execution failed: ${error instanceof Error ? error.message : error}`)
  }

  // ============================================================
  // Demo 5: Analysis with AI Agent
  // ============================================================
  console.log('\n\n🔍 Demo 5: Analysis with AI Agent')
  console.log('─────────────────────────────────────────────')

  const codeSnippet = `
async function authenticateUser(username: string, password: string) {
  const user = await db.users.findOne({ username });
  if (!user) throw new Error('User not found');

  const isValid = password === user.password; // 문제점!
  if (!isValid) throw new Error('Invalid password');

  return generateToken(user);
}
`

  console.log('Analyzing code for security issues...\n')

  try {
    const analysis = await techLeadAgent.analyze(codeSnippet, 'security')

    console.log('📝 Security Analysis:')
    console.log('─────────────────────────────────────────────')
    console.log(analysis.substring(0, 600) + (analysis.length > 600 ? '...' : ''))
    console.log('─────────────────────────────────────────────')
  } catch (error) {
    console.log(`❌ Analysis failed: ${error instanceof Error ? error.message : error}`)
  }

  // ============================================================
  // Demo 6: Prompt Builder
  // ============================================================
  console.log('\n\n📝 Demo 6: Prompt Builder')
  console.log('─────────────────────────────────────────────')

  const prompt = new PromptBuilder()
    .withBase()
    .withDepartment('engineering')
    .withRole('backend-lead')
    .withCustom('특별 지시', '다음 API를 설계해주세요.')
    .withInstructions([
      'RESTful 원칙 준수',
      'OpenAPI 스펙 작성',
      '에러 처리 포함',
    ])
    .withOutputFormat('implementation')
    .build()

  console.log(`Generated Prompt Length: ${prompt.length} characters`)
  console.log(`Estimated Tokens: ~${Math.ceil(prompt.length / 3)} tokens`)
  console.log('')
  console.log('Preview (first 300 chars):')
  console.log('─────────────────────────────────────────────')
  console.log(prompt.substring(0, 300) + '...')

  // ============================================================
  // Demo 7: Provider Stats
  // ============================================================
  console.log('\n\n📊 Demo 7: Provider Statistics')
  console.log('─────────────────────────────────────────────')

  const stats = providerManager.getUsageStats()

  console.log('Overall Statistics:')
  console.log(`   Total Calls: ${stats.totalCalls}`)
  console.log(`   Successful: ${stats.successfulCalls}`)
  console.log(`   Failed: ${stats.failedCalls}`)
  console.log(`   Total Tokens: ${stats.totalTokens}`)
  console.log(`   Avg Latency: ${stats.averageLatency.toFixed(0)}ms`)

  console.log('\nBy Provider:')
  for (const [provider, providerStats] of Object.entries(stats.byProvider)) {
    console.log(`   ${provider}:`)
    console.log(`      Calls: ${providerStats.calls}`)
    console.log(`      Tokens: ${providerStats.tokens}`)
    console.log(`      Avg Latency: ${providerStats.avgLatency.toFixed(0)}ms`)
  }

  // ============================================================
  // Final Summary
  // ============================================================
  console.log('\n\n🎉 AI Integration Demo Complete!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Summary:')
  console.log(`   ✅ AI Provider Manager initialized`)
  console.log(`   ✅ ${aiAgents.length} AI Agents created`)
  console.log(`   ✅ Chat, Task Execution, Analysis demonstrated`)
  console.log(`   ✅ Prompt Builder tested`)
  console.log('')
  console.log('To use real AI:')
  console.log('   1. Copy .env.example to .env')
  console.log('   2. Add your GEMINI_API_KEY')
  console.log('   3. Run: npm run ai-demo')
}

// Run demo
runAIDemo().catch(console.error)

# AI Company - Claude Configuration

## Project Overview

AI Nexus Corporation - AI-powered company with intelligent agents organized into departments and teams.

## Structure

- **6 Departments**: Executive, Engineering, Creative, Operations, Research, Sales
- **18 Teams**: Backend, Frontend, DevOps, Security, Architecture, Data, Design, Content, UX Research, PM, QA, Support, AI Research, Innovation, Marketing, Business Dev
- **54 Agents**: 3 agents per team with specialized roles
- **3 Workflows**: Feature Development, Incident Response, Product Launch

## Key Files

- `src/index.ts` - Main entry point
- `src/types.ts` - Type definitions
- `src/config/company.ts` - Company configuration with all agents
- `src/conductor/Conductor.ts` - CEO orchestrator
- `src/workflow/WorkflowEngine.ts` - Workflow execution engine
- `src/communication/MessageBus.ts` - Agent communication

## Quick Start

```typescript
import { startCompany, getConductor } from './src'

// Start the company
const conductor = startCompany()

// Create a task
const task = await conductor.createTask(
  'feature-development',
  'Build User Auth',
  'Implement authentication system',
  { priority: 'high', assignedTeam: 'backend' }
)

// Execute a workflow
const execution = await conductor.executeWorkflow('feature-development', {
  feature: 'User Authentication'
})

// Get metrics
const metrics = conductor.getCompanyMetrics()
```

## Development Commands

```bash
npm install          # Install dependencies
npm run build        # Build TypeScript
npm run start        # Start company
npm run demo         # Run demo
npm run typecheck    # Type check
```

## Workflow Patterns

- **Sequential**: Step-by-step execution
- **Parallel**: Concurrent execution with dependencies
- **Pipeline**: Data flow through stages
- **Agile Sprint**: Sprint-based development
- **Kanban**: WIP-limited flow
- **Swarm**: Multi-agent patterns (Hive, Pipeline, Council, Watchdog, Specialist)

## Agent Scoring Algorithm

Task assignment uses weighted scoring:
- Capability Match: 40%
- Skill Match: 25%
- Availability: 20%
- Workload Balance: 10%
- Success Rate: 5%

---

## 스킬 컬렉션 (Conductor 메모리)

### 퀀텀점프 20스킬 (활성화됨)
**출처**: bear2u/my-skills (정상욱/퀀텀점프클럽)
**상태**: ✅ 활성화
**경로**: `.claude/skills/`, `src/skills/퀀텀점프20스킬/`

| 분야 | 스킬 |
|------|------|
| **크리에이티브** | card-news-generator, card-news-generator-v2, midjourney-cardnews-bg, design-prompt-generator-v2, frontend-design, landing-page-guide, landing-page-guide-v2 |
| **엔지니어링** | flutter-init, nextjs15-init, codex, codex-claude-loop, codex-claude-cursor-loop, code-changelog, code-prompt-coach, gemini-logo-remover |
| **운영** | workthrough, workthrough-v2, web-to-markdown |
| **연구개발** | prompt-enhancer, meta-prompt-generator |

### 특이점빌더스 92스킬 (대기중)
**출처**: 특이점 빌더스 강의
**상태**: ⏳ 추후 추가 예정
**경로**: `src/skills/특이점빌더스스킬/`

---

## 추가 도구 리포지토리

| 리포지토리 | 위치 | 스킬 수 |
|------------|------|---------|
| notebooklm-automation | `tools/notebooklm-automation/` | 자료조사 자동화 |
| antigravity-awesome-skills | `tools/antigravity-awesome-skills/` | 621개 |
| my-skills (bear2u) | `tools/my-skills/` | 20개 |
| wshobson-agents | `tools/wshobson-agents/` | 72개 |
| anthropics-skills | `tools/anthropics-skills/` | 16개 |
| everything-claude-code | `tools/everything-claude-code/` | 13개 |

---

## 자주 사용하는 스킬 명령어

```bash
# 카드뉴스 생성
/card-news-generator "주제"

# 프로젝트 초기화
/flutter-init [도메인] --stack [minimal|essential|full]
/nextjs15-init [도메인] --stack [minimal|essential|full]

# AI 검증 루프
/codex-claude-loop "구현할 기능"

# 프롬프트 개선
/prompt-enhancer "간단한 요청"

# 작업 문서화
/workthrough
```

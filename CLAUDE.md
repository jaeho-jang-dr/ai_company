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

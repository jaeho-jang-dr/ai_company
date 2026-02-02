/**
 * AI Company - Dependency Resolver
 * 워크플로우 및 태스크 의존성 해결
 */

import { Task, WorkflowStage } from '../types'

export interface DependencyNode {
  id: string
  dependencies: string[]
  dependents: string[]
  status: 'pending' | 'ready' | 'running' | 'completed' | 'failed'
}

export interface DependencyGraph {
  nodes: Map<string, DependencyNode>
  roots: string[]
  leaves: string[]
}

export interface ExecutionOrder {
  stages: string[][]  // Each inner array is a parallel execution group
  totalStages: number
}

export class DependencyResolver {
  /**
   * Build a dependency graph from workflow stages
   */
  buildStageGraph(stages: WorkflowStage[]): DependencyGraph {
    const nodes = new Map<string, DependencyNode>()

    // Initialize nodes
    for (const stage of stages) {
      nodes.set(stage.id, {
        id: stage.id,
        dependencies: stage.dependencies || [],
        dependents: [],
        status: 'pending',
      })
    }

    // Build dependent relationships
    for (const stage of stages) {
      for (const depId of stage.dependencies || []) {
        const depNode = nodes.get(depId)
        if (depNode) {
          depNode.dependents.push(stage.id)
        }
      }
    }

    // Find roots (no dependencies) and leaves (no dependents)
    const roots: string[] = []
    const leaves: string[] = []

    for (const [id, node] of nodes) {
      if (node.dependencies.length === 0) {
        roots.push(id)
      }
      if (node.dependents.length === 0) {
        leaves.push(id)
      }
    }

    return { nodes, roots, leaves }
  }

  /**
   * Build a dependency graph from tasks
   */
  buildTaskGraph(tasks: Task[]): DependencyGraph {
    const nodes = new Map<string, DependencyNode>()

    // Initialize nodes
    for (const task of tasks) {
      nodes.set(task.id, {
        id: task.id,
        dependencies: task.dependencies || [],
        dependents: [],
        status: 'pending',
      })
    }

    // Build dependent relationships
    for (const task of tasks) {
      for (const depId of task.dependencies || []) {
        const depNode = nodes.get(depId)
        if (depNode) {
          depNode.dependents.push(task.id)
        }
      }
    }

    // Find roots and leaves
    const roots: string[] = []
    const leaves: string[] = []

    for (const [id, node] of nodes) {
      if (node.dependencies.length === 0) {
        roots.push(id)
      }
      if (node.dependents.length === 0) {
        leaves.push(id)
      }
    }

    return { nodes, roots, leaves }
  }

  /**
   * Detect circular dependencies
   */
  detectCircularDependencies(graph: DependencyGraph): string[][] {
    const cycles: string[][] = []
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    const path: string[] = []

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId)
      recursionStack.add(nodeId)
      path.push(nodeId)

      const node = graph.nodes.get(nodeId)
      if (!node) return false

      for (const depId of node.dependents) {
        if (!visited.has(depId)) {
          if (dfs(depId)) return true
        } else if (recursionStack.has(depId)) {
          // Found cycle
          const cycleStart = path.indexOf(depId)
          cycles.push(path.slice(cycleStart))
          return true
        }
      }

      path.pop()
      recursionStack.delete(nodeId)
      return false
    }

    for (const nodeId of graph.nodes.keys()) {
      if (!visited.has(nodeId)) {
        dfs(nodeId)
      }
    }

    return cycles
  }

  /**
   * Topological sort for execution order
   */
  topologicalSort(graph: DependencyGraph): ExecutionOrder {
    // Check for cycles first
    const cycles = this.detectCircularDependencies(graph)
    if (cycles.length > 0) {
      throw new Error(`Circular dependencies detected: ${cycles.map(c => c.join(' -> ')).join('; ')}`)
    }

    const stages: string[][] = []
    const inDegree = new Map<string, number>()
    const remaining = new Set<string>()

    // Initialize in-degrees
    for (const [id, node] of graph.nodes) {
      inDegree.set(id, node.dependencies.length)
      remaining.add(id)
    }

    while (remaining.size > 0) {
      // Find all nodes with in-degree 0
      const ready: string[] = []
      for (const id of remaining) {
        if (inDegree.get(id) === 0) {
          ready.push(id)
        }
      }

      if (ready.length === 0) {
        throw new Error('Unable to resolve dependencies - possible cycle')
      }

      // Add ready nodes as a parallel stage
      stages.push(ready)

      // Remove ready nodes and update in-degrees
      for (const id of ready) {
        remaining.delete(id)
        const node = graph.nodes.get(id)!
        for (const depId of node.dependents) {
          inDegree.set(depId, (inDegree.get(depId) || 0) - 1)
        }
      }
    }

    return { stages, totalStages: stages.length }
  }

  /**
   * Get nodes that are ready to execute (all dependencies completed)
   */
  getReadyNodes(graph: DependencyGraph): string[] {
    const ready: string[] = []

    for (const [id, node] of graph.nodes) {
      if (node.status !== 'pending') continue

      const allDepsCompleted = node.dependencies.every(depId => {
        const dep = graph.nodes.get(depId)
        return dep?.status === 'completed'
      })

      if (allDepsCompleted) {
        ready.push(id)
      }
    }

    return ready
  }

  /**
   * Update node status and return newly ready nodes
   */
  markCompleted(graph: DependencyGraph, nodeId: string): string[] {
    const node = graph.nodes.get(nodeId)
    if (!node) return []

    node.status = 'completed'

    // Check which dependents are now ready
    const newlyReady: string[] = []
    for (const depId of node.dependents) {
      const dep = graph.nodes.get(depId)
      if (dep && dep.status === 'pending') {
        const allDepsCompleted = dep.dependencies.every(d => {
          const depNode = graph.nodes.get(d)
          return depNode?.status === 'completed'
        })
        if (allDepsCompleted) {
          newlyReady.push(depId)
        }
      }
    }

    return newlyReady
  }

  /**
   * Mark a node as failed
   */
  markFailed(graph: DependencyGraph, nodeId: string): string[] {
    const node = graph.nodes.get(nodeId)
    if (!node) return []

    node.status = 'failed'

    // Get all nodes that depend on this one (directly and indirectly)
    const affected: string[] = []
    const queue = [...node.dependents]

    while (queue.length > 0) {
      const id = queue.shift()!
      if (!affected.includes(id)) {
        affected.push(id)
        const affectedNode = graph.nodes.get(id)
        if (affectedNode) {
          queue.push(...affectedNode.dependents)
        }
      }
    }

    return affected
  }

  /**
   * Check if all nodes are completed
   */
  isComplete(graph: DependencyGraph): boolean {
    for (const node of graph.nodes.values()) {
      if (node.status !== 'completed') {
        return false
      }
    }
    return true
  }

  /**
   * Check if any nodes failed
   */
  hasFailed(graph: DependencyGraph): boolean {
    for (const node of graph.nodes.values()) {
      if (node.status === 'failed') {
        return true
      }
    }
    return false
  }

  /**
   * Get completion percentage
   */
  getProgress(graph: DependencyGraph): number {
    let completed = 0
    for (const node of graph.nodes.values()) {
      if (node.status === 'completed') {
        completed++
      }
    }
    return (completed / graph.nodes.size) * 100
  }
}

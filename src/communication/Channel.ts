/**
 * AI Company - Channel System
 * 팀, 부서, 프로젝트별 채널 관리
 */

import { EventEmitter } from 'events'
import { v4 as uuidv4 } from 'uuid'
import { Channel as IChannel, Message, TeamId, DepartmentId, TaskPriority } from '../types'

export type ChannelType = 'team' | 'department' | 'project' | 'direct' | 'broadcast'

export interface ChannelConfig {
  id?: string
  name: string
  type: ChannelType
  members?: string[]
  description?: string
  isPrivate?: boolean
}

export class Channel extends EventEmitter implements IChannel {
  readonly id: string
  readonly name: string
  readonly type: ChannelType
  members: string[]
  messages: Message[] = []

  private description: string
  private isPrivate: boolean
  private createdAt: Date
  private lastActivity: Date

  constructor(config: ChannelConfig) {
    super()
    this.id = config.id || uuidv4()
    this.name = config.name
    this.type = config.type
    this.members = config.members || []
    this.description = config.description || ''
    this.isPrivate = config.isPrivate || false
    this.createdAt = new Date()
    this.lastActivity = new Date()
  }

  // ============================================================
  // MEMBER MANAGEMENT
  // ============================================================

  addMember(memberId: string): void {
    if (!this.members.includes(memberId)) {
      this.members.push(memberId)
      this.emit('member-added', { channel: this.id, member: memberId })
    }
  }

  removeMember(memberId: string): void {
    const index = this.members.indexOf(memberId)
    if (index !== -1) {
      this.members.splice(index, 1)
      this.emit('member-removed', { channel: this.id, member: memberId })
    }
  }

  hasMember(memberId: string): boolean {
    return this.members.includes(memberId)
  }

  getMemberCount(): number {
    return this.members.length
  }

  // ============================================================
  // MESSAGE HANDLING
  // ============================================================

  postMessage(message: Message): void {
    this.messages.push(message)
    this.lastActivity = new Date()
    this.emit('message-posted', { channel: this.id, message })
  }

  getMessages(limit?: number): Message[] {
    if (limit) {
      return this.messages.slice(-limit)
    }
    return [...this.messages]
  }

  getMessageById(messageId: string): Message | undefined {
    return this.messages.find(m => m.id === messageId)
  }

  getMessagesByPriority(priority: TaskPriority): Message[] {
    return this.messages.filter(m => m.priority === priority)
  }

  getUnreadMessages(lastReadId?: string): Message[] {
    if (!lastReadId) return [...this.messages]

    const lastReadIndex = this.messages.findIndex(m => m.id === lastReadId)
    if (lastReadIndex === -1) return [...this.messages]

    return this.messages.slice(lastReadIndex + 1)
  }

  clearMessages(): void {
    this.messages = []
    this.emit('messages-cleared', { channel: this.id })
  }

  // ============================================================
  // CHANNEL INFO
  // ============================================================

  getInfo(): object {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      memberCount: this.members.length,
      messageCount: this.messages.length,
      isPrivate: this.isPrivate,
      createdAt: this.createdAt,
      lastActivity: this.lastActivity,
    }
  }

  toJSON(): object {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      members: this.members,
      messages: this.messages,
    }
  }
}

// ============================================================
// CHANNEL FACTORY
// ============================================================

export class ChannelFactory {
  /**
   * Create a team channel
   */
  static createTeamChannel(teamId: TeamId, members: string[]): Channel {
    return new Channel({
      id: `channel-team-${teamId}`,
      name: `Team: ${teamId}`,
      type: 'team',
      members,
      description: `Internal channel for ${teamId} team`,
    })
  }

  /**
   * Create a department channel
   */
  static createDepartmentChannel(departmentId: DepartmentId, members: string[]): Channel {
    return new Channel({
      id: `channel-dept-${departmentId}`,
      name: `Department: ${departmentId}`,
      type: 'department',
      members,
      description: `Internal channel for ${departmentId} department`,
    })
  }

  /**
   * Create a project channel
   */
  static createProjectChannel(projectId: string, name: string, members: string[]): Channel {
    return new Channel({
      id: `channel-project-${projectId}`,
      name: `Project: ${name}`,
      type: 'project',
      members,
      description: `Project channel for ${name}`,
    })
  }

  /**
   * Create a direct message channel between two agents
   */
  static createDirectChannel(agentId1: string, agentId2: string): Channel {
    const sortedIds = [agentId1, agentId2].sort()
    return new Channel({
      id: `channel-dm-${sortedIds[0]}-${sortedIds[1]}`,
      name: `DM: ${agentId1} <-> ${agentId2}`,
      type: 'direct',
      members: [agentId1, agentId2],
      isPrivate: true,
    })
  }

  /**
   * Create a broadcast channel
   */
  static createBroadcastChannel(name: string = 'All Hands'): Channel {
    return new Channel({
      id: 'channel-broadcast',
      name,
      type: 'broadcast',
      members: [],
      description: 'Company-wide announcements',
    })
  }
}

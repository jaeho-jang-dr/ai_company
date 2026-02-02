/**
 * AI Company - Message Bus
 * 에이전트간 통신을 위한 메시지 버스 시스템
 */

import { EventEmitter } from 'events'
import { v4 as uuidv4 } from 'uuid'
import { Message, MessageType, TaskPriority, TeamId, DepartmentId } from '../types'
import { Channel, ChannelFactory, ChannelType } from './Channel'
import { MessageProcessor, createDefaultProcessor, ProcessingResult } from './MessageProcessor'

export interface MessageBusConfig {
  enableProcessing?: boolean
  enableLogging?: boolean
  maxMessageHistory?: number
}

export interface Subscription {
  id: string
  subscriberId: string
  channelId: string
  callback: (message: Message) => void | Promise<void>
}

export class MessageBus extends EventEmitter {
  private channels: Map<string, Channel> = new Map()
  private subscriptions: Map<string, Subscription[]> = new Map()
  private messageHistory: Message[] = []
  private processor: MessageProcessor
  private config: Required<MessageBusConfig>

  constructor(config: MessageBusConfig = {}) {
    super()
    this.config = {
      enableProcessing: config.enableProcessing ?? true,
      enableLogging: config.enableLogging ?? false,
      maxMessageHistory: config.maxMessageHistory ?? 1000,
    }
    this.processor = createDefaultProcessor()

    // Create default broadcast channel
    const broadcastChannel = ChannelFactory.createBroadcastChannel()
    this.channels.set(broadcastChannel.id, broadcastChannel)
  }

  // ============================================================
  // CHANNEL MANAGEMENT
  // ============================================================

  /**
   * Create or get a channel
   */
  getOrCreateChannel(channelId: string, config?: { name: string; type: ChannelType; members?: string[] }): Channel {
    if (this.channels.has(channelId)) {
      return this.channels.get(channelId)!
    }

    if (!config) {
      throw new Error(`Channel ${channelId} not found and no config provided`)
    }

    const channel = new Channel({
      id: channelId,
      name: config.name,
      type: config.type,
      members: config.members,
    })

    this.channels.set(channelId, channel)
    this.emit('channel-created', { channel: channelId })
    return channel
  }

  /**
   * Get a channel by ID
   */
  getChannel(channelId: string): Channel | undefined {
    return this.channels.get(channelId)
  }

  /**
   * Create a team channel
   */
  createTeamChannel(teamId: TeamId, members: string[]): Channel {
    const channel = ChannelFactory.createTeamChannel(teamId, members)
    this.channels.set(channel.id, channel)
    return channel
  }

  /**
   * Create a department channel
   */
  createDepartmentChannel(departmentId: DepartmentId, members: string[]): Channel {
    const channel = ChannelFactory.createDepartmentChannel(departmentId, members)
    this.channels.set(channel.id, channel)
    return channel
  }

  /**
   * Create a project channel
   */
  createProjectChannel(projectId: string, name: string, members: string[]): Channel {
    const channel = ChannelFactory.createProjectChannel(projectId, name, members)
    this.channels.set(channel.id, channel)
    return channel
  }

  /**
   * Get or create a direct message channel
   */
  getDirectChannel(agentId1: string, agentId2: string): Channel {
    const sortedIds = [agentId1, agentId2].sort()
    const channelId = `channel-dm-${sortedIds[0]}-${sortedIds[1]}`

    if (this.channels.has(channelId)) {
      return this.channels.get(channelId)!
    }

    const channel = ChannelFactory.createDirectChannel(agentId1, agentId2)
    this.channels.set(channel.id, channel)
    return channel
  }

  /**
   * Get all channels
   */
  getAllChannels(): Channel[] {
    return Array.from(this.channels.values())
  }

  /**
   * Get channels by type
   */
  getChannelsByType(type: ChannelType): Channel[] {
    return this.getAllChannels().filter(c => c.type === type)
  }

  /**
   * Get channels for a member
   */
  getChannelsForMember(memberId: string): Channel[] {
    return this.getAllChannels().filter(c => c.hasMember(memberId))
  }

  // ============================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================

  /**
   * Subscribe to a channel
   */
  subscribe(
    subscriberId: string,
    channelId: string,
    callback: (message: Message) => void | Promise<void>
  ): Subscription {
    const subscription: Subscription = {
      id: uuidv4(),
      subscriberId,
      channelId,
      callback,
    }

    const channelSubs = this.subscriptions.get(channelId) || []
    channelSubs.push(subscription)
    this.subscriptions.set(channelId, channelSubs)

    // Add subscriber to channel members
    const channel = this.channels.get(channelId)
    if (channel) {
      channel.addMember(subscriberId)
    }

    this.emit('subscribed', { subscriber: subscriberId, channel: channelId })
    return subscription
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(subscriptionId: string): boolean {
    for (const [channelId, subs] of this.subscriptions.entries()) {
      const index = subs.findIndex(s => s.id === subscriptionId)
      if (index !== -1) {
        const sub = subs[index]
        subs.splice(index, 1)
        this.subscriptions.set(channelId, subs)
        this.emit('unsubscribed', { subscriber: sub.subscriberId, channel: channelId })
        return true
      }
    }
    return false
  }

  /**
   * Unsubscribe all subscriptions for a subscriber
   */
  unsubscribeAll(subscriberId: string): number {
    let count = 0
    for (const [channelId, subs] of this.subscriptions.entries()) {
      const filtered = subs.filter(s => s.subscriberId !== subscriberId)
      count += subs.length - filtered.length
      this.subscriptions.set(channelId, filtered)
    }
    return count
  }

  // ============================================================
  // MESSAGE SENDING
  // ============================================================

  /**
   * Create a message
   */
  createMessage(
    type: MessageType,
    from: string,
    to: string | string[] | 'all' | TeamId | DepartmentId,
    subject: string,
    content: string,
    options?: {
      data?: unknown
      priority?: TaskPriority
      requiresResponse?: boolean
      expiresAt?: Date
    }
  ): Message {
    return {
      id: uuidv4(),
      type,
      from,
      to,
      subject,
      content,
      data: options?.data,
      priority: options?.priority || 'normal',
      requiresResponse: options?.requiresResponse || false,
      timestamp: new Date(),
      expiresAt: options?.expiresAt,
    }
  }

  /**
   * Send a message
   */
  async send(message: Message): Promise<ProcessingResult | null> {
    // Process message through middleware if enabled
    let result: ProcessingResult | null = null
    if (this.config.enableProcessing) {
      result = await this.processor.process(message)
      if (!result.success) {
        this.emit('message-error', { message, errors: result.errors })
        return result
      }
    }

    // Add to history
    this.addToHistory(message)

    // Route message based on recipient
    await this.routeMessage(message)

    this.emit('message-sent', { message })
    return result
  }

  /**
   * Send a direct message
   */
  async sendDirect(
    from: string,
    to: string,
    subject: string,
    content: string,
    options?: { data?: unknown; priority?: TaskPriority; requiresResponse?: boolean }
  ): Promise<void> {
    const message = this.createMessage('direct', from, to, subject, content, options)
    await this.send(message)
  }

  /**
   * Broadcast a message to all
   */
  async broadcast(
    from: string,
    subject: string,
    content: string,
    options?: { data?: unknown; priority?: TaskPriority }
  ): Promise<void> {
    const message = this.createMessage('broadcast', from, 'all', subject, content, options)
    await this.send(message)
  }

  /**
   * Send a task assignment message
   */
  async sendTaskAssignment(
    from: string,
    to: string | string[],
    taskId: string,
    taskDetails: unknown
  ): Promise<void> {
    const message = this.createMessage(
      'task-assignment',
      from,
      to,
      `Task Assignment: ${taskId}`,
      `You have been assigned a new task.`,
      { data: { taskId, ...taskDetails as object }, priority: 'high', requiresResponse: true }
    )
    await this.send(message)
  }

  /**
   * Send an escalation message
   */
  async sendEscalation(
    from: string,
    to: string | string[],
    subject: string,
    reason: string,
    taskId?: string
  ): Promise<void> {
    const message = this.createMessage(
      'escalation',
      from,
      to,
      subject,
      reason,
      { data: { taskId, reason }, priority: 'critical', requiresResponse: true }
    )
    await this.send(message)
  }

  // ============================================================
  // MESSAGE ROUTING
  // ============================================================

  private async routeMessage(message: Message): Promise<void> {
    const { to } = message

    // Broadcast to all
    if (to === 'all') {
      await this.deliverToAll(message)
      return
    }

    // Array of recipients
    if (Array.isArray(to)) {
      await Promise.all(to.map(recipient => this.deliverToAgent(message, recipient)))
      return
    }

    // Check if it's a team or department channel
    if (this.channels.has(`channel-team-${to}`)) {
      await this.deliverToChannel(`channel-team-${to}`, message)
      return
    }

    if (this.channels.has(`channel-dept-${to}`)) {
      await this.deliverToChannel(`channel-dept-${to}`, message)
      return
    }

    // Direct to agent
    await this.deliverToAgent(message, to)
  }

  private async deliverToAgent(message: Message, agentId: string): Promise<void> {
    // Find all subscriptions for this agent
    for (const [channelId, subs] of this.subscriptions.entries()) {
      for (const sub of subs) {
        if (sub.subscriberId === agentId) {
          try {
            await sub.callback(message)
          } catch (error) {
            this.emit('delivery-error', { message, agent: agentId, error })
          }
        }
      }
    }

    this.emit('message-delivered', { message, recipient: agentId })
  }

  private async deliverToChannel(channelId: string, message: Message): Promise<void> {
    const channel = this.channels.get(channelId)
    if (!channel) return

    channel.postMessage(message)

    const subs = this.subscriptions.get(channelId) || []
    await Promise.all(
      subs.map(async sub => {
        try {
          await sub.callback(message)
        } catch (error) {
          this.emit('delivery-error', { message, subscriber: sub.subscriberId, error })
        }
      })
    )
  }

  private async deliverToAll(message: Message): Promise<void> {
    const broadcastChannel = this.channels.get('channel-broadcast')
    if (broadcastChannel) {
      broadcastChannel.postMessage(message)
    }

    // Deliver to all subscriptions across all channels
    for (const [channelId, subs] of this.subscriptions.entries()) {
      await Promise.all(
        subs.map(async sub => {
          try {
            await sub.callback(message)
          } catch (error) {
            this.emit('delivery-error', { message, subscriber: sub.subscriberId, error })
          }
        })
      )
    }
  }

  // ============================================================
  // MESSAGE HISTORY
  // ============================================================

  private addToHistory(message: Message): void {
    this.messageHistory.push(message)

    // Trim history if needed
    if (this.messageHistory.length > this.config.maxMessageHistory) {
      this.messageHistory = this.messageHistory.slice(-this.config.maxMessageHistory)
    }
  }

  getMessageHistory(limit?: number): Message[] {
    if (limit) {
      return this.messageHistory.slice(-limit)
    }
    return [...this.messageHistory]
  }

  getMessagesByType(type: MessageType): Message[] {
    return this.messageHistory.filter(m => m.type === type)
  }

  getMessagesByAgent(agentId: string): Message[] {
    return this.messageHistory.filter(m => m.from === agentId || m.to === agentId)
  }

  // ============================================================
  // STATISTICS
  // ============================================================

  getStats(): object {
    return {
      channels: this.channels.size,
      subscriptions: Array.from(this.subscriptions.values()).flat().length,
      messagesInHistory: this.messageHistory.length,
      channelsByType: {
        team: this.getChannelsByType('team').length,
        department: this.getChannelsByType('department').length,
        project: this.getChannelsByType('project').length,
        direct: this.getChannelsByType('direct').length,
        broadcast: this.getChannelsByType('broadcast').length,
      },
    }
  }
}

/**
 * Create a singleton instance
 */
let messageBusInstance: MessageBus | null = null

export function getMessageBus(config?: MessageBusConfig): MessageBus {
  if (!messageBusInstance) {
    messageBusInstance = new MessageBus(config)
  }
  return messageBusInstance
}

export function resetMessageBus(): void {
  messageBusInstance = null
}

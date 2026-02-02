/**
 * AI Company - Communication Module
 * 에이전트간 통신 시스템
 */

export { Channel, ChannelFactory, type ChannelConfig, type ChannelType } from './Channel'
export {
  MessageProcessor,
  validationMiddleware,
  timestampMiddleware,
  priorityMiddleware,
  loggingMiddleware,
  createRateLimitMiddleware,
  createDefaultProcessor,
  type MessageMiddleware,
  type ProcessingResult,
} from './MessageProcessor'
export {
  MessageBus,
  getMessageBus,
  resetMessageBus,
  type MessageBusConfig,
  type Subscription,
} from './MessageBus'

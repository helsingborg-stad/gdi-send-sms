
import { MessageBody } from '../../types'
import { tryCreateAmqpFromEnv } from './providers/amqp'

/**
 * Required signature of a provider
 */
export type QueueListenProvider = (handler: (message: MessageBody) => Promise<void> ) => Promise<void>

/**
  * The signature of the Queue service
  */
export interface QueueService {
	listen: QueueListenProvider
 }
 
/**
  * Handler for missing providers
  */
const missingProvider = (): QueueListenProvider => { throw Error('Missing Queue provider') }

/**
 * Service instantiation from environment configuration
 * @returns A QueueService instance
 */
export const getQueueServiceFromEnv = (): QueueService => {
	return {
		listen: tryCreateAmqpFromEnv() || missingProvider(),
	}
}

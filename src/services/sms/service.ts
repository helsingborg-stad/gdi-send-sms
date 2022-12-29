import { SmsMessage } from '../../types'
import { createDefaultSmsProvider } from './providers/default'
import { tryCreateHelsingborgFromEnv } from './providers/helsingborg'

/**
 * Required signature of a provider
 */
export type SmsSendProvider = ({ receiver, message }: SmsMessage) => Promise<void>

/**
 * The signature of the SMS service
 */
export interface SmsService {
    send: SmsSendProvider
}

/**
 * Service instantiation from environment configuration
 * @returns An SmsService instance
 */
export const getSmsServiceFromEnv = (): SmsService => {
	return {
		send: tryCreateHelsingborgFromEnv() || createDefaultSmsProvider(),
	}
}

/**
 * Static execution of Service
 * @returns An SmsService instance
 */
export const getSmsService = (): SmsService => ({ send: createDefaultSmsProvider() })

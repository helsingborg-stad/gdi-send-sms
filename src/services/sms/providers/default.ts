import { SmsSendProvider } from '../service'

/**
 * Default action prints the message to console
 * @returns An SmsSendProvider instance
 */
export const createDefaultSmsProvider = (): SmsSendProvider => async ({ receiver, message }) => { console.log (`To: ${receiver}\nSubject:\nBody: ${message}`) }
	

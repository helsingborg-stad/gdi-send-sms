import { SmsSendProvider } from '../service'

/**
 * Example provider. Prints the message to console
 * @returns An SmsSendProvider instance
 */
export const createDefaultSmsProvider = (): SmsSendProvider => async ({ receiver, message }) => { console.log ([
	`To: ${receiver}`,
	`Message: ${message}`,
].join('\n'))
}
	

import { getEnv } from '@helsingborg-stad/gdi-api-node'
import * as superagent from 'superagent'
import { v4 as uuidv4 } from 'uuid'
import { SmsSendProvider } from '../service'

export interface SmsSendParams {
	proxyUrl: string;
	proxyKey: string;
}

/**
 * Helsingborgs stad sms provider
 * @returns An SmsSendProvider instance
 */
export const tryCreateHelsingborgFromEnv = (): SmsSendProvider => {
	if (getEnv('SMS_PROVIDER', { fallback: '' }) !== 'helsingborg') {
		return null
	}
	const params = {
		proxyUrl: getEnv('SMS_PROXY_URL'),
		proxyKey: getEnv('SMS_PROXY_KEY'),
	}
	return async ({ receiver, message }) => send(params, receiver, message)
}

const send = async (params: SmsSendParams, receiver: string, message: string): Promise<void> => {
	const body = {
		jsonapi: {
			version: '1.0',
		},
		data: {
			type: 'sms',
			id: uuidv4(),
			attributes: {
				receiver,
				message,
			},
		},
	}

	await superagent.post(params.proxyUrl)
		.send(body)
		.set('X-API-Key', params.proxyKey)
		.set('accept', 'json')
}

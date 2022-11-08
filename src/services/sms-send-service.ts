import { SmsSendService } from '../types'
import * as superagent from 'superagent'
import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { v4 as uuidv4 } from 'uuid'

const createSmsSendServiceFromEnv = (): SmsSendService => createSmsSendService(
	getEnv('SMS_PROXY_URL', { trim: true }),
	getEnv('SMS_PROXY_KEY', { trim: true })
)

const createSmsSendService = (smsProxyUrl: string, smsProxyKey: string): SmsSendService => ({
	send: async ({ to, content }) => {
		const body = {
			jsonapi: {
				version: '1.0',
			},
			data: {
				type: 'sms',
				id: uuidv4(),
				attributes: {
					receiver: to,
					message: content,
				},
			},
		}

		await superagent.post(smsProxyUrl)
			.send(body)
			.set('X-API-Key', smsProxyKey)
			.set('accept', 'json')
	},
})

export { createSmsSendService, createSmsSendServiceFromEnv }
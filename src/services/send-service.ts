import { SendService } from '../types'
import * as superagent from 'superagent'
import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { v4 as uuidv4 } from 'uuid'

const getSendServiceFromEnv = (): SendService => getSendService(
	getEnv('SMS_PROXY_URL'),
	getEnv('SMS_PROXY_KEY')
)

const getSendService = (smsProxyUrl: string, smsProxyKey: string): SendService => ({
	send: async ({ receiver, message }) => {
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

		await superagent.post(smsProxyUrl)
			.send(body)
			.set('X-API-Key', smsProxyKey)
			.set('accept', 'json')
	},
})

export { getSendService, getSendServiceFromEnv }
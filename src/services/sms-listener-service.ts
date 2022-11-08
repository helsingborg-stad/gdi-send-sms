
import { SmsListenerService, MqMessageEnvelope, MqEngine } from '../types'
import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { createAmqpEngine } from '../helpers/amqp-engine'

const createSmsListenerServiceFromEnv = (): SmsListenerService => createSmsListenerService({
	uri: getEnv('AMQP_URI', { trim: true }),
	exchange: getEnv('AMQP_EXCHANGE',{ trim: true }),
	queue: getEnv('AMQP_QUEUE',{ trim: true }),
	filter: getEnv('AMQP_FILTER',{ trim: true }),
},
createAmqpEngine()
)

type SmsListenerServiceParams = {
	uri: string;
	exchange: string;
	queue: string;
	filter: string;
}

const createSmsListenerService = ({ uri, exchange, queue, filter }: SmsListenerServiceParams, engine: MqEngine, infinite = true): SmsListenerService  => ({
	listen: async (handler) => {
		// Connection setup (Assign graceful close on Ctrl+C)
		console.debug(`Connecting to ${uri}...`)
		await engine.connect(uri)
		process.once('SIGINT', async () => {
			await engine.close()
		})

		// Channel creation
		console.debug('Creating channel...')
		await engine.createChannel()

		// Exchange creation/verification
		console.debug(`Asserting durable topic exchange (${exchange}) ...`)
		await engine.assertExchange(exchange)

		// Queue creation/verification
		console.debug(`Asserting durable queue (${queue})...`)
		await engine.assertQueue(queue)

		// Queue binding
		console.debug('Binding queue...')
		await engine.bindQueue(queue, exchange, filter)
		
		console.debug('waiting for messages. Ctrl-C to exit...')	

		// Define message processor
		const messageProcessor = async (message: MqMessageEnvelope) => {
			console.debug(`Got message with routingkey = ${message?.fields?.routingKey}\r\n${message.content.toString()}\r\n`)

			try {
				await handler(JSON.parse(message.content.toString()))
			}
			catch(error) {
				console.debug(`Failed to send message (${error})`)
			}
			finally {
				await engine.ack(message).catch(() => console.debug('Failed to ack message'))
			}
		}
		// Message loop (Breaks on CTRL+C)
		let didFail = false
		do {
			await engine.consume(queue, messageProcessor).catch(() => didFail = true)
		} while (infinite && !didFail)
	},
})

export { createSmsListenerServiceFromEnv, createSmsListenerService }


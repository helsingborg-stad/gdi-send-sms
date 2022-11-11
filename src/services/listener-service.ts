
import { ListenerService, MqMessageEnvelope, MqEngine } from '../types'
import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { createAmqpEngine } from '../helpers/amqp-engine'

type ListenerServiceParams = {
	uri: string;
	exchange: string;
	queue: string;
	filter: string;
}

const getListenerServiceFromEnv = (): ListenerService => getListenerService({
	uri: getEnv('AMQP_URI'),
	exchange: getEnv('AMQP_EXCHANGE'),
	queue: getEnv('AMQP_QUEUE'),
	filter: getEnv('AMQP_FILTER'),
}, createAmqpEngine())

const getListenerService = ({ uri, exchange, queue, filter }: ListenerServiceParams, engine: MqEngine, debug: (data: string) => void = console.debug, infinite = true): ListenerService  => ({
	listen: async (handler) => {
		debug(`Connecting to ${uri}...`)
		await engine.connect(uri)
		// Assign graceful close on Ctrl+C)
		process.once('SIGINT', async () => {
			await engine.close()
		})

		debug('Creating channel...')
		await engine.createChannel()

		debug(`Asserting durable topic exchange (${exchange}) ...`)
		await engine.assertExchange(exchange)

		debug(`Asserting durable queue (${queue})...`)
		await engine.assertQueue(queue)

		debug(`Binding queue with filter (${filter})...`)
		await engine.bindQueue(queue, exchange, filter)
		
		debug('waiting for messages. Ctrl-C to exit...')	

		// Message loop (Breaks on CTRL+C)
		let didFail = false
		do {
			await engine.consume(queue, async (message: MqMessageEnvelope) => { 
				debug(message.content.toString())
	
				try {
					await handler(JSON.parse(message.content.toString()))
				}
				catch(error) {
					debug(`Failed to send message (${error})`)
				}
				finally {
					await engine.ack(message).catch(() => debug('Failed to ack message'))
				}
			}).catch(() => didFail = true)
		} while (infinite && !didFail)
	},
})

export { getListenerServiceFromEnv, getListenerService }


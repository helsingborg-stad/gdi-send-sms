
import { ListenerService, MqMessageEnvelope, MqEngine } from '../types'
import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { createAmqpEngine } from '../helpers/amqp-engine'

type ListenerServiceParams = {
	uri: string;
	exchange: string;
	queue: string;
	topic: string;
}

const getListenerServiceFromEnv = (): ListenerService => getListenerService({
	uri: getEnv('AMQP_URI'),
	exchange: getEnv('AMQP_EXCHANGE'),
	queue: getEnv('AMQP_QUEUE'),
	topic: getEnv('AMQP_FILTER'),
}, createAmqpEngine())

const getListenerService = ({ uri, exchange, queue, topic }: ListenerServiceParams, engine: MqEngine, debug: (data: string) => void = console.debug): ListenerService  => ({
	listen: async (handler) => {
		debug(`Connecting to ${uri}...`)
		await engine.connect(uri)

		debug('Creating channel...')
		await engine.createChannel()

		debug(`Asserting durable topic exchange (${exchange}) ...`)
		await engine.assertExchange(exchange)

		debug(`Asserting durable queue (${queue})...`)
		await engine.assertQueue(queue)

		debug(`Binding queue with topic (${topic})...`)
		await engine.bindQueue(queue, exchange, topic)
	
		process.once('SIGINT', async () => {
			await engine.close()
		})

		debug('waiting for messages. Ctrl-C to exit...')	

		await engine.consume(queue, async (message: MqMessageEnvelope) => { 
			debug(message.content.toString())
	
			await handler(JSON.parse(message.content.toString())).then(() => {
				engine.ack(message)
			}).catch(() => {
				engine.nack(message)
			})
		})
	},
})

export { getListenerServiceFromEnv, getListenerService }


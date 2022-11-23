
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
		debug(`Connecting to ('${uri}')...`)
		await engine.connect(uri).then(() => process.once('SIGINT', async () => {
			debug('Perfoming graceful exit...')
			await engine.close()
		}))
		debug('Creating channel...')
		await engine.createChannel()

		debug(`Asserting durable topic exchange ('${exchange}') ...`)
		await engine.assertExchange(exchange)

		debug(`Asserting durable queue ('${queue}')...`)
		await engine.assertQueue(queue)

		debug(`Binding queue with topic ('${topic}')...`)
		await engine.bindQueue(queue, exchange, topic)
	
		debug('Waiting for messages. Ctrl-C to exit...')

		await engine.consume(queue, async (message: MqMessageEnvelope) => { 			
			const payload = JSON.parse(message.content.toString())
			
			debug(`${getId(message)} Message RECEIVED, Number: ('${payload.number}')`)

			handler(payload).then(() => {
				engine.ack(message)
				debug(`${getId(message)} Message send SUCCEEDED`)
			}).catch((error) => {
				engine.nack(message)
				debug(`${getId(message)} Message send FAILED with status ('${error.status}')`)
			})
		})
	},
})
const getId = (message: MqMessageEnvelope): string => `${message.fields.deliveryTag}/${Number(message.fields.redelivered)}`

export { getListenerServiceFromEnv, getListenerService }
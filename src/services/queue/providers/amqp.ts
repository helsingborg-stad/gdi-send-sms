import { getEnv } from '@helsingborg-stad/gdi-api-node'
import * as amqp from 'amqplib'
import { QueueListenProvider } from '../service'

export type QueueServiceParams = {
	uri: string;
	exchange: string;
	queue: string;
	topic: string;
}

export interface MessageEnvelope {
    content: Buffer;
    fields: {
        routingKey: string;
        deliveryTag: number;
        redelivered: boolean;
        exchange: string;
    };
    properties: any;
}

export interface AbstractQueue {
	connect?: (uri: string) => Promise<void>;
	close?: () => Promise<void>;
    ack?: (message: MessageEnvelope) => Promise<void>;
    nack?: (message: MessageEnvelope) => Promise<void>;
    createChannel?: () => Promise<void>;
	assertExchange?: (exchange: string) => Promise<void>;
	assertQueue?: (name: string) => Promise<void>;
	bindQueue?: (queue: string, exchange: string, topic: string) => Promise<void>;
	consume?: (queue: string, handler: (message: MessageEnvelope) => Promise<void>) => Promise<void>;
}

export const tryCreateAmqpFromEnv = (): QueueListenProvider => {
	if (getEnv('QUEUE_PROVIDER', { fallback: '' }) !== 'amqp') {
		return null
	}
	return listen({
		uri: getEnv('AMQP_URI'),
		exchange: getEnv('AMQP_EXCHANGE'),
		queue: getEnv('AMQP_QUEUE'),
		topic: getEnv('AMQP_FILTER'),
	}, createAmqpEngine())
}


export const listen = ({ uri, exchange, queue, topic }: QueueServiceParams, engine: AbstractQueue, debug: (data: string) => void = console.debug): QueueListenProvider => {
	return async (handler) => {
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

		await engine.consume(queue, async (message: MessageEnvelope) => { 			
			const payload = JSON.parse(message.content.toString())
			
			debug(`${getId(message)} Message RECEIVED, Address: ('${payload.number}')`)

			handler(payload).then(() => {
				engine.ack(message)
				debug(`${getId(message)} Message send SUCCEEDED`)
			}).catch((error) => {
				engine.nack(message)
				debug(`${getId(message)} Message send FAILED with status ('${error.status}')`)
			})
		})
	}
}
const getId = (message: MessageEnvelope): string => `${message.fields.deliveryTag}/${Number(message.fields.redelivered)}`

const createAmqpEngine = (): AbstractQueue => {
	let connection: amqp.Connection
	let channel: amqp.Channel
	
	return {
		async connect(uri: string): Promise<void> {
			connection = await amqp.connect(uri)
		},
		async createChannel(): Promise<void> {
			channel = await connection.createChannel() 
		},
		async assertExchange(exchange: string): Promise<void> {
			await channel.assertExchange(exchange, 'topic')
		},
		async assertQueue(name: string): Promise<void> {
			await channel.assertQueue(name, {
				arguments: {
					'x-queue-type': 'quorum',
					'x-delivery-limit': 5,
				},
			})
		},
		async bindQueue(queue: string, exchange: string, topic: string): Promise<void> {
			await channel.bindQueue(queue, exchange, topic)
		},
		async close(): Promise<void> {
			await connection.close()	
		},
		async consume(queue: string, handler: (message) => void): Promise<void> {
			await channel.consume(queue, handler)
		},
		async ack(message: MessageEnvelope): Promise<void> {
			channel.ack(message)
		},
		async nack(message: MessageEnvelope): Promise<void> {
			channel.nack(message, false, true)
		},
	}
}

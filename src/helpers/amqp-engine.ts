
import * as amqp from 'amqplib'
import { MqEngine, MqMessageEnvelope } from '../types'

class AmqpEngine implements MqEngine {
	private connection: amqp.Connection = undefined
	private channel: amqp.Channel = undefined
	
	async connect(uri: string): Promise<void> {
		this.connection = await amqp.connect(uri)
	}
	async createChannel(): Promise<void> {
		this.channel = await this.connection.createChannel() 
	}
	async assertExchange(exchange: string): Promise<void> {
		await this.channel.assertExchange(exchange, 'topic')
	}
	async assertQueue(name: string): Promise<void> {
		await this.channel.assertQueue(name)
	}
	async bindQueue(queue: string, exchange: string, filter: string): Promise<void> {
		await this.channel.bindQueue(queue, exchange, filter)
	}
	async close(): Promise<void> {
		await this.connection.close()	
	}
	async consume(queue: string, handler: (message) => void): Promise<void> {
		await this.channel.consume(queue, handler)
	}
	async ack(message: MqMessageEnvelope): Promise<void> {
		this.channel.ack(message)
	}
}

export { AmqpEngine }

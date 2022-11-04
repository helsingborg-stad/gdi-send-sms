
import { MqMessageBody, SmsListenerService, MqMessageEnvelope, MqEngine } from '../types'
import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { AmqpEngine } from '../helpers/amqp-engine'

const createSmsListenerServiceFromEnv = (): SmsListenerService => createSmsListenerService(
	getEnv('AMQP_URI', { trim: true, fallback: 'amqp://<user>:<password>@localhost:<port>' }),
	getEnv('AMQP_EXCHANGE',{ trim: true, fallback: 'gdi-about-me-person-changed' }),
	getEnv('SMS_QUEUE',{ trim: true, fallback: 'sms-queue' }),
	getEnv('SMS_FILTER',{ trim: true, fallback: 'phone.changed' }),
	new AmqpEngine()
)

const createSmsListenerService = (uri: string, exchange: string, queue: string, filter: string, engine: MqEngine, infinite = true): SmsListenerService  => ({
	listen: async (handler) => {
		// Connection setup (Assign graceful close on Ctrl+C)
		console.debug(`Connecting to ${uri}...`)
		try {
			await engine.connect(uri)
			process.once('SIGINT', async () => {
				await engine.close()
			})	
		} catch (error) {
			throw Error(`Unrecoverable error while connecting (${error})`)
		}
		// Channel creation
		console.debug('Creating channel...')
		try {
			await engine.createChannel()
		} catch (error) {
			throw Error(`Unrecoverable error while creating channel (${error})`)
		}

		// Exchange creation/verification
		console.debug(`Asserting durable topic exchange (${exchange}) ...`)
		try {
			await engine.assertExchange(exchange)
		} catch(error) {
			throw Error(`Unrecoverable error while asserting exchange (${error})`)
		}

		// Queue creation/verification
		console.log(`Asserting durable queue (${queue})...`)
		try {
			await engine.assertQueue(queue)
		}
		catch(error) {
			throw Error(`Unrecoverable error while asserting durable queue (${error})`)
		}

		// Queue binding
		console.log('Binding queue...')
		try {
			await engine.bindQueue(queue, exchange, filter)
		}
		catch(error) {
			throw Error(`Unrecoverable error while binding to queue (${queue}) (${error})`)
		}
		
		console.log('waiting for messages. Ctrl-C to exit...')	

		// Define message processor
		const messageProcessor = async (message: MqMessageEnvelope) => {
			console.debug(`got message with routingkey = ${message?.fields?.routingKey}\r\n${message.content.toString()}\r\n`)
				
			try {
				await handler(JSON.parse(message.content.toString()))	
			}
			catch(error) {
				console.debug(`Failed to send message (${error})`)
			}
			finally {
				engine.ack(message)	
			}
		}
		// Message loop (Breaks on CTRL+C)
		do {
			try {
				await engine.consume(queue, messageProcessor)
			} catch {
				break
			}			
		} while (infinite)
	},
})

export { createSmsListenerServiceFromEnv, createSmsListenerService }


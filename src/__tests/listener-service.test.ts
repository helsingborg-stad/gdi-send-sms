
import { MqEngine } from '../types'
import { getListenerService } from '../services/listener-service'

const emptyHandler = async () => {
	return
}

enum STATUS {
	EMPTY,
	ACK_CALLED,
	NACK_CALLED,
}

const testParams = { uri: '<host>', exchange: '<exchange>', queue: '<queue>', filter: '<filter>' }

it('should throw on an unrecoverable connection issue', async () => {
	const engine: MqEngine = ({
		connect: async () => { throw Error('Connect') },
	})
	await expect(getListenerService(testParams, engine, emptyHandler, false).listen(emptyHandler)).rejects.toThrowError('Connect')
})

it('should throw on an unrecoverable channel creation issue', async () => {
	const engine: MqEngine = ({
		connect: async () => Promise.resolve(),
		createChannel: async () => { throw Error('CreateChannel')},
	})
	await expect(getListenerService(testParams, engine, emptyHandler, false).listen(emptyHandler)).rejects.toThrowError('CreateChannel')
})

it('should throw on an unrecoverable assert exchange issue', async () => {
	const engine: MqEngine = ({
		connect: async () => Promise.resolve(),
		createChannel: async () => Promise.resolve(),
		assertExchange: async ()  => { throw Error('AssertExchange')},
	})
	await expect(getListenerService(testParams, engine, emptyHandler, false).listen(emptyHandler)).rejects.toThrowError('AssertExchange')
})

it('should throw on an unrecoverable assert queue issue', async () => {
	const engine: MqEngine = ({
		connect: async () => Promise.resolve(),
		createChannel: async () => Promise.resolve(),
		assertExchange: async ()  => Promise.resolve(),
		assertQueue: async () => { throw Error('AssertQueue') },
	})
	await expect(getListenerService(testParams, engine, emptyHandler, false).listen(emptyHandler)).rejects.toThrowError('AssertQueue')
})

it('should throw on an unrecoverable bind queue issue', async () => {
	const engine: MqEngine = ({
		connect: async () => Promise.resolve(),
		createChannel: async () => Promise.resolve(),
		assertExchange: async ()  => Promise.resolve(),
		assertQueue: async () => Promise.resolve(),
		bindQueue: async () => { throw Error('BindQueue') },
	})
	await expect(getListenerService(testParams, engine, emptyHandler, false).listen(emptyHandler)).rejects.toThrowError('BindQueue')
})

describe('should call ack after successful send', () => {
	let status: STATUS = STATUS.EMPTY

	const engine: MqEngine = ({
		connect: async () => Promise.resolve(),
		createChannel: async () => Promise.resolve(),
		assertExchange: async ()  => Promise.resolve(),
		assertQueue: async () => Promise.resolve(),
		bindQueue: async () => Promise.resolve(),
		consume: async (queue, handler) => {
			handler({
				content: Buffer.from(JSON.stringify(
					{
						number: '+46722334451',
						verificationCode: 'dcd77d41-c1fa-4d90-851a-4d5f03d0183a',
						isVerified: false,
						verifiedDate: null,
					})),
				fields: {
					routingKey: 'phone.changed',
					deliveryTag: 0,
					redelivered: false,
					exchange: '<exchange>',
				},
				properties: {},
			})
					
		},
		ack: async () => { status = STATUS.ACK_CALLED },
		nack: async () => { status = STATUS.NACK_CALLED },
	})

	it('should call ack after SUCCESSFUL send', async () => {
		await getListenerService(testParams, engine, emptyHandler, false).listen(emptyHandler)
		expect(status).toBe(STATUS.ACK_CALLED)
	})

	it('should call nack after FAILURE to send', async () => {
		await getListenerService(testParams, engine, emptyHandler, false).listen(async () => { throw Error('FailToSend') })
		expect(status).toBe(STATUS.NACK_CALLED)
	})
})

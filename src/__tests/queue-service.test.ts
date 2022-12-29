
import { AbstractQueue, listen } from '../services/queue/providers/amqp'

const emptyHandler = async () => {
	return
}

enum STATUS {
	EMPTY,
	ACK_CALLED,
	NACK_CALLED,
}

const testParams = { uri: '<host>', exchange: '<exchange>', queue: '<queue>', topic: '<filter>' }

it('should throw on an unrecoverable connection issue', async () => {
	const engine: AbstractQueue = ({
		connect: async () => { throw Error('Connect') },
	})
	const queueService = {
		listen: listen(testParams, engine, emptyHandler),
	}
	
	await expect(queueService.listen(emptyHandler)).rejects.toThrowError('Connect')
})

it('should throw on an unrecoverable channel creation issue', async () => {
	const engine = ({
		connect: async () => Promise.resolve(),
		createChannel: async () => { throw Error('CreateChannel')},
	})
	const queueService = {
		listen: listen(testParams, engine, emptyHandler),
	}
	await expect(queueService.listen(emptyHandler)).rejects.toThrowError('CreateChannel')
})

it('should throw on an unrecoverable assert exchange issue', async () => {
	const engine = ({
		connect: async () => Promise.resolve(),
		createChannel: async () => Promise.resolve(),
		assertExchange: async ()  => { throw Error('AssertExchange')},
	})
	const queueService = {
		listen: listen(testParams, engine, emptyHandler),
	}
	await expect(queueService.listen(emptyHandler)).rejects.toThrowError('AssertExchange')
})

it('should throw on an unrecoverable assert queue issue', async () => {
	const engine = ({
		connect: async () => Promise.resolve(),
		createChannel: async () => Promise.resolve(),
		assertExchange: async ()  => Promise.resolve(),
		assertQueue: async () => { throw Error('AssertQueue') },
	})
	const queueService = {
		listen: listen(testParams, engine, emptyHandler),
	}
	await expect(queueService.listen(emptyHandler)).rejects.toThrowError('AssertQueue')
})

it('should throw on an unrecoverable bind queue issue', async () => {
	const engine = ({
		connect: async () => Promise.resolve(),
		createChannel: async () => Promise.resolve(),
		assertExchange: async ()  => Promise.resolve(),
		assertQueue: async () => Promise.resolve(),
		bindQueue: async () => { throw Error('BindQueue') },
	})
	const queueService = {
		listen: listen(testParams, engine, emptyHandler),
	}
	await expect(queueService.listen(emptyHandler)).rejects.toThrowError('BindQueue')
})

describe('should call ack after successful send', () => {
	let status = STATUS.EMPTY

	const engine = ({
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
		const queueService = {
			listen: listen(testParams, engine, emptyHandler),
		}
		await queueService.listen(emptyHandler)
		expect(status).toBe(STATUS.ACK_CALLED)
	})

	it('should call nack after FAILURE to send', async () => {
		const queueService = {
			listen: listen(testParams, engine, emptyHandler),
		}
		await queueService.listen(async () => { throw Error('FailToSend') })
		expect(status).toBe(STATUS.NACK_CALLED)
	})
})

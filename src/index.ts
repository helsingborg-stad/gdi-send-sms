import { createServicesFromEnv } from './services'
import { Services } from './types'
const services: Services = createServicesFromEnv()

// Start daemon
services.queueService.listen(async message => await services.smsService.send({
	receiver: message.number,
	message: await services.contentService.build(message),
})).catch(err => {
	console.error(err)
	process.exit(1)
})

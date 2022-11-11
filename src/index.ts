import { createServicesFromEnv } from './services'
import { Services } from './types'
const services: Services = createServicesFromEnv()

/** Start daemon */
services.listenerService.listen(async message => await services.sendService.send({
	receiver: message.number,
	message: await services.contentService.build(message),
})).catch(err => {
	console.error(err)
	process.exit(1)
})

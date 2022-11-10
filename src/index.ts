import { createServicesFromEnv } from './services'
import { Services } from './types'
const services: Services = createServicesFromEnv()

/** Start daemon */
services.smsListenerService.listen(async message => await services.smsSendService.send({
	receiver: message.number,
	message: await services.smsContentService.build(message),
})).catch(err => {
	console.error(err)
	process.exit(1)
})

import { createServicesFromEnv } from './services'
import { Services } from './types'
const services: Services = createServicesFromEnv()

/** Start daemon */
services.smsListenerService.listen(async message => await services.smsSendService.send({
	to: message.number, 
	content: await services.smsContentService.build(message),
})).catch(err => {
	console.error(err)
	process.exit(1)
})

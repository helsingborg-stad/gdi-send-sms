import { getContentServiceFromEnv } from './services/content-service'
import { getListenerServiceFromEnv } from './services/listener-service'
import { getSendServiceFromEnv } from './services/send-service'
import { Services } from './types'

const createServicesFromEnv = (): Services => ({
	listenerService: getListenerServiceFromEnv(),
	contentService: getContentServiceFromEnv(),
	sendService: getSendServiceFromEnv(),
})

export { createServicesFromEnv }
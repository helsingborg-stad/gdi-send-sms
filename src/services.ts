import { createSmsContentServiceFromEnv } from './services/sms-content-service'
import { createSmsListenerServiceFromEnv } from './services/sms-listener-service'
import { createSmsSendServiceFromEnv } from './services/sms-send-service'
import { Services } from './types'

const createServicesFromEnv = (): Services => ({
	smsListenerService: createSmsListenerServiceFromEnv(),
	smsContentService: createSmsContentServiceFromEnv(),
	smsSendService: createSmsSendServiceFromEnv(),
})

export { createServicesFromEnv }
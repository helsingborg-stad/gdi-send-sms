import { getContentServiceFromEnv } from './services/content/service'
import { getQueueServiceFromEnv } from './services/queue/service'
import { getSmsServiceFromEnv } from './services/sms/service'
import { Services } from './types'

const createServicesFromEnv = (): Services => ({
	queueService: getQueueServiceFromEnv(),
	contentService: getContentServiceFromEnv(),
	smsService: getSmsServiceFromEnv(),
})

export { createServicesFromEnv }
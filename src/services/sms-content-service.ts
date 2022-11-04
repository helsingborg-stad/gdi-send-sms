import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { MqMessageBody, SmsContentService } from '../types'

const formatContent = (verificationCode: string, smsBasePath: string): string =>`Hej!
Tack för att du angett ditt telefonnummer på helsingborg.se
För att verifiera att det är ditt nummer, vänligen bekräfta genom
att klicka på denna länk: ${smsBasePath}/${verificationCode}`

const createSmsContentServiceFromEnv = (): SmsContentService => createSmsContentService(
	getEnv('SMS_BASEPATH', { trim: true, fallback: 'https://helsingborg.se/verify' })
)

const createSmsContentService = (smsBasePath: string): SmsContentService  => ({
	build: async (message: MqMessageBody): Promise<string> => formatContent(message.verificationCode, smsBasePath),
})

export { createSmsContentService, createSmsContentServiceFromEnv, formatContent }

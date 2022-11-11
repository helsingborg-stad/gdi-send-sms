import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { MqMessageBody, ContentService } from '../types'

const formatContent = (verificationCode: string, smsBasePath: string): string =>`Hej!
Tack för att du angett ditt telefonnummer på helsingborg.se
För att verifiera att det är ditt nummer, vänligen bekräfta genom
att klicka på denna länk: ${smsBasePath}/${verificationCode}`

const getContentServiceFromEnv = (): ContentService => getContentService(
	getEnv('SMS_BASEPATH')
)

const getContentService = (smsBasePath: string): ContentService  => ({
	build: async (message: MqMessageBody): Promise<string> => formatContent(message.verificationCode, smsBasePath),
})

export { getContentService, getContentServiceFromEnv, formatContent }

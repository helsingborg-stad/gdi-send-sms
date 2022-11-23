import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { MqMessageBody, ContentService } from '../types'

const formatContent = (verificationCode: string, basePath: string): string =>`Hej!
Tack för att du angett ditt telefonnummer på helsingborg.se
För att verifiera att det är ditt nummer, vänligen bekräfta genom
att klicka på denna länk: ${basePath}${verificationCode}`

const getContentServiceFromEnv = (): ContentService => getContentService(
	getEnv('SMS_BASEPATH')
)

const getContentService = (basePath: string): ContentService  => ({
	build: async (message: MqMessageBody): Promise<string> => formatContent(message.verificationCode, basePath),
})

export { getContentService, getContentServiceFromEnv, formatContent }

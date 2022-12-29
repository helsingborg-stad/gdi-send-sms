import { getEnv } from '@helsingborg-stad/gdi-api-node'
import { ContentBuildProvider } from '../service'

export const tryCreateHelsingborgFromEnv = (): ContentBuildProvider => {
	if (getEnv('CONTENT_PROVIDER', { fallback: '' }) !== 'helsingborg') {
		return null
	}
	const basePath = getEnv('CONTENT_VERIFICATION_PATH', { fallback: '' })

	return async (message) => build(message.verificationCode, basePath)
}

const build = (verificationCode: string, basePath: string): string =>`Hej!
Tack för att du angett ditt telefonnummer på helsingborg.se
För att verifiera att det är ditt nummer, vänligen bekräfta genom
att klicka på denna länk: ${basePath}${verificationCode}`

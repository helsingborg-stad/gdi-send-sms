import { getContentService, formatContent } from '../services/content-service'

it('returns a templated string with an injected verificationcode', async () => {
	expect(await getContentService('<base_path>').build({
		number: '+46722334451',
		verificationCode: 'dcd77d41-c1fa-4d90-851a-4d5f03d0183a',
		isVerified: false,
		verifiedDate: null,
	})).toEqual(formatContent('dcd77d41-c1fa-4d90-851a-4d5f03d0183a', '<base_path>'))
})

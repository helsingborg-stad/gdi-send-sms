import { getSmsService } from '../services/sms/service'

it('executes successfully', async () => {
	const message = {
		receiver: '+46723000000',
		message:'mybodytext',
	}
	await getSmsService().send(message)
})

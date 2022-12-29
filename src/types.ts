import { ContentService } from './services/content/service'
import { QueueService } from './services/queue/service'
import { SmsService } from './services/sms/service'

export interface Services {
    queueService: QueueService,
    contentService: ContentService,
    smsService: SmsService,
}

export interface SmsMessage {
    receiver: string;
    message: string;
}

export interface MessageBody {
    number: string;
    verificationCode: string;
    isVerified: false;
    verifiedDate: string | null;
}

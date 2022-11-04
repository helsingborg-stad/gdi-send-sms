export interface Services {
    smsListenerService: SmsListenerService,
    smsContentService: SmsContentService,
    smsSendService: SmsSendService,
}
export interface SmsSendService {
    send: ({ to, content } : SmsMessage) => Promise<void>
}
export interface SmsContentService {
    build: (message: MqMessageBody) => Promise<string>
}

export interface SmsListenerService {
    listen: (handler: (message: MqMessageBody) => Promise<void> ) => Promise<void>
}
export interface SmsMessage {
    to: string;
    content: string;
}
export interface MqMessageBody {
    number: string;
    verificationCode: string;
    isVerified: false;
    verifiedDate: string | null;
}
export interface MqMessageEnvelope {
    content: Buffer;
    fields: any;
    properties: any;
}
export interface MqEngine {
	connect?: (uri: string) => Promise<void>;
	close?: () => Promise<void>;
    ack?: (message: MqMessageEnvelope) => Promise<void>;
    createChannel?: () => Promise<void>;
	assertExchange?: (exchange: string) => Promise<void>;
	assertQueue?: (name: string) => Promise<void>;
	bindQueue?: (queue: string, exchange: string, filter: string) => Promise<void>;
	consume?: (queue: string, handler: (message: MqMessageEnvelope) => void) => Promise<void>;
}
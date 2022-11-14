export interface Services {
    listenerService: ListenerService,
    contentService: ContentService,
    sendService: SendService,
}
export interface SendService {
    send: ({ receiver, message } : SmsMessage) => Promise<void>
}
export interface ContentService {
    build: (message: MqMessageBody) => Promise<string>
}

export interface ListenerService {
    listen: (handler: (message: MqMessageBody) => Promise<void> ) => Promise<void>
}
export interface SmsMessage {
    receiver: string;
    message: string;
}
export interface MqMessageBody {
    number: string;
    verificationCode: string;
    isVerified: false;
    verifiedDate: string | null;
}
export interface MqMessageEnvelope {
    content: Buffer;
    fields: {
        routingKey: string;
        deliveryTag: number;
        redelivered: boolean;
        exchange: string;
    };
    properties: any;
}
export interface MqEngine {
	connect?: (uri: string) => Promise<void>;
	close?: () => Promise<void>;
    ack?: (message: MqMessageEnvelope) => Promise<void>;
    nack?: (message: MqMessageEnvelope) => Promise<void>;
    createChannel?: () => Promise<void>;
	assertExchange?: (exchange: string) => Promise<void>;
	assertQueue?: (name: string) => Promise<void>;
	bindQueue?: (queue: string, exchange: string, filter: string) => Promise<void>;
	consume?: (queue: string, handler: (message: MqMessageEnvelope) => Promise<void>) => Promise<void>;
}
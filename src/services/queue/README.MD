# Default sms queue provider

The default sms queue provider is using Rabbit MQ.

To enable it, our environment should contain:

```sh
QUEUE_PROVIDER=amqp
AMQP_URI=<The fully qualified uri of the AMPQ exchange>
AMQP_EXCHANGE=<The name of the AMPQ broker>
AMQP_QUEUE=<The name of the queue to receive messages from>
AMQP_FILTER=<The routing key to receive messages for>
```

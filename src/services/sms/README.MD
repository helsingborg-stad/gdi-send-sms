# Default sms send provider

The default sms send provider is just provided as an example.
It doesnt need any environment parameters as it is just writing to screen

## Helsingborgs stad sms send provider

The Helsingborgs stad sms content provider is sending the message through a
proxy API.

To enable it, our environment should contain:

```sh
SMS_PROVIDER=helsingborg
SMS_PROXY_URL=<The fully qualified URL of the SMS proxy service>
SMS_PROXY_KEY=<The API key to use for the SMS proxy service>
```

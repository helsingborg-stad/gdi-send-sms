# Default sms content provider

The default mail content provider is just provided as an example.
To enable it, our environment should contain

```sh
CONTENT_PROVIDER=default
```

## Helsingborgs stad sms content provider

The Helsingborgs stad sms content provider is a simple contentprovider
just providing a hardwired copy text with a verification url.
To enable it, our environment should contain

```sh
CONTENT_PROVIDER=helsingborg
CONTENT_VERIFICATION_PATH=<The fully qualified URL of the web page that verifies the change>
```

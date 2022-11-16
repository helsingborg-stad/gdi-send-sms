<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->

<a name="readme-top"></a>

<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

[![MIT License][license-shield]][license-url]

<p>
  <a href="https://github.com/helsingborg-stad/gdi-template">
    <img src="docs/images/hbg-github-logo-combo.png" alt="Logo" width="300">
  </a>
</p>
<h1>GDI SMS service</h1>
<p>
  <br />
  <a href="https://github.com/helsingborg-stad/gdi-template/issues">Report Bug</a>
  ·
  <a href="https://github.com/helsingborg-stad/gdi-template/issues">Request Feature</a>
</p>

#

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

This project is providing SMS capabilities to the GDI infrastructure. The current usecase is to provide a confirmation SMS to
a customer changing his/her phone number on the Mypages section of the web.

The service will retry sending a failed message 5 times before discarding it.

There are three services provided by the project:

- A listener service that subscribes to a RabbitMQ queue.
- An SMS content service that formats the messages to be sent
- An SMS send service that pushes the message to an external SMS proxy for delivery

```mermaid
sequenceDiagram
    autonumber
    participant MessageQueue
    participant ListenerService
    participant ContentService
    participant SendService

    MessageQueue->>+ListenerService: Event triggered
    ListenerService->>+ContentService: Build content
    ContentService-->>-ListenerService: Formatted content
    ListenerService->>+SendService: Send SMS message
    SendService-->>-ListenerService: Return
    alt Send successful
      ListenerService-->>MessageQueue: Acknowledge
    else Send failed
      ListenerService-->>-MessageQueue: Negative acknowledge
    end
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

```sh
# install dependencies
yarn

# run tests
yarn test

# run tests and report coverage
yarn coverage

# start queue listener daemon
yarn start

# start with debugging output
DEBUG=* yarn start

```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Configure service

The service is configured through standard .env file

```sh
AMQP_URI=<The fully qualified uri of the AMPQ exchange>
AMQP_EXCHANGE=<The name of the AMPQ broker>
AMQP_QUEUE=<The name of the queue to receive messages from>
AMQP_FILTER=<The routing key to receive messages for>
SMS_BASEPATH=<The fully qualified URL of the web page that verifies the change>
SMS_PROXY_URL=<The fully qualified URL of the SMS proxy service>
SMS_PROXY_KEY=<The API key to use for the SMS proxy service>
```

## Local environment with docker

Start a dockerized RabitMQ with

```sh
docker run -d --hostname my-rabbit --name some-rabbit -p 5672:5672 -p 888:15672 -e RABBITMQ_DEFAULT_USER=user -e RABBITMQ_DEFAULT_PASS=password rabbitmq:3-management
```

Ensure `.env` contains

```env
AMQP_URI=amqp://user:password@localhost:5672
AMQP_EXCHANGE=gdi-about-me-person-changed
AMQP_QUEUE=sms-queue
AMQP_FILTER=phone.changed
SMS_BASEPATH=https://helsingborg.se/verify
SMS_PROXY_URL=<Secret, provided by devops>
SMS_PROXY_KEY=<Secret, provided by devops>

```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Prerequisites

- [nodejs](https://nodejs.org/en/)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

- [Best-README-Template](https://github.com/othneildrew/Best-README-Template)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[license-shield]: https://img.shields.io/github/license/helsingborg-stad/gdi-template.svg?style=for-the-badge
[license-url]: https://github.com/helsingborg-stad/gdi-template/blob/master/LICENSE.txt

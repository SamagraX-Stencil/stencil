# Stencil

Stencil is an opinionated backend framework based on [NestJS](https://nestjs.com) with a lot of required tooling setup right out of the box or possible to setup with just one CLI command so that you can dive directly into writing business logic.

## Supported Tooling

- [Prisma ORM](https://prisma.io)
  - Don't deal with the hassle of setting up a prisma instance, start writing schemas directly.
- [User-Service](https://github.com/Samagra-Development/user-service)
  - User Management is just as simple as calling a decorator over your API Controller.
- [Monitoring](https://github.com/ChakshuGautam/nestjs-monitor)
  - Get Prometheus and Grafana dashboards setup right out of the box with beautifully a programatically generated dashboard monitoring your API response times.
- [Temporal](https://temporal.io)
  - Focus on implementing the activity and workflow we have got the setup covered.
- [Response formatting]
  - Enfore response format standards throughout the app with a single interceptor
- [File Uploads]
  - Require handling file uploads and downloads via your service? Get a service setup right out of the box.

**If you have request for a specific tool to be setup automatically, please open a issue ticket and we'll try to get it added at the earliest.**

## Getting started

### Installation

1. Install the stencil-cli
```bash
npm i -g @samagra-x/stencil-cli
```

2. To scaffold a new project run this:
```bash
stencil new <PROJECT_NAME> 
```
During the setup the CLI help you setup all the toolings you want by letting you pick and choose between what you want to have in your service.

### Demo

A demo video depicting how to use stencil-cli can be found [here](https://drive.google.com/file/d/1RaafplnJMlfKgYB-WwyfINREjqoRQSLb/view?usp=sharing)

## Local Setup
1. Clone the repository locally
```bash
git clone https://github.com/SamagraX-Stencil/stencil
```

2. Install root level dependencies
```bash
yarn 
```

3. Navigate to the required directory where you want to hack around and refer directory level READMEs to understand more about the code stored there.
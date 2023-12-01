# Stencil

Stencil is an opinionated backend framework based on [NestJS](https://nestjs.com) with a lot of required tooling setup right out of the box or possible to setup with just one CLI command so that you can dive directly into writing business logic.

## Supported Tooling

- [Prisma ORM](https://prisma.io)
  - Don't deal with the hassle of setting up a prisma instance, start writing schemas directly.
- [User-Service](https://github.com/Samagra-Development/user-service)
  - User Management is just as simple as calling a decorator over your API Controller.
- [NestJS Monitor](https://github.com/ChakshuGautam/nestjs-monitor)
  - Never worry about creating grafana dashboards by hand again.
- [Temporal](https://temporal.io)
  - Focus on implementing the activity and workflow we have got the setup covered.


## Getting started

### Installation

1. Install the stencil-cli
```bash
npm i -g @soorajk1/stencil-cli
```

2. To scaffold a new project run this:
```bash
stencil new <PROJECT_NAME> 
```
During the setup the CLI help you setup all the toolings you want by letting you pick and choose between what you want to have in your service.

### Demo

A demo video depicting how to use stencil-cli can be found [here](https://drive.google.com/file/d/1RaafplnJMlfKgYB-WwyfINREjqoRQSLb/view?usp=sharing)

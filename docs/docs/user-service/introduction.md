---
title: Overview
---

<head>
  <title>Stencil Features</title>
</head>
<p>

## Introduction

[User-service](https://github.com/Samagra-Development/user-service), is a `NestJS` based user-management service created at Samagra. Since `NestJS` is based on the MVC architecture and supports dependency injection, we can use any NestJS service and ingest it in any other `NestJS` via dependency injection by just registering the `modules` of one service into another. Building on top of this advantage, we went ahead and published the modules inside `user-service` as an npm package and started using it in stencil via dependency injection.

## Installation

```bash
npm i -g @techsavvyash/user-service
```

Once installed, you can now simply import the modules and register them in your NestJS app to start using them.

## Usage

For example:
```ts
import {user} from '@techsavvyash/user-service'

@Module({
  imports: [
    user.UserModule
  ]
})
export class AppModule{}
```

The above example would help us expose all the `controllers` and `services` with their corresponding endpoints from the `user-service` in our own NestJS app.


A small demo around this can be found [here](https://drive.google.com/file/d/1VD63VpGrl0QmbJCfTdYJ5-6BsyeJeaFk/view?usp=sharing).

To read more about NestJS and its archicture, refer [NestJS official docs](https://docs.nestjs.com)

</p>
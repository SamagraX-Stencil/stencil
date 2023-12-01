## 📕 Prerequisites

Prequisites required for using User service:

1. Host application

2. Host User management service - Fusion auth supported

3. SMS service provider credentials - User service has two channels used for SMS providers, they are [Gupshup](/src/user/sms/gupshup/) and [CDAC](/src/user/sms/cdac/). However, you can also configure a custom channel for an SMS provider.

## 🖥️ Setup

Setup the User service instance for your application:

Configuration update:

- ### If Setting Up on a Hosted Instance
1. On the user service, Share your application details with the administrator to register your application.
2. The new endpoints will be exposed by the admin which can be consumed later over http/https.

- ### If Setting Up a Separate Instance on Perm.
3. Register a new application on FusionAuth (or any other supported Authentication/Authorization platform).
4. Add the `applicationId`, `APIKey`, `fusion auth endpoint`, and you can update any default value populated in the `sample.env` to your requirements.
5. Update the `sample.env` file and rename it to `.env`.
6. Now you can run you nest application on any docker instance by using 

    ```shell
    docker-compose up -d
    ```
    or on any available process manager for node applications like `pm2`, `nodemon`, etc.

## 🔨 Test the APIs

Once your app is configured, you can test the following APIs.
` Your APIs can be tested by running the `.spec.json` files in your project which contains the unit/e2e tests for the APIs.
You can run these tests by:
```shell
yarn run test:watch ./src/user/sms/gupshup/gupshup.service.spec.ts
```

1. [Login API](/src/admin/fusionauth/)
2. [Reset password API](/src/user/sms/)
3. [User data (CRUD)](/src/user/user-db/)
4. More APIs coming soon

## 📲 Calling the APIs from your application

1. On your app, you need to call the user service APIs, using the token provided for your Application.
2. Sample code 

```ts
code
```

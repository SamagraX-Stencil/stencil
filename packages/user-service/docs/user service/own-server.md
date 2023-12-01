## Setting up user service on your own server

User service is an open-source software, which can be used and installed by anyone. Along with the standard installation procedure, User service provides a docker based setup. Shared below are the prerequisites and installation instructions.

### Pre-requisites

1. Install [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable), If not already Installed.
2. System requirements 🖱️
     - Operating system - Linux or Windows 8/10 (64 bit)
     - 4 GB RAM or more
     - At least 20 GB storage
     - 1280 x 800 minimum screen resolution
     - Internet connection required

3. Basic familiarity with:
     - Typescript
     - Git & Github
     - Basic Knowledge of Nest
     - Familiar with Gupshup/CDAC Channels (For SMS)
     - Docker 🐳

### Installation

1. Make a clone of this repository.

```shell
https://github.com/Samarth-HP/esamwad-user-service.git
```
2. Install Yarn

3. Check that Yarn is installed by running

```shell
yarn --version
```
4. Download [Visual Studio](https://code.visualstudio.com/download). This project is built on VSCode and would be developed only with this IDE in mind. The [.vscode](https://github.com/Samarth-HP/esamwad-user-service/blob/master/.vscode) directory will keep updating with all the VSCode magic.

5. To start User service in development mode, move inside the cloned repository and run the following command:

```shell
yarn start
```
This command will start running your app in development mode

6. The intention of Watch mode is to provide tools that make managing the watching of file & directory trees easier. Run the following command to enable watch mode in user service:

```shell
yarn start:dev
```
7. Enabling debug mode while using User service can greatly enhance your development speed and make the overall experience more smoother. To switch on debug mode in user service, run the following command:

```shell
yarn start:debug
```
8. Famous libraries like React recommends using production mode while deploying the react app. It is known to enhance the loading time and helps in optimizing overall performance of your react app. To start production mode, run the following command:

```shell
yarn start:prod
```

### 🐳 Docker

- Docker compose file helps us to define how the one or more containers in our application are configured. Once you have a Compose file, you can create and start your application with a single command:

```shell
docker compose up
```

You can access the user service compose file [here](/docker-compose.yml).

- User service [Dockerfile](/Dockerfile) contains all the commands a user could call on the command line to assemble an image

1. To create an app directory:

```shell
WORKDIR /app
```

2. Make sure that both package.json AND package-lock.json are copied by executing the Wildcard COPY command as shown below:

```shell
COPY package.json ./
COPY yarn.lock ./
COPY prisma ./prisma/
```

3. If not done already, Install the app dependencies for the user service by running the following command:

```shell
RUN yarn install
```

4. Run the build:

```shell
COPY . .

RUN yarn run build

FROM node:12

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/dist ./dist
```

5. Expose the port of your choice:

```shell
EXPOSE 3000
```

6. Start the production module:

```shell
CMD [ "npm", "run", "start:prod" ]
```



FROM node:16 as dependencies
WORKDIR /app

COPY . ./

RUN yarn
RUN cp env-example .env
EXPOSE 4000

CMD ["yarn", "start"]
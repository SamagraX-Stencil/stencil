FROM node:12 AS builder

# Create app directory
WORKDIR /app

# copy dependency files
COPY package.json ./
COPY yarn.lock ./
COPY prisma ./prisma/

# Install app dependencies
RUN yarn install
# Required if not done in postinstall
# RUN npx prisma generate

COPY . .

RUN yarn run build

FROM node:12

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD [ "npm", "run", "start:prod" ]
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install

COPY . .

RUN pnpm prisma generate

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start:prod"]

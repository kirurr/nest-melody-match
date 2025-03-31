# Base image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json pnpm-lock.yaml ./

RUN npm install -g pnpm

# Install app dependencies
RUN pnpm install

# Bundle app source
COPY . .

RUN pnpm prisma generate

# Creates a "dist" folder with the production build
RUN pnpm build

# Expose the port on which the app will run
EXPOSE 3000

# Start the server using the production build
CMD ["pnpm", "start:dev"]

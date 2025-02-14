# Base image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install -g pnpm

# Install app dependencies
RUN pnpm install

# Generate Prisma Client
RUN pnpm dlx prisma generate

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN pnpm build

# Expose the port on which the app will run
EXPOSE 3000

# Start the server using the production build
CMD ["pnpm", "start:prod"]

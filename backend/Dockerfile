FROM node:20-alpine AS base

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Start the server using production build
EXPOSE 3001
CMD [ "node", "dist/main.js" ] 
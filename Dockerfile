# Use official Node.js base image
FROM node:20.18.0

# Set working directory
WORKDIR /app

# Copy only package.json and lockfiles first for install layer caching
COPY package*.json ./
COPY packages/server/package*.json packages/server/
COPY packages/app/package*.json packages/app/

# Install all workspace dependencies
RUN npm install

# Copy the rest of the project
COPY . .

# Build the app (this uses your top-level `build` script which calls esbuild)
RUN npm run build

# Expose the desired port
EXPOSE 8080

# Run the built server (from the top-level start script)
CMD ["npm", "run", "start"]
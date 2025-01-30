FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies (skip devDependencies)
RUN npm install --omit=dev

# Copy the rest of your files
COPY . .

# Expose any ports used by your app
EXPOSE 4000

# Specify the command that starts your server
CMD ["node", "index.js"]
FROM node:20.18.0
WORKDIR /app

# Copy root lockfile and package.json (for workspace deps)
COPY package*.json ./
# Copy server package.json separately
COPY packages/server/package*.json ./packages/server/

# Install dependencies (including workspace deps)
RUN npm install --omit=dev

# Copy built server code
COPY dist/ ./dist/

EXPOSE 8080
CMD ["node", "dist/server.js"]
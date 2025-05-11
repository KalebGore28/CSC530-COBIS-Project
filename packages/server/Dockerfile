# Use node:18-slim for a lightweight base image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built app and public assets
COPY dist/ ./dist/

# Copy migration files for drizzle-kit (optional, keep for now)
COPY drizzle/ ./drizzle/

# Create directory for DB persistence
RUN mkdir -p /data

# Expose port
EXPOSE 4000

# Set environment variables (optional, overridden by CLI or compose)
ENV NODE_ENV=production

# Run the app (with DB_URL passed via env)
CMD ["sh", "-c", "node --enable-source-maps dist/server.cjs"]
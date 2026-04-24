# ---------- Build Stage ----------
FROM oven/bun:1.3.13 AS builder

# Set working directory
WORKDIR /app

# Copy only package manifests for dependency install layer caching
COPY bun.lock package*.json ./

# Install all dependencies including devDependencies
RUN bun install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the app
RUN bun run build

# ---------- Production Stage ----------
FROM oven/bun:1.3.13 AS final

# Set working directory
WORKDIR /app

# Copy only the necessary built artifacts from the builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/bun.lock ./
COPY --from=builder /app/server.ts ./

# Install only production dependencies
RUN bun install --production  --frozen-lockfile

# Expose application port
EXPOSE 8080

# Run the built server
CMD ["bun","server.ts"]

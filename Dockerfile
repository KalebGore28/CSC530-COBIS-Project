# ---------- Build Stage ----------
FROM node:20.18.0 AS builder

# Set working directory
WORKDIR /app

# Copy only package manifests for dependency install layer caching
COPY package*.json ./
COPY packages/server/package*.json packages/server/
COPY packages/app/package*.json packages/app/

# Install all dependencies including devDependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the app (assumes root-level `build` script builds everything)
RUN npm run build

# ---------- Production Stage ----------
FROM node:20.18.0 AS final

# Set working directory
WORKDIR /app

# Copy only the necessary built artifacts from the builder
COPY --from=builder /app/dist ./dist

# Copy production-only package.json files
COPY package*.json ./
COPY packages/server/package*.json packages/server/
COPY packages/app/package*.json packages/app/

# Install only production dependencies
RUN npm install --omit=dev

# Expose application port
EXPOSE 8080

# Run the built server
CMD ["node", "dist/server.js"]

# Use official Node.js slim image
FROM node:18-slim AS builder

WORKDIR /app

# Copy package files and install dependencies (including devDependencies for esbuild)
COPY package.json package-lock.json ./
RUN npm install

# Copy the entire backend source code
COPY . .

# Run esbuild to create the production build
RUN npm run build

# ---- Production Image ----
FROM node:18-slim

WORKDIR /app

# Copy only the built files from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port used by the backend
EXPOSE 4000

# Start the backend
ENTRYPOINT ["node"]
CMD ["dist/index.cjs"]
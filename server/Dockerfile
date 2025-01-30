# === STAGE 1: Build Stage ===
FROM node:18 AS builder

WORKDIR /app

# Copy package files first (cache optimization)
COPY package.json package-lock.json ./

# Step 1: Install all dependencies (including devDependencies)
RUN npm install

# Copy all files and bundle the project
COPY . .
RUN npm run build

# === STAGE 2: Minimal Runtime ===
FROM node:18-slim

WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/dist/index.js /app/index.js
COPY --from=builder /app/package.json /app/package.json

# Step 2: Install only production dependencies
RUN npm install --omit=dev

EXPOSE 4000

CMD ["node", "index.js"]
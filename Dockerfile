# ---------- Build ----------
FROM oven/bun:1.4.4 AS build
WORKDIR /app

# Dependencies first, so this layer is reused until the lockfile changes.
# --ignore-scripts skips the project's prepare script, which sets up git hooks and needs git.
# bunfig.toml already keeps dependencies' install scripts from running.
COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile --ignore-scripts

COPY . .
# Nitro writes a self-contained server and the static files to .output
RUN bun run build

# ---------- Run ----------
# Only .output is copied over: the server is already bundled, so no node_modules or source code
FROM oven/bun:1.4.4-slim
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build --chown=bun:bun /app/.output ./

USER bun
EXPOSE 3000

# The database and sign-in settings come from the environment, like `docker run --env-file`
CMD ["bun", "server/index.mjs"]

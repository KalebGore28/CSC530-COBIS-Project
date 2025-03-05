#!/bin/sh

# Set DB_URL from environment
export DB_URL=/data/prod.sqlite3

# Check if database exists and has migrations
if [ ! -f "$DB_URL" ] || ! sqlite3 "$DB_URL" "SELECT name FROM __drizzle_migrations LIMIT 1" 2>/dev/null; then
    echo "Database at $DB_URL is new or uninitialized. Applying migrations..."
    drizzle-kit migrate --config drizzle.config.ts
    if [ $? -ne 0 ]; then
        echo "Failed to apply migrations. Exiting..."
        exit 1
    fi
    echo "Migrations applied successfully."
fi

# Start the app
node --enable-source-maps dist/server.cjs
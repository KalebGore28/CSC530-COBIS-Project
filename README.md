# Getting Started

Follow these steps to set up and run the application locally.

## 1. Clone the Repository

## 2. Install Dependencies

```bash
npm install
```

## 3. Set Up the Database

Run the database migration to create the required tables:

```bash
npm run db:migrate
```

This runs:

```
npm run db:migrate --workspace=cobis-server
```

Then seed the database with initial core data:

```bash
npm run db:seed
```

Which runs:

```
npm run db:seed --workspace=cobis-server
```

## 4. Start the Development Servers

Finally, start both the app and server concurrently:

```bash
npm run dev
```

This runs:

```
concurrently "npm run dev --workspace=cobis-app" "npm run dev --workspace=cobis-server"
```
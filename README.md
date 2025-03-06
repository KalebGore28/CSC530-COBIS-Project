# CSC530-COBIS-Project

To Build:

```sh
docker build -t cobis-server .
```

To Run:
```sh
docker run -d \
  -p 4000:4000 \
  -e NODE_ENV=production \
  -e DB_URL=/data/prod.sqlite3 \
  -e GOOGLE_CLIENT_ID=client-id \
  -e GOOGLE_CLIENT_SECRET=client-secret \
  -e GOOGLE_CALLBACK_URL=/api/auth/google/callback \
  -e JWT_SECRET=your-jwt-secret \
  -e SESSION_SECRET=your-session-secret \
  -v cobis-db:/data \
  cobis-server
```

When you first run it will soft exit as the database will need to be initialized manually.

Here are the directions for Mac:

```sh
docker volume inspect cobis-db
```

Mount and copy empty prod.sqlite3 from docker volume:
```sh
mkdir -p ./data
docker run -v cobis-db:/data -v $(pwd)/data:/mnt busybox sh -c "cp -r /data/* /mnt/"
```

Apply the migration:
```sh
DB_URL=./data/prod.sqlite3 npm run db:migrate
```

Copy the database file back:
```sh
docker run -v cobis-db:/data -v $(pwd)/data:/mnt busybox sh -c "cp -r /mnt/* /data/"
```

Now when you run the container again it should start up.

```sh
DB_URL=./data/prod.sqlite3 npm run db:seed
```
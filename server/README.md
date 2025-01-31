# SQL Server Docker Instance for Mac

# Once ran, give a few seconds to start up
```sh
docker run -d --name sqlserver --network cobis-network \
  -e 'ACCEPT_EULA=Y' \
  -e 'SA_PASSWORD=YourStrongPassw0rd' \
  -p 1433:1433 \
  mcr.microsoft.com/mssql/server:2022-latest
```

# If you want to deploy the backend server, make sure you build it first

```sh
npm run docker
```

# Then deploy it with some env variables set:
```sh
docker run -d --name cobis-server --network cobis-network \
  -e DB_HOST=sqlserver \
  -e DB_USER=sa \
  -e DB_PASSWORD=YourStrongPassw0rd \
  -e DB_NAME=tempdb \
  -p 4000:4000 \
  cobis-server
```
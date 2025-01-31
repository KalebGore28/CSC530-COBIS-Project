# 🚀 COBIS Project - SQL Server Docker Setup for Mac

This guide helps you **set up and run Microsoft SQL Server in Docker** and deploy the **COBIS backend server**.

---

## **🛠️ Running SQL Server in Docker**
The following command starts a **SQL Server 2022 instance** inside a Docker container.  
📌 **Note:** After running this command, **wait a few seconds** for SQL Server to fully start.

```sh
docker run -d --name sqlserver --network cobis-network \\
  -e 'ACCEPT_EULA=Y' \\
  -e 'SA_PASSWORD=YourStrongPassw0rd' \\
  -p 1433:1433 \\
  mcr.microsoft.com/mssql/server:2022-latest
```

- `--name sqlserver` → Names the container `sqlserver`
- `--network cobis-network` → Ensures it runs on the **same network** as the backend
- `-e 'SA_PASSWORD=YourStrongPassw0rd'` → **Change this** to a strong password!
- `-p 1433:1433` → Exposes SQL Server **on port 1433**

---

## **🛠️ Building the Backend Server**
Before deploying the backend, **build the Docker image** using:
```sh
npm run docker
```

---

## **🚀 Deploying the COBIS Backend**
After building the backend, run it inside a Docker container:
```sh
docker run -d --name cobis-server --network cobis-network \\
  -e DB_HOST=sqlserver \\
  -e DB_USER=sa \\
  -e DB_PASSWORD=YourStrongPassw0rd \\
  -e DB_NAME=tempdb \\
  -p 4000:4000 \\
  cobis-server
```

### **🔹 Explanation of Environment Variables**
| Variable | Description |
|----------|-------------|
| `DB_HOST=sqlserver` | Connects to the SQL Server container |
| `DB_USER=sa` | SQL Server admin user |
| `DB_PASSWORD=YourStrongPassw0rd` | Password for `sa` user (**must match SQL Server setup!**) |
| `DB_NAME=tempdb` | Database name to use |
| `-p 4000:4000` | Exposes the API server on port `4000` |

---

Now, your **COBIS backend and SQL Server** should be running successfully inside Docker! 🚀
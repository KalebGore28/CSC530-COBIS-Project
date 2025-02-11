# 🚀 COBIS Project - SQL Server & Backend Setup with Docker

This guide helps you set up and run **Microsoft SQL Server in Docker** and deploy the **COBIS backend server**.

---

## ⚠️ Running on Apple Silicon (M Series)
If you're using a Mac with **Apple Silicon (M1/M2/M3)**, you need to enable **Rosetta** for SQL Server to run in Docker.

---

## 🛠️ Setting Up SQL Server in Docker

### 1️⃣ Create a Docker Network
First, create a **Docker network** for communication between the SQL Server and COBIS backend.  
(*You may need to use `sudo` before running docker commands on macOS/Linux.*)

```sh
docker network create cobis-network
```

### 2️⃣ Start SQL Server in Docker
Run the following command to start a **SQL Server 2022 instance** inside a Docker container.

```sh
docker run -d --name sqlserver --network cobis-network \
  -e 'ACCEPT_EULA=Y' \
  -e 'SA_PASSWORD=YourStrongPassw0rd' \
  -p 1433:1433 \
  mcr.microsoft.com/mssql/server:2022-latest
```

📌 **Make sure to:**
- Replace `YourStrongPassw0rd` with a **secure password**.
- Wait a few seconds after running the command to let SQL Server start fully.

---

## 🏗️ Building & Running the COBIS Backend

### 1️⃣ Build the Backend Docker Image
Run the following command from within the server directory:

```sh
npm run docker
```

### 2️⃣ Start the COBIS Server in Docker
After building the backend, run it inside a Docker container:

```sh
docker run -d --name cobis-server --network cobis-network \
  -e DB_HOST=sqlserver \
  -e DB_USER=sa \
  -e DB_PASSWORD=YourStrongPassw0rd \
  -e DB_NAME=tempdb \
  -p 4000:4000 \
  cobis-server
```

📌 **Ensure that:**
- `DB_PASSWORD` matches the **same password** used for SQL Server.
- The backend API is accessible on **port 4000**.

---

## 🔹 Environment Variables Overview

| Variable         | Description |
|-----------------|-------------|
| `DB_HOST`       | SQL Server container name (`sqlserver`) **- Must match container name!** |
| `DB_USER`       | SQL Server admin user (`sa`) |
| `DB_PASSWORD`   | Password for `sa` user (must match SQL Server setup) |
| `DB_NAME`       | Database name to use (`tempdb`) **- (tempdb) For dev testing only** |
| `-p 4000:4000`  | Exposes the API server on port `4000` |

---

### ✅ Your COBIS backend and SQL Server should now be running successfully inside Docker! 🚀
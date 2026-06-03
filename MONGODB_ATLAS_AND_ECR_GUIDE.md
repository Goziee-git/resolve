# MongoDB Atlas + AWS ECR Deployment Guide

This guide covers two key setup steps for the Calculator App:

1. Connecting the backend to **MongoDB Atlas**
2. Building Docker images and pushing them to **AWS Elastic Container Registry (ECR)**

---

## Part 1: MongoDB Atlas Setup

### 1.1 Create a MongoDB Atlas Cluster

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up or log in.
2. Click **"Build a Database"** and choose the **Free Shared (M0)** tier.
3. Select your preferred cloud provider (AWS) and region.
4. Name your cluster (e.g., `calculator-cluster`) and click **"Create Cluster"**.
5. Wait for the cluster to be provisioned (~3-5 minutes).

### 1.2 Configure Database Access

1. In the Atlas dashboard, go to **Database Access** under the **Security** section.
2. Click **"Add New Database User"**.
3. Choose **Password** authentication and set a username and password.
4. Under **Database User Privileges**, select **"Read and write to any database"**.
5. Click **"Add User"**.

### 1.3 Configure Network Access (IP Whitelist)

1. Go to **Network Access** under the **Security** section.
2. Click **"Add IP Address"**.
3. For development, click **"Allow Access from Anywhere"** (`0.0.0.0/0`).
   > For production, restrict this to your specific IPs or VPC.
4. Click **"Confirm"**.

### 1.4 Get Your Connection String

1. Go to **Database** and click **"Connect"** on your cluster.
2. Select **"Connect your application"**.
3. Choose **Node.js** and the version, then copy the connection string.
4. It will look like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your database user credentials.
6. Append the database name (`calculator`) to the URI:
   ```
   mongodb+srv://dbuser:secretpass@cluster0.xxxxx.mongodb.net/calculator?retryWrites=true&w=majority
   ```

### 1.5 Configure the Backend

The backend reads the MongoDB URI from the `MONGODB_URI` environment variable.

**Option A: Using the `.env` file (local development)**

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://dbuser:secretpass@cluster0.xxxxx.mongodb.net/calculator?retryWrites=true&w=majority
```

**Option B: Using the root `.env` file (Docker Compose)**

Edit `.env` at the project root:
```env
MONGODB_URI=mongodb+srv://dbuser:secretpass@cluster0.xxxxx.mongodb.net/calculator?retryWrites=true&w=majority
```

Docker Compose automatically reads this file and passes `MONGODB_URI` to the backend container via `${MONGODB_URI}`.

> **Security Warning:** Never commit your `.env` files with real credentials to version control. Ensure `.env` is listed in `.gitignore`.

### 1.6 Verify the Connection

Run the backend locally:
```bash
cd backend
npm install
npm start
```

You should see:
```
Connected to MongoDB
Server running on port 5000
```

---

## Part 2: Build Docker Images & Push to AWS ECR

### 2.1 Prerequisites

- **AWS CLI** installed and configured (`aws configure`)
- **Docker** installed and running
- AWS user with ECR permissions (`ecr:*`)

### 2.2 Create ECR Repositories

```bash
# Set your AWS region
AWS_REGION=us-east-1

# Create the backend repository
aws ecr create-repository \
  --repository-name calculator-backend \
  --region $AWS_REGION \
  --image-mutability IMMUTABLE \
  --encryption-configuration encryptionType=AES256 \
  --image-scanning-configuration scanOnPush=true

# Create the frontend repository
aws ecr create-repository \
  --repository-name calculator-frontend \
  --region $AWS_REGION \
  --image-mutability IMMUTABLE \
  --encryption-configuration encryptionType=AES256 \
  --image-scanning-configuration scanOnPush=true
```

Note the **repository URIs** from the output. They will look like:
```
123456789012.dkr.ecr.us-east-1.amazonaws.com/calculator-backend
123456789012.dkr.ecr.us-east-1.amazonaws.com/calculator-frontend
```

### 2.3 Authenticate Docker with ECR

```bash
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
```

> On Windows PowerShell:
> ```powershell
> (aws ecr get-login-password --region us-east-1) | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
> ```

### 2.4 Build the Docker Images

```bash
# From the project root directory

# Build backend image
docker build -t calculator-backend ./backend

# Build frontend image
docker build -t calculator-frontend ./frontend
```

### 2.5 Tag the Images for ECR

Replace `123456789012` with your AWS Account ID and `us-east-1` with your region:

```bash
# Tag backend image
docker tag calculator-backend:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/calculator-backend:latest

# Tag frontend image
docker tag calculator-frontend:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/calculator-frontend:latest
```

You can also tag with a specific version:
```bash
docker tag calculator-backend:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/calculator-backend:v1.0.0
```

### 2.6 Push the Images to ECR

```bash
# Push backend image
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/calculator-backend:latest

# Push frontend image
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/calculator-frontend:latest
```

### 2.7 Verify the Images in ECR

```bash
# List images in the backend repository
aws ecr describe-images \
  --repository-name calculator-backend \
  --region $AWS_REGION

# List images in the frontend repository
aws ecr describe-images \
  --repository-name calculator-frontend \
  --region $AWS_REGION
```

Or check via the AWS Console: **ECR > Repositories**.

---

## Part 3: Running with Docker Compose (using Atlas)

With the MongoDB Atlas URI configured in the root `.env` file:

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up --build -d

# Stop all services
docker-compose down
```

The `docker-compose.yml` reads `MONGODB_URI` from the `.env` file and passes it to the backend container. No local MongoDB container is needed.

---

## Quick Reference: One-Script Push to ECR

Save and run this script to build, tag, and push both images in one go:

```bash
#!/bin/bash
# push-to-ecr.sh

set -e

AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-123456789012}
ECR_PREFIX="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Authenticate
echo "Authenticating with ECR..."
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $ECR_PREFIX

# Build
echo "Building images..."
docker build -t calculator-backend ./backend
docker build -t calculator-frontend ./frontend

# Tag
echo "Tagging images..."
docker tag calculator-backend:latest ${ECR_PREFIX}/calculator-backend:latest
docker tag calculator-frontend:latest ${ECR_PREFIX}/calculator-frontend:latest

# Push
echo "Pushing images to ECR..."
docker push ${ECR_PREFIX}/calculator-backend:latest
docker push ${ECR_PREFIX}/calculator-frontend:latest

echo "Done! Images pushed to ECR."
```

**PowerShell equivalent:**

```powershell
# push-to-ecr.ps1

$AWS_REGION = "us-east-1"
$AWS_ACCOUNT_ID = "123456789012"
$ECR_PREFIX = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Authenticate
Write-Host "Authenticating with ECR..."
(aws ecr get-login-password --region $AWS_REGION) | docker login --username AWS --password-stdin $ECR_PREFIX

# Build
Write-Host "Building images..."
docker build -t calculator-backend ./backend
docker build -t calculator-frontend ./frontend

# Tag
Write-Host "Tagging images..."
docker tag calculator-backend:latest "${ECR_PREFIX}/calculator-backend:latest"
docker tag calculator-frontend:latest "${ECR_PREFIX}/calculator-frontend:latest"

# Push
Write-Host "Pushing images to ECR..."
docker push "${ECR_PREFIX}/calculator-backend:latest"
docker push "${ECR_PREFIX}/calculator-frontend:latest"

Write-Host "Done! Images pushed to ECR."
```

---

## Project File Summary

| File | Change |
|------|--------|
| `backend/server.js` | Removed deprecated mongoose options, uses `MONGODB_URI` env var only |
| `backend/.env` | Updated URI to MongoDB Atlas connection string format |
| `.env` (root) | Added `MONGODB_URI` for Docker Compose variable substitution |
| `docker-compose.yml` | Removed `mongodb` service and `volumes`, backend reads `MONGODB_URI` from `.env` |
| `backend/.dockerignore` | Excludes `node_modules`, `.env`, `.git` from Docker build context |
| `frontend/.dockerignore` | Excludes `node_modules`, `build`, `.env`, `.git` from Docker build context |

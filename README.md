# MERN Calculator App

A simple calculator application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) that allows users to perform basic arithmetic operations and view calculation history.

## Table of Contents
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Running the Application](#running-the-application)
  - [Using Docker Compose](#using-docker-compose-recommended)
  - [Manual Setup](#manual-setup)
- [API Endpoints](#api-endpoints)
- [Docker Configuration](#docker-configuration)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## Project Structure

```
calculator-app/
├── backend/             # Node.js and Express backend
│   ├── controllers/     # Request handlers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── config/          # Configuration files
│   ├── .env             # Environment variables
│   ├── Dockerfile       # Backend Docker configuration
│   ├── package.json     # Backend dependencies
│   └── server.js        # Entry point
├── frontend/            # React frontend
│   ├── public/          # Static files
│   ├── src/             # React source code
│   │   ├── components/  # React components
│   │   └── styles/      # CSS files
│   ├── Dockerfile       # Frontend Docker configuration
│   ├── nginx.conf       # Nginx configuration for production
│   └── package.json     # Frontend dependencies
└── docker-compose.yml   # Docker Compose configuration
```

## Prerequisites

To run this application, you'll need:

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) (for containerized setup)
- [Node.js](https://nodejs.org/) (v14 or later) and [npm](https://www.npmjs.com/) (for manual setup)
- [MongoDB](https://www.mongodb.com/try/download/community) (for manual setup)

## Running the Application

### Using Docker Compose (Recommended)

The easiest way to run the application is using Docker Compose, which will set up all the required services automatically.

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd calculator-app
   ```

2. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

4. To stop the application:
   ```bash
   docker-compose down
   ```

5. To stop the application and remove all data (including the MongoDB volumes):
   ```bash
   docker-compose down -v
   ```

### Manual Setup

If you prefer to run the application without Docker, follow these steps:

#### Backend Setup

1. Make sure MongoDB is installed and running on your system
2. Navigate to the backend directory:
   ```bash
   cd calculator-app/backend
   ```

3. Install dependencies:
   ```bash
   npm install --ignore-script
   ```

4. Create a `.env` file with the following content:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/calculator
   ```

5. Start the backend server:
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd calculator-app/frontend
   ```

2. Install dependencies:
   ```bash
   npm install --ignore-script
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

4. Access the application at http://localhost:3000

## API Endpoints

The backend provides the following RESTful API endpoints:

- `POST /api/calculations`: Perform a calculation
  - Request body: `{ "firstNumber": number, "secondNumber": number, "operation": string }`
  - Operations: `"add"`, `"subtract"`, `"multiply"`, `"divide"`
  - Returns: Calculation object with result

- `GET /api/calculations/history`: Get calculation history
  - Returns: Array of past calculations (limited to 10 most recent)

## Docker Configuration

### Docker Compose

The `docker-compose.yml` file defines three services:

1. **mongodb**: MongoDB database
   - Uses the official MongoDB image
   - Persists data using a named volume
   - Exposes port 27017

2. **backend**: Node.js API
   - Built from the `./backend` directory
   - Connects to the MongoDB service
   - Exposes port 5000

3. **frontend**: React application
   - Built from the `./frontend` directory
   - Served using Nginx
   - Exposes port 3000 (mapped to container port 80)

### Individual Dockerfiles

#### Backend Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --ignore-script
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

#### Frontend Dockerfile

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install --ignore-script
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Development

### Backend Development

- The backend uses Express.js for the API server
- Mongoose is used as the MongoDB ODM
- Calculation data is stored in a MongoDB collection

To add new API endpoints:
1. Create a controller function in `backend/controllers/`
2. Add a route in `backend/routes/`
3. Register the route in `server.js`

### Frontend Development

- The frontend is built with React using functional components and hooks
- Axios is used for API communication
- CSS is used for styling

To modify the UI:
1. Edit components in `frontend/src/components/`
2. Update styles in `frontend/src/styles/`

## Troubleshooting

### Common Issues

1. **Cannot connect to MongoDB**
   - If using Docker: Make sure the MongoDB container is running (`docker ps`)
   - If manual setup: Verify MongoDB is running on your system

2. **Backend API not responding**
   - Check if the backend server is running
   - Verify the correct ports are exposed (5000)
   - Check for errors in the backend logs

3. **Frontend not connecting to backend**
   - Ensure the backend API URL is correct in the frontend code
   - Check for CORS issues in the browser console
   - Verify the backend is running and accessible

4. **Docker container issues**
   - Run `docker-compose logs` to see container logs
   - Try rebuilding with `docker-compose up -d --build`

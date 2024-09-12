

<h1>NestJS Boilerplate with Docker, MongoDB, and Prisma 🚀</h1>


## Description

<p>This repository serves as a boilerplate for building a backend application with NestJS, Docker, MongoDB, and Prisma. The project includes authentication, basic user management (register, login, get me), and pagination support. It's fully containerized with Docker, making it easy to set up and run locally or in production.</p>

## Features

- Authentication: Basic user authentication with JWT (register, login, and get me endpoints).
- MongoDB: A cloud-hosted MongoDB is used for database operations.
- Prisma ORM: Prisma is used as the database ORM for interacting with MongoDB.
- Pagination: Pagination is implemented for handling large datasets efficiently.
- Docker Support: Includes a **`Dockerfile`** and **`docker-compose.yml** for easy containerization and environment setup.


## Endpoints

1. Register: /auth/register
  - Registers a new user.
2. Login: /auth/login
  - Authenticates an existing user and returns a JWT.
3. Get Me: /auth/me
  - Retrieves information about the authenticated user.

## Paginatio
<p>
Pagination is supported and can be used on applicable endpoints for handling lists of data.</p>

## Requirements
- Docker
- Docker Compose
- Node.js (for local development without Docker)
- MongoDB (cloud-hosted)

## Installation
```bash
$ git clone https://github.com/lumgashi/nestjs-prisma-mongodb-prisma.git
cd nestjs-prisma-mongodb-prisma
```

## Set up Environment Variables
<p>Create a .env file in the root directory and configure the necessary environment variables:</p>

```bash
DATABASE_URL="mongodb+srv: ..."
apiPrefix="api"
jwtSecret="secret"
tokenExpiresIn="1d"
``` 

## Docker Setup

<p> Ensure you have Docker installed and running on your system.</p>

- To build and run the application inside Docker containers, use the following commands:

```bash
# Build and run the app with Docker Compose
docker-compose up --build
```

- To stop and remove the containers:
```bash
# Build and run the app with Docker Compose
docker-compose down
```


## Running the app locally without Docker

<p>If you want to run the app locally without Docker, you can use:</p>

```bash
npm install
npm run start:dev
```

## Prisma Setup

<p> Prisma is used as the ORM for MongoDB. To run Prisma migrations or generate the client, follow these steps: </p>

```bash
# To creat the prisma directory 
npx prisma init

# To generate Prisma client
npx prisma generate
```
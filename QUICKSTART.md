# Quick Start Guide

This guide will help you get the Multi-Tenant News SSO application up and running quickly.

## Prerequisites

- Docker Desktop or Docker Engine with Docker Compose
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sso-multitenant
```

### 2. Start the Application with Docker

```bash
docker-compose up -d
```

This command will:
- Start PostgreSQL database on port 5432
- Build and start the backend API on port 4000
- Build and start the frontend on port 3000

### 3. Initialize the Database

On first run, you need to create the database schema and seed it with sample data:

```bash
# Access the backend container
docker exec -it news-backend sh

# Run migrations
npx prisma migrate dev --name init

# Seed the database with demo data
npm run seed

# Exit the container
exit
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend GraphQL Playground**: http://localhost:4000/graphql

### 5. Login with Demo Accounts

After seeding the database, you can use these credentials:

**Admin Account:**
- Email: `admin@demo.news`
- Password: `admin123`

**Editor Account:**
- Email: `editor@demo.news`
- Password: `admin123`

## What's Next?

### Explore the Application

1. **Home Page** (http://localhost:3000)
   - Overview of the platform
   - Navigation to articles and sign-in

2. **Sign In** (http://localhost:3000/auth/signin)
   - Use the demo credentials above
   - SSO authentication with JWT

3. **Articles** (http://localhost:3000/articles)
   - Browse published news articles
   - See author information

### Use the GraphQL API

Visit http://localhost:4000/graphql to interact with the API:

**Example: Fetch All Articles**
```graphql
query {
  articles(tenantId: "00000000-0000-0000-0000-000000000001", published: true) {
    id
    title
    excerpt
    author {
      name
      email
    }
    createdAt
  }
}
```

**Example: Login**
```graphql
mutation {
  login(input: {
    email: "admin@demo.news"
    password: "admin123"
  }) {
    token
    user {
      id
      email
      name
      role
    }
  }
}
```

### Stop the Application

```bash
docker-compose down
```

To stop and remove all data (including database):
```bash
docker-compose down -v
```

## Troubleshooting

### Port Already in Use

If you see errors about ports already in use, you can either:
1. Stop the service using that port
2. Modify the port mappings in `docker-compose.yml`

### Database Connection Issues

If the backend can't connect to the database:
1. Check if PostgreSQL container is running: `docker ps`
2. Check backend logs: `docker logs news-backend`
3. Restart the backend: `docker-compose restart backend`

### Build Errors

If you encounter build errors:
```bash
# Rebuild containers from scratch
docker-compose build --no-cache
docker-compose up -d
```

## Development Workflow

For local development without Docker, see the main [README.md](README.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

## Features to Explore

- ✅ Multi-tenant data isolation
- ✅ JWT-based SSO authentication
- ✅ Role-based access control (USER, EDITOR, ADMIN)
- ✅ News article management
- ✅ Category management
- ✅ GraphQL API with type safety
- ✅ Responsive UI with Tailwind CSS

## Next Steps

1. Read the full [README.md](README.md) for detailed documentation
2. Check [CONTRIBUTING.md](CONTRIBUTING.md) to start contributing
3. Explore the GraphQL schema at http://localhost:4000/graphql
4. Customize the application for your needs

## Support

If you encounter any issues, please check:
- Application logs: `docker-compose logs -f`
- Backend logs: `docker logs -f news-backend`
- Frontend logs: `docker logs -f news-frontend`
- Database logs: `docker logs -f newsdb`

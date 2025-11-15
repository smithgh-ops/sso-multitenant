# Contributing to Multi-Tenant News SSO

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sso-multitenant
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Setup environment variables**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   
   # Frontend
   cd ../frontend
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start PostgreSQL (if not using Docker)**
   ```bash
   # Make sure PostgreSQL is running on port 5432
   # Or use Docker for just the database:
   docker run -d \
     --name newsdb \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=newsdb \
     -p 5432:5432 \
     postgres:15-alpine
   ```

5. **Setup the database**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

6. **Start development servers**
   ```bash
   # From root directory
   npm run dev
   
   # Or start individually:
   npm run dev:backend  # Starts backend on :4000
   npm run dev:frontend # Starts frontend on :3000
   ```

## Project Structure

- `backend/` - GraphQL API server
  - `src/schema/` - GraphQL type definitions
  - `src/resolvers/` - Query and mutation resolvers
  - `src/middleware/` - Authentication and context
  - `src/utils/` - Helper functions
  - `prisma/` - Database schema and migrations

- `frontend/` - Next.js application
  - `src/app/` - Next.js App Router pages
  - `src/lib/` - Apollo Client and utilities
  - `src/components/` - React components

## Coding Standards

### TypeScript
- Use TypeScript for all new code
- Define proper types/interfaces
- Avoid `any` type when possible

### Code Style
- Follow existing code formatting
- Use meaningful variable names
- Add comments for complex logic

### Git Commit Messages
- Use clear, descriptive commit messages
- Start with a verb (Add, Fix, Update, etc.)
- Reference issue numbers when applicable

Example:
```
Add user profile page
Fix authentication redirect bug
Update GraphQL schema for categories
```

## Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## Database Migrations

When making schema changes:

1. Update `backend/prisma/schema.prisma`
2. Create migration:
   ```bash
   cd backend
   npx prisma migrate dev --name description_of_change
   ```
3. Update seed script if needed

## Pull Request Process

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them

3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a Pull Request with:
   - Clear description of changes
   - Reference to related issues
   - Screenshots (for UI changes)
   - Test results

5. Wait for review and address feedback

## Common Tasks

### Adding a new GraphQL query/mutation

1. Update `backend/src/schema/typeDefs.ts`
2. Add resolver in `backend/src/resolvers/queries.ts` or `mutations.ts`
3. Test in GraphQL Playground

### Adding a new page

1. Create file in `frontend/src/app/[page-name]/page.tsx`
2. Add necessary GraphQL queries
3. Update navigation if needed

### Adding a new database model

1. Update `backend/prisma/schema.prisma`
2. Run `npx prisma migrate dev`
3. Update GraphQL schema
4. Add resolvers
5. Update seed script

## Getting Help

- Check existing issues and PRs
- Ask questions in issue comments
- Join our community discussions

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

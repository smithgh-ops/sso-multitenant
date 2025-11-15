# Architecture Overview

## System Architecture

The Multi-Tenant News SSO application follows a modern three-tier architecture with complete data isolation between tenants.

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/HTTPS
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  Frontend (Next.js)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - Next.js 14 (App Router)                           │  │
│  │  - NextAuth.js (SSO)                                 │  │
│  │  - Apollo Client (GraphQL)                           │  │
│  │  - Tailwind CSS                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ GraphQL over HTTP
                     │ JWT Bearer Token
┌────────────────────▼────────────────────────────────────────┐
│                Backend (Node.js/TypeScript)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - Apollo Server (GraphQL)                           │  │
│  │  - JWT Authentication                                │  │
│  │  - Prisma ORM                                        │  │
│  │  - bcrypt (Password Hashing)                         │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ SQL
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Database (PostgreSQL)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - Multi-tenant schema                               │  │
│  │  - Isolated data per tenant                          │  │
│  │  - Relational integrity                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Multi-Tenancy Strategy

### Data Isolation

The application uses **shared database, shared schema** multi-tenancy with tenant discrimination:

- Single PostgreSQL database
- All tables include a `tenantId` foreign key
- Application-level isolation enforced by GraphQL resolvers
- Database-level constraints ensure data integrity

### Benefits

- **Cost Effective**: Single database instance for all tenants
- **Easy Maintenance**: One codebase, one deployment
- **Scalable**: Can handle many tenants efficiently
- **Secure**: Tenant data is isolated through application logic

## Authentication & Authorization

### SSO Flow

```
┌──────┐                  ┌─────────┐                ┌─────────┐
│Client│                  │Frontend │                │ Backend │
└──┬───┘                  └────┬────┘                └────┬────┘
   │                           │                          │
   │  1. Login Request         │                          │
   ├──────────────────────────>│                          │
   │                           │  2. GraphQL Login        │
   │                           ├─────────────────────────>│
   │                           │                          │
   │                           │  3. Validate Credentials │
   │                           │  4. Generate JWT         │
   │                           │  5. Store Session        │
   │                           │<─────────────────────────┤
   │  6. Return JWT Token      │                          │
   │<──────────────────────────┤                          │
   │                           │                          │
   │  7. Subsequent Requests   │                          │
   │  (with JWT in header)     │                          │
   ├──────────────────────────>│  8. Forward with JWT    │
   │                           ├─────────────────────────>│
   │                           │  9. Verify JWT           │
   │                           │  10. Load User Context   │
   │                           │  11. Execute Query       │
   │                           │<─────────────────────────┤
   │  12. Return Data          │                          │
   │<──────────────────────────┤                          │
```

### JWT Payload

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "tenantId": "tenant-uuid",
  "role": "USER|EDITOR|ADMIN",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Role-Based Access Control

- **USER**: Can view published articles
- **EDITOR**: Can create, edit, publish articles and manage categories
- **ADMIN**: Full access including tenant management

## Database Schema

### Core Tables

#### Tenant
```
┌─────────────────┐
│     Tenant      │
├─────────────────┤
│ id (PK)         │
│ name            │
│ slug (unique)   │
│ domain (unique) │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
```

#### User
```
┌─────────────────┐
│      User       │
├─────────────────┤
│ id (PK)         │
│ email (unique)  │
│ name            │
│ password (hash) │
│ role            │
│ tenantId (FK)   │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
```

#### Session
```
┌─────────────────┐
│    Session      │
├─────────────────┤
│ id (PK)         │
│ userId (FK)     │
│ token (unique)  │
│ expiresAt       │
│ createdAt       │
└─────────────────┘
```

#### Article
```
┌─────────────────┐
│    Article      │
├─────────────────┤
│ id (PK)         │
│ title           │
│ slug            │
│ content         │
│ excerpt         │
│ published       │
│ tenantId (FK)   │
│ authorId (FK)   │
│ categoryId (FK) │
│ publishedAt     │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
```

#### Category
```
┌─────────────────┐
│    Category     │
├─────────────────┤
│ id (PK)         │
│ name            │
│ slug            │
│ tenantId (FK)   │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
```

### Relationships

- One Tenant has many Users
- One Tenant has many Articles
- One Tenant has many Categories
- One User has many Articles (as author)
- One User has many Sessions
- One Category has many Articles
- One Article belongs to one Tenant, Author, and Category

## GraphQL API Design

### Type System

The API uses a strongly-typed GraphQL schema with:
- Custom scalar types
- Enums for fixed values (Role)
- Input types for mutations
- Consistent error handling

### Query Patterns

**Fetching by Tenant**
```graphql
articles(tenantId: ID!, published: Boolean): [Article!]!
```

**Fetching by Identifier**
```graphql
article(id: ID!): Article
articleBySlug(tenantId: ID!, slug: String!): Article
```

### Mutation Patterns

**Create Operations**
```graphql
createArticle(input: CreateArticleInput!): Article!
```

**Update Operations**
```graphql
updateArticle(id: ID!, input: UpdateArticleInput!): Article!
```

**Delete Operations**
```graphql
deleteArticle(id: ID!): Boolean!
```

## Security Considerations

### Password Security
- Passwords hashed with bcrypt (10 rounds)
- Never stored or transmitted in plain text
- Password validation on client and server

### JWT Security
- Tokens signed with secret key
- Configurable expiration (default 7 days)
- Stored in session table for tracking
- Can be invalidated on logout

### API Security
- All mutations require authentication
- Tenant isolation enforced at resolver level
- Role-based authorization for sensitive operations
- Input validation on all mutations

### SQL Injection Prevention
- Prisma ORM with parameterized queries
- No raw SQL queries
- Type-safe database operations

## Deployment Architecture

### Development
```
Docker Compose with 3 services:
- PostgreSQL (port 5432)
- Backend (port 4000)
- Frontend (port 3000)

All services in same network
Volume mounts for live reload
```

### Production
```
Docker Compose with optimizations:
- Multi-stage builds
- Minimal base images (Alpine)
- Non-root users
- Health checks
- Restart policies
- Environment-based configuration
```

## Scalability Considerations

### Horizontal Scaling
- Backend: Stateless, can add multiple instances behind load balancer
- Frontend: Static builds, can deploy to CDN
- Database: PostgreSQL replication and read replicas

### Performance Optimization
- GraphQL query batching
- Database indexes on foreign keys
- Connection pooling in Prisma
- Caching strategies (can be added)

### Monitoring
- Application logs via Docker
- Database query logs
- GraphQL query metrics
- Error tracking (can integrate Sentry)

## Technology Choices Rationale

### Why GraphQL?
- Type safety across frontend and backend
- Efficient data fetching (no over/under-fetching)
- Self-documenting API
- Great developer experience

### Why Prisma?
- Type-safe database access
- Automatic migrations
- Great TypeScript support
- Built-in connection pooling

### Why Next.js?
- React framework with great DX
- Built-in routing
- Server-side rendering capabilities
- API routes for NextAuth

### Why NextAuth?
- Industry-standard authentication
- Multiple provider support
- Session management
- Secure by default

### Why PostgreSQL?
- ACID compliance
- Robust relational model
- Great performance
- Wide tooling support

## Future Enhancements

- [ ] Real-time updates with GraphQL Subscriptions
- [ ] File upload for article images
- [ ] Rich text editor integration
- [ ] Comment system
- [ ] Search functionality with ElasticSearch
- [ ] Analytics and reporting
- [ ] Email notifications
- [ ] API rate limiting
- [ ] Caching layer (Redis)
- [ ] Monitoring and alerting

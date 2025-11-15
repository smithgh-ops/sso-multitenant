# News Multi-Tenant SSO

Monorepo untuk aplikasi berita multi-tenant dengan SSO (Single Sign-On).

## 📋 Tech Stack

### Backend
- **Node.js** & **TypeScript** - Runtime dan bahasa pemrograman
- **Apollo Server** - GraphQL server
- **Prisma ORM** - Database ORM untuk PostgreSQL
- **PostgreSQL** - Database relasional
- **JWT** - Token-based authentication untuk SSO bridge

### Frontend
- **Next.js 14** - React framework dengan App Router
- **NextAuth.js** - Autentikasi SSO
- **Apollo Client** - GraphQL client
- **Tailwind CSS** - Styling

### Infrastructure
- **Docker** & **Docker Compose** - Containerization
- PostgreSQL, Backend, dan Frontend dalam container terpisah

## 🏗️ Struktur Proyek

```
sso-multitenant/
├── backend/                 # GraphQL API Server
│   ├── prisma/             # Database schema & migrations
│   │   └── schema.prisma   # Prisma schema
│   ├── src/
│   │   ├── schema/         # GraphQL type definitions
│   │   ├── resolvers/      # GraphQL resolvers
│   │   ├── middleware/     # Auth & context middleware
│   │   ├── utils/          # Helper functions (JWT, password)
│   │   └── index.ts        # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/               # Next.js Application
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   │   ├── api/       # API routes (NextAuth)
│   │   │   ├── auth/      # Authentication pages
│   │   │   └── articles/  # Articles pages
│   │   ├── lib/           # Apollo Client config
│   │   └── components/    # React components
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
└── docker-compose.yml      # Docker orchestration
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (untuk development lokal tanpa Docker)
- PostgreSQL 15+ (untuk development lokal tanpa Docker)

### Menggunakan Docker (Recommended)

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd sso-multitenant
   ```

2. **Jalankan seluruh stack**
   ```bash
   docker-compose up -d
   ```

3. **Akses aplikasi**
   - Frontend: http://localhost:3000
   - Backend GraphQL: http://localhost:4000/graphql
   - PostgreSQL: localhost:5432

4. **Setup database (first time)**
   ```bash
   # Masuk ke container backend
   docker exec -it news-backend sh
   
   # Jalankan migrations
   npx prisma migrate dev --name init
   
   # (Optional) Seed database
   npx prisma db seed
   ```

### Development Lokal (Tanpa Docker)

#### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env dengan konfigurasi database Anda
   ```

3. **Setup database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Server akan berjalan di http://localhost:4000

#### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local jika perlu
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di http://localhost:3000

## 🗄️ Database Schema

Aplikasi menggunakan multi-tenant architecture dengan model berikut:

- **Tenant** - Organisasi/perusahaan yang menggunakan sistem
- **User** - Pengguna dengan role (USER, EDITOR, ADMIN)
- **Session** - SSO session management
- **Article** - Konten berita
- **Category** - Kategori artikel

Setiap tenant memiliki data yang terisolasi untuk users, articles, dan categories.

## 🔐 Authentication & SSO

Sistem menggunakan JWT-based SSO:

1. User login melalui frontend (NextAuth)
2. Backend memvalidasi credentials dan generate JWT token
3. Token disimpan dalam session database
4. Frontend mengirim token dalam setiap request ke GraphQL API
5. Backend memvalidasi token dan mengidentifikasi user & tenant

## 📝 GraphQL API

### Queries
- `me` - Get current user
- `articles` - List articles by tenant
- `article`, `articleBySlug` - Get single article
- `categories` - List categories
- `users` - List users in tenant
- `tenant`, `tenantBySlug` - Get tenant info

### Mutations
- `register`, `login`, `logout` - Authentication
- `createArticle`, `updateArticle`, `deleteArticle` - Article management
- `publishArticle`, `unpublishArticle` - Publishing control
- `createCategory`, `updateCategory`, `deleteCategory` - Category management
- `createTenant`, `updateTenant` - Tenant management (Admin only)

## 🛠️ Development Commands

### Backend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Run database migrations
npm run prisma:studio     # Open Prisma Studio
```

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Rebuild containers
docker-compose up -d --build

# Remove volumes (WARNING: deletes database data)
docker-compose down -v
```

## 🔑 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/newsdb?schema=public
PORT=4000
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-change-in-production
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
```

## 📦 Production Deployment

1. Update environment variables untuk production
2. Build frontend: `cd frontend && npm run build`
3. Build backend: `cd backend && npm run build`
4. Deploy menggunakan Docker Compose atau platform pilihan Anda
5. Jalankan migrations: `npx prisma migrate deploy`
6. Pastikan database backup teratur

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

Lihat file [LICENSE](LICENSE) untuk detail.
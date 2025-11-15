.PHONY: help install dev build start stop clean logs migrate seed

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies for all services
	@echo "Installing dependencies..."
	npm install
	cd backend && npm install
	cd frontend && npm install

dev: ## Start development environment with Docker
	@echo "Starting development environment..."
	docker-compose up -d
	@echo "Services started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:4000/graphql"

build: ## Build all Docker containers
	@echo "Building containers..."
	docker-compose build

start: ## Start all services
	@echo "Starting services..."
	docker-compose up -d

stop: ## Stop all services
	@echo "Stopping services..."
	docker-compose down

clean: ## Stop services and remove volumes
	@echo "Cleaning up..."
	docker-compose down -v
	rm -rf backend/node_modules frontend/node_modules node_modules
	rm -rf backend/dist frontend/.next

logs: ## Show logs from all services
	docker-compose logs -f

logs-backend: ## Show backend logs
	docker logs -f news-backend

logs-frontend: ## Show frontend logs
	docker logs -f news-frontend

logs-db: ## Show database logs
	docker logs -f newsdb

migrate: ## Run database migrations
	docker exec -it news-backend npx prisma migrate dev

migrate-deploy: ## Deploy database migrations (production)
	docker exec -it news-backend npx prisma migrate deploy

seed: ## Seed the database with demo data
	docker exec -it news-backend npm run seed

prisma-studio: ## Open Prisma Studio
	docker exec -it news-backend npx prisma studio

shell-backend: ## Open shell in backend container
	docker exec -it news-backend sh

shell-frontend: ## Open shell in frontend container
	docker exec -it news-frontend sh

shell-db: ## Open PostgreSQL shell
	docker exec -it newsdb psql -U postgres -d newsdb

prod-build: ## Build production containers
	docker-compose -f docker-compose.prod.yml build

prod-start: ## Start production environment
	docker-compose -f docker-compose.prod.yml up -d

prod-stop: ## Stop production environment
	docker-compose -f docker-compose.prod.yml down

test-backend: ## Run backend tests
	cd backend && npm test

test-frontend: ## Run frontend tests
	cd frontend && npm test

lint-backend: ## Lint backend code
	cd backend && npm run build

lint-frontend: ## Lint frontend code
	cd frontend && npm run lint

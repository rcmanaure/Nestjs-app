# NestJS Full-Stack Application

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0+-red.svg)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-green.svg)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

A comprehensive NestJS application with MongoDB, Clerk authentication, AWS S3, Redis caching, Stripe payments, and Swagger documentation.

## 🚀 Features

- **Modular Architecture**: Clean separation of concerns with dedicated modules
- **Authentication**: Clerk-based authentication with role-based access control
- **Database**: MongoDB with Mongoose ODM and repository pattern
- **Caching**: Redis integration with interceptors for performance
- **File Storage**: AWS S3 integration for image uploads
- **Payments**: Stripe integration for payment processing
- **API Documentation**: Auto-generated Swagger documentation
- **Docker Support**: Multi-stage Dockerfile and docker-compose setup
- **Testing**: Comprehensive unit and E2E tests with Jest
- **Validation**: Class-validator DTOs for input validation
- **Error Handling**: Global exception filters and logging

## 📁 Project Structure

```
src/
├── core/                    # Core module with global configs
│   ├── core.module.ts
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── middlewares/
├── shared/                  # Shared services and utilities
│   ├── shared.module.ts
│   └── services/
├── database/               # Database configuration
│   ├── database.module.ts
│   └── repositories/
├── config/                 # Configuration and validation
├── modules/                # Feature modules
│   └── users/              # Example domain module
│       ├── controllers/
│       ├── services/
│       ├── dto/
│       ├── entities/
│       ├── guards/
│       └── interceptors/
├── common/                 # Common utilities
└── app.module.ts          # Main application module
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nestjs-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```

   Configure your environment variables in `.env`:
   ```env
   # Application
   PORT=3000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/nestjs-app

   # Clerk Authentication
   CLERK_SECRET_KEY=your_clerk_secret_key

   # AWS S3
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_S3_BUCKET_NAME=your_bucket_name

   # Redis
   REDIS_URL=redis://localhost:6379

   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

## 🚀 Running the Application

### Development Mode
```bash
# Start with npm
npm run start:dev

# Or with Docker
docker-compose up
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Docker Commands
```bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f app
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 📚 API Documentation

Once the application is running, visit:
- **Swagger UI**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

## 🔧 Available Scripts

```bash
# Development
npm run start:dev          # Start in watch mode
npm run start:debug        # Start with debugging

# Building
npm run build              # Build for production
npm run format             # Format code with Prettier
npm run lint               # Run ESLint
npm run lint:check         # Check linting without fixing

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run E2E tests

# Docker
npm run docker:build       # Build Docker image
npm run docker:run         # Run Docker container
npm run docker:up          # Start docker-compose
npm run docker:down        # Stop docker-compose
```

## 🏗️ Architecture Overview

### Core Module
- **Global Exception Filters**: Centralized error handling
- **Authentication Guards**: Clerk-based auth with role checks
- **Logging Interceptor**: Request/response logging
- **Rate Limiting**: Throttler for API protection

### Shared Module
- **Logger Service**: Structured logging with context
- **Stripe Service**: Payment processing integration
- **AWS S3 Service**: File upload and management
- **Redis Service**: Caching and session management

### Database Layer
- **Mongoose ODM**: MongoDB object modeling
- **Repository Pattern**: Data access abstraction
- **Base Repository**: Common CRUD operations

### Domain Modules
Each feature follows the same structure:
- **Controllers**: API endpoints with validation
- **Services**: Business logic implementation
- **DTOs**: Input/output validation schemas
- **Entities**: Database schemas
- **Guards**: Route-specific authorization
- **Interceptors**: Route-specific behavior

## 🔐 Authentication & Authorization

The application uses Clerk for authentication:
- JWT tokens for API access
- Role-based access control
- Public routes bypass authentication
- Admin routes require specific roles

```typescript
// Public route
@Public()
@Get('public')
getPublicData() { ... }

// Protected route with role
@Roles('admin')
@Post('admin-only')
createAdminResource() { ... }
```

## 💳 Payment Integration

Stripe integration includes:
- Customer management
- Payment intent creation
- Webhook handling
- Secure payment processing

## 📁 File Storage

AWS S3 integration provides:
- Image upload and download
- Signed URLs for secure access
- File deletion management
- Configurable storage buckets

## 🔄 Caching Strategy

Redis caching includes:
- Response caching with TTL
- Manual cache management
- Cache invalidation
- Performance optimization

## 🧪 Testing Strategy

- **Unit Tests**: Service and utility testing
- **Integration Tests**: Module interaction testing
- **E2E Tests**: Full API workflow testing
- **Test Coverage**: Minimum 70% coverage required

## 🚀 Deployment

### Docker Deployment
```bash
# Build production image
docker build -t nestjs-app .

# Run with environment variables
docker run -p 3000:3000 --env-file .env nestjs-app
```

### Cloud Deployment
The application is ready for deployment on:
- AWS (ECS, EKS, Lambda)
- Google Cloud (Cloud Run, GKE)
- Azure (Container Instances, AKS)
- Railway, Render, or similar platforms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Testing related changes
- `chore:` Maintenance tasks

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📖 [NestJS Documentation](https://docs.nestjs.com)
- 💬 [Discord Community](https://discord.gg/G7Qnnhy)
- 🐛 [GitHub Issues](https://github.com/your-repo/issues)

## 🔗 Useful Links

- [NestJS Official Site](https://nestjs.com/)
- [Clerk Authentication](https://clerk.com/docs)
- [Stripe API Docs](https://stripe.com/docs/api)
- [AWS SDK Documentation](https://docs.aws.amazon.com/sdk-for-javascript/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)
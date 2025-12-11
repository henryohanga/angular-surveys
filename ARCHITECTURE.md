# Architecture Documentation

## Overview

Angular Surveys is a full-stack survey platform built with Angular 21, NestJS 11, and PostgreSQL 16. The application follows modern Angular best practices and the official Angular Style Guide.

## Technology Stack

### Frontend

- **Angular 21** - Modern web framework with standalone components support
- **Angular Material 21** - Material Design 3 components
- **RxJS 7** - Reactive programming
- **TypeScript 5.9** - Type-safe JavaScript
- **Nx 22** - Monorepo tooling

### Backend

- **NestJS 11** - Progressive Node.js framework
- **TypeORM 0.3** - ORM for database operations
- **PostgreSQL 16** - Relational database
- **JWT** - Authentication tokens
- **Passport** - Authentication middleware

### DevOps

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Caddy** - Web server and reverse proxy
- **GitHub Actions** - CI/CD pipeline

## Project Structure

```
angular-surveys/
├── apps/
│   ├── web/                          # Angular frontend application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── analytics/        # Analytics & reporting module
│   │   │   │   ├── auth/             # Authentication module
│   │   │   │   ├── builder/          # Survey builder module
│   │   │   │   ├── core/             # Core services & guards
│   │   │   │   │   ├── guards/       # Route guards
│   │   │   │   │   ├── interceptors/ # HTTP interceptors
│   │   │   │   │   ├── services/     # Singleton services
│   │   │   │   │   └── data/         # Static data & templates
│   │   │   │   ├── dashboard/        # Survey management
│   │   │   │   ├── home/             # Landing page
│   │   │   │   ├── public-survey/    # Public survey viewer
│   │   │   │   └── surveys/          # Survey runtime engine
│   │   │   │       ├── components/   # Question components
│   │   │   │       └── models/       # TypeScript interfaces
│   │   │   └── environments/         # Environment configs
│   │   ├── e2e/                      # End-to-end tests (Playwright)
│   │   └── Dockerfile                # Production build
│   │
│   └── api/                          # NestJS backend application
│       ├── src/
│       │   └── app/
│       │       ├── auth/             # JWT authentication
│       │       ├── users/            # User management
│       │       ├── surveys/          # Survey CRUD operations
│       │       ├── responses/        # Response handling
│       │       └── health/           # Health check endpoints
│       └── Dockerfile                # Production build
│
├── libs/
│   └── shared-types/                 # Shared TypeScript types
│       └── src/lib/
│           ├── survey.types.ts       # Survey domain types
│           ├── user.types.ts         # User domain types
│           ├── response.types.ts     # Response domain types
│           └── api.types.ts          # API contract types
│
├── docker-compose.yml                # Production services
├── docker-compose.dev.yml            # Development services
└── nx.json                           # Nx workspace config
```

## Architecture Patterns

### Frontend Architecture

#### 1. Module-based Organization

Each feature is organized into its own Angular module with lazy loading support:

- **Feature Modules** - Self-contained features (builder, dashboard, analytics)
- **Shared Module** - Reusable components and directives
- **Core Module** - Singleton services (imported once in AppModule)

#### 2. Service Layer Pattern

```typescript
// Services use inject() function per Angular style guide
@Injectable({ providedIn: "root" })
export class SurveyApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getAllSurveys(): Observable<ApiSurvey[]> {
    return this.http.get<ApiSurvey[]>(`${this.apiUrl}/surveys`);
  }
}
```

#### 3. Component Design

Components follow Angular style guide best practices:

- **Protected members** for template-only properties/methods
- **Readonly modifiers** for immutable properties
- **Dependency injection** via `inject()` function
- **OnPush change detection** where applicable

```typescript
@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly surveyApi = inject(SurveyApiService);

  protected readonly surveys$ = this.surveyApi.getAllSurveys();

  protected async createSurvey(): Promise<void> {
    // Implementation
  }
}
```

#### 4. State Management

- **Local Component State** - For UI-specific state
- **Service State** - For shared state (AuthService, FormStateService)
- **IndexedDB** - For offline persistence
- **RxJS BehaviorSubject** - For reactive state streams

### Backend Architecture

#### 1. Layered Architecture

```
Controllers (HTTP Layer)
    ↓
Services (Business Logic)
    ↓
Repositories (Data Access)
    ↓
Database (PostgreSQL)
```

#### 2. Module Structure

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Survey])],
  controllers: [SurveysController],
  providers: [SurveysService],
  exports: [SurveysService],
})
export class SurveysModule {}
```

#### 3. Authentication Flow

```
Client Request
    ↓
AuthGuard (JWT validation)
    ↓
Controller (Route handler)
    ↓
Service (Business logic)
    ↓
Response
```

## Data Flow

### Survey Creation Flow

```
1. User creates survey in Builder
2. FormStateService manages local state
3. User clicks "Save"
4. SurveyApiService.createSurvey()
5. HTTP POST to /api/surveys
6. NestJS SurveysController receives request
7. SurveysService validates & saves to DB
8. Response returns with survey ID
9. Router navigates to /builder/:id
```

### Response Submission Flow

```
1. User fills out public survey
2. SurveyComponent collects responses
3. User clicks "Submit"
4. HTTP POST to /api/responses
5. ResponsesService validates & saves
6. Success message displayed
7. Analytics updated in real-time
```

## Security Architecture

### Authentication

- **JWT Tokens** - Stateless authentication
- **HTTP-only Cookies** - Secure token storage (optional)
- **Token Expiration** - 24-hour validity
- **Refresh Tokens** - Long-lived refresh capability

### Authorization

- **Role-based Access Control (RBAC)**
  - Admin: Full access
  - User: Create/edit own surveys
  - Viewer: Read-only access

### Data Protection

- **Password Hashing** - bcrypt with salt rounds
- **SQL Injection Prevention** - TypeORM parameterized queries
- **XSS Protection** - Angular sanitization
- **CSRF Protection** - Token-based validation
- **Rate Limiting** - NestJS Throttler

## Database Schema

### Core Tables

#### users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### surveys

```sql
CREATE TABLE surveys (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  form JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### responses

```sql
CREATE TABLE responses (
  id UUID PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id),
  responses JSONB NOT NULL,
  submitted_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT
);
```

### Indexes

```sql
CREATE INDEX idx_surveys_user_id ON surveys(user_id);
CREATE INDEX idx_surveys_status ON surveys(status);
CREATE INDEX idx_responses_survey_id ON responses(survey_id);
CREATE INDEX idx_responses_submitted_at ON responses(submitted_at);
```

## Performance Optimizations

### Frontend

1. **Lazy Loading** - Feature modules loaded on demand
2. **OnPush Change Detection** - Reduced change detection cycles
3. **TrackBy Functions** - Optimized list rendering
4. **Virtual Scrolling** - For large lists (planned)
5. **Bundle Splitting** - Separate vendor and app bundles

### Backend

1. **Database Indexing** - Optimized query performance
2. **Connection Pooling** - Efficient DB connections
3. **Caching** - Redis for frequently accessed data (planned)
4. **Pagination** - Limit response sizes
5. **Compression** - Gzip response compression

## Testing Strategy

### Frontend Tests

- **Unit Tests** - Jest for component/service logic
- **Integration Tests** - Component + service interactions
- **E2E Tests** - Playwright for user workflows

### Backend Tests

- **Unit Tests** - Jest for service logic
- **Integration Tests** - Supertest for API endpoints
- **E2E Tests** - Full stack testing

### Test Coverage Goals

- **Unit Tests**: >80% coverage
- **Integration Tests**: Critical paths
- **E2E Tests**: Main user flows

## Deployment Architecture

### Production Environment

```
Internet
    ↓
Caddy (Reverse Proxy + SSL)
    ├── /api → NestJS API (Port 3000)
    └── / → Angular App (Static Files)
    ↓
PostgreSQL (Port 5432)
```

### Docker Compose Setup

```yaml
services:
  web:
    build: ./apps/web
    ports: ["80:80"]

  api:
    build: ./apps/api
    ports: ["3000:3000"]
    environment:
      - DATABASE_URL=postgresql://...

  postgres:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
```

## Monitoring & Logging

### Application Monitoring

- **Sentry** - Error tracking and performance monitoring
- **Health Checks** - /api/health endpoint
- **Metrics** - Response times, error rates

### Logging

- **Winston** - Structured logging (backend)
- **Console** - Development logging (frontend)
- **Log Levels** - Error, Warn, Info, Debug

## Scalability Considerations

### Horizontal Scaling

- **Stateless API** - Multiple API instances
- **Load Balancer** - Distribute traffic
- **Session Storage** - Redis for shared sessions

### Database Scaling

- **Read Replicas** - Distribute read queries
- **Connection Pooling** - Efficient connection reuse
- **Partitioning** - Table partitioning for large datasets

## Development Workflow

### Local Development

```bash
# Start database
docker-compose up -d postgres

# Start API
npm run start:api

# Start web app
npm run start
```

### Code Quality

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Pre-commit hooks
- **Conventional Commits** - Commit message standards

### CI/CD Pipeline

```
Push to GitHub
    ↓
GitHub Actions
    ├── Lint
    ├── Test
    ├── Build
    └── Deploy (on main branch)
```

## Future Architecture Improvements

1. **Microservices** - Split API into smaller services
2. **Event-Driven** - Message queue for async operations
3. **GraphQL** - Alternative to REST API
4. **CDN** - Static asset delivery
5. **Kubernetes** - Container orchestration

---

_Last Updated: December 2024_

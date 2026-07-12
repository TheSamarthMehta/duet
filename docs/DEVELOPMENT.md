# Development Guide

## Environment Setup

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **pnpm**: 8.0.0 or higher
- **Docker**: Latest stable
- **Docker Compose**: Latest stable
- **Expo CLI**: Latest stable (for mobile)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment files:
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   cp apps/mobile/.env.example apps/mobile/.env
   ```

4. Start services:
   ```bash
   docker-compose up -d
   ```

5. Run migrations:
   ```bash
   pnpm --filter backend prisma migrate dev
   ```

## Development Commands

### Backend

```bash
# Start development server (watches for changes)
pnpm dev:backend

# Build for production
pnpm build:backend

# Run tests
pnpm test:backend

# Lint
pnpm lint:backend

# Format
pnpm format:backend

# Database migrations
pnpm --filter backend prisma migrate dev
pnpm --filter backend prisma studio

# Generate Prisma client
pnpm --filter backend prisma generate
```

### Mobile

```bash
# Start Expo development server
pnpm dev:mobile

# Build for Android
pnpm build:mobile:android

# Build for iOS (macOS only)
pnpm build:mobile:ios

# Lint
pnpm lint:mobile

# Format
pnpm format:mobile
```

### Shared Packages

```bash
# Build all shared packages
pnpm build:packages

# Watch for changes
pnpm watch:packages
```

### All Workspaces

```bash
# Run command in all workspaces
pnpm -r [command]

# Example: lint everything
pnpm -r lint
```

## Database Management

### PostgreSQL

The database runs in Docker. Access it:

```bash
# Connect with psql
docker exec -it duet_postgres psql -U duet -d duet_db

# View database
\l

# Connect to duet_db
\c duet_db

# List tables
\dt
```

### Prisma Migrations

When you change the schema:

```bash
# Create a new migration
pnpm --filter backend prisma migrate dev --name "add_feature"

# Apply migrations
pnpm --filter backend prisma migrate deploy

# View Prisma Studio (visual editor)
pnpm --filter backend prisma studio
```

### Seeding (Optional)

```bash
# Run seed script
pnpm --filter backend prisma db seed
```

## Coding Standards

### TypeScript

- **Strict Mode**: Always enabled
- **No `any` types**: Use proper typing
- **Interfaces over types**: For object shapes
- **Enums**: For fixed sets of values

### Naming Conventions

- **Files**: kebab-case (user.service.ts)
- **Classes**: PascalCase (UserService)
- **Constants**: UPPER_SNAKE_CASE
- **Variables**: camelCase
- **Database columns**: snake_case

### File Structure

```
module/
├── controllers/
│   └── user.controller.ts          # HTTP endpoints
├── services/
│   └── user.service.ts             # Business logic
├── repositories/
│   └── user.repository.ts          # Data access
├── dto/
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
├── entities/
│   └── user.entity.ts              # Domain model
├── decorators/
│   └── auth.decorator.ts
├── user.module.ts                   # NestJS module
└── user.service.spec.ts            # Tests
```

### Comments

Only write comments for the WHY, not the WHAT.

Good:
```typescript
// Refresh token expires in 7 days, refresh within 24h of expiry
const refreshTokenExpiresIn = 7 * 24 * 60 * 60;
```

Bad:
```typescript
// Set refresh token expiration
const refreshTokenExpiresIn = 7 * 24 * 60 * 60;
```

## Git Workflow

### Commit Messages

Follow Conventional Commits:

```
feat(auth): add OTP verification
fix(chat): resolve message ordering bug
docs(api): update endpoint documentation
refactor(gallery): simplify image grid component
test(auth): add JWT validation tests
```

### Branches

```
main                    # Production-ready
├── feature/auth-otp    # Features
├── fix/chat-bug        # Bug fixes
└── docs/setup          # Documentation
```

### Pre-commit Hooks

Husky automatically runs:
- ESLint
- Prettier
- Type checking

No need to manually run these before commit.

## Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test -- --watch

# Coverage
pnpm test -- --coverage
```

### Test Structure

```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  beforeEach(async () => {
    // Setup
  });

  it('should create a user with email', async () => {
    // Arrange
    const dto = new CreateUserDto();
    
    // Act
    const result = await service.create(dto);
    
    // Assert
    expect(result.email).toBe(dto.email);
  });
});
```

## Debugging

### Backend

```bash
# Enable verbose logging
NODE_DEBUG=* pnpm dev:backend

# Attach debugger in VS Code
# Use launch.json configuration
```

### Mobile

```bash
# Expo logs
pnpm dev:mobile

# React Native Debugger (separate app)
# Open http://localhost:19001
```

### Database

```bash
# Query logs
docker logs duet_postgres

# Prisma Studio
pnpm --filter backend prisma studio
```

## Common Issues

### Port Already in Use

```bash
# Find and kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

### Database Connection Failed

```bash
# Check if Docker container is running
docker ps | grep duet_postgres

# Restart services
docker-compose restart
```

### Node Modules Issues

```bash
# Clear cache and reinstall
rm -rf node_modules
pnpm install
```

## Performance Tips

1. **Use Indexes**: Add database indexes for frequently queried columns
2. **Pagination**: Always paginate large result sets
3. **Caching**: Use Redis for session & frequently accessed data
4. **Lazy Loading**: Load images lazily in gallery
5. **Query Optimization**: Use Prisma `select` to fetch only needed fields

## Documentation

- **API Docs**: Swagger UI at `http://localhost:3000/api/docs`
- **Database Schema**: View in `apps/backend/prisma/schema.prisma`
- **Type Definitions**: `packages/shared/src/types/`
- **Architecture**: See `docs/ARCHITECTURE.md`

## Getting Help

1. Check existing documentation
2. Search GitHub issues
3. Review similar modules for patterns
4. Ask in team chat

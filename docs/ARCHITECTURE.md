# Architecture

## Overview

Duet is a **modular monolith** built on Clean Architecture principles. Every module is independent and self-contained.

## Backend Architecture

### Module Structure

Each backend module follows this pattern:

```
apps/backend/src/modules/[feature]/
├── controllers/          # HTTP request handlers
├── services/            # Business logic
├── repositories/        # Data access
├── dto/                 # Data transfer objects
├── entities/            # Domain models
├── decorators/          # Custom decorators
└── module.ts            # NestJS module definition
```

### Core Modules

1. **Auth**
   - Login, Register, OTP Verification
   - JWT & Refresh Token Management
   - Route Protection

2. **Users**
   - User Profile Management
   - Settings & Preferences

3. **Couples**
   - Couple Invite System
   - Relationship Management
   - Partner Association

4. **Chat**
   - Real-time Messaging
   - Read Receipts
   - Typing Indicators
   - Socket.IO Events

5. **Media**
   - Image Upload
   - Storage Management (S3/R2)
   - Image Metadata

6. **Gallery**
   - Photo Organization
   - Year/Month/Event Grouping
   - Search & Filter

7. **LoveNotes**
   - Scheduled Note Unlock
   - Note Creation & Retrieval
   - Cron Jobs for Unlocking

8. **Timeline**
   - Milestone Creation
   - Chronological Display
   - Event Management

9. **Mood**
   - Mood Status Sharing
   - Real-time Updates
   - Notification Triggers

10. **Notifications**
    - Push Notification Management
    - Firebase Cloud Messaging Integration

## Frontend Architecture (React Native)

### Folder Structure

```
apps/mobile/src/
├── navigation/          # React Navigation stacks
├── screens/            # Screen components
├── components/         # Reusable UI components
├── services/           # API & Socket clients
├── store/              # Zustand stores
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript types
├── assets/             # Images, fonts, icons
└── theme/              # Color palette & styling
```

### State Management

**Zustand** for global state:
- Auth state (user, token)
- Couple state (partner info)
- UI state (theme, modals)

**TanStack Query** for server state:
- Chat messages
- Gallery images
- Timeline milestones
- Mood status

### Navigation Structure

```
RootNavigator
├── Auth Stack (Login, Register, OTP)
├── Onboarding Stack (Couple Invite)
└── App Stack
    ├── Home Tab
    ├── Chat Tab
    ├── Gallery Tab
    ├── Timeline Tab
    ├── Mood Tab
    └── Settings Stack
```

## Data Flow

### Real-time Chat Example

1. User types message → Text input state
2. User presses Send → Service layer API call
3. Backend receives message → Database storage + Socket emit
4. Socket listener receives message → Query cache update
5. UI re-renders with new message

### Image Upload Example

1. User selects image from camera/gallery
2. Image compressed & uploaded to S3/R2
3. URL saved to database
4. Gallery screen refetches images
5. UI updates grid

## Database Schema

### Core Relations

- **Users** (id, email, name, avatar, createdAt)
- **Couples** (id, user1_id, user2_id, status, createdAt)
- **Messages** (id, couple_id, sender_id, content, createdAt)
- **Images** (id, couple_id, uploader_id, url, createdAt)
- **LoveNotes** (id, couple_id, creator_id, content, unlockedAt, createdAt)
- **Timeline** (id, couple_id, title, date, type, createdAt)
- **Mood** (id, couple_id, user_id, emoji, updatedAt)

## Security

### Authentication

- JWT tokens stored in secure HTTP-only cookies (web) / encrypted storage (mobile)
- Refresh token rotation
- OTP verification for sensitive operations

### Authorization

- Route guards verify couple relationship
- Users can only access their own couple's data
- No cross-couple data leakage

### Input Validation

- DTOs with class-validator
- Request sanitization
- Rate limiting on auth endpoints

## Deployment

### Local Development

```bash
docker-compose up -d
pnpm install
pnpm dev:backend
pnpm dev:mobile
```

### Production

- Backend: Docker container on VPS
- Database: PostgreSQL on VPS
- Cache: Redis for sessions
- Storage: AWS S3 or Cloudflare R2
- SSL: Nginx + Let's Encrypt
- CI/CD: GitHub Actions

## Performance Considerations

1. **Database Indexing**
   - couple_id on all tables
   - user_id on user-related queries
   - createdAt for sorting

2. **Caching**
   - Redis for sessions
   - Query caching with TanStack Query
   - Image CDN with S3 CloudFront

3. **Real-time Optimization**
   - Socket.IO namespace isolation per couple
   - Event debouncing for typing indicators

## Testing Strategy

- **Unit Tests**: Services, utilities
- **Integration Tests**: API endpoints, database
- **Socket Tests**: Real-time events
- **E2E Tests**: Critical user flows

## Module Dependencies

```
Auth → Users
Couples → Users, Auth
Chat → Couples, Auth
Media → Couples, Auth
Gallery → Media, Couples
LoveNotes → Couples, Auth
Timeline → Couples, Auth
Mood → Couples, Auth
Notifications → (All modules)
```

No circular dependencies. Clear dependency graph.

## Development Workflow

1. Pick a feature module
2. Define DTOs and entities
3. Implement repository (database layer)
4. Implement service (business logic)
5. Create controller (HTTP endpoints)
6. Write tests
7. Update frontend to consume APIs

This ensures clean separation of concerns and maintainable code.

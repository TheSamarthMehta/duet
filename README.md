# Duet

A private digital home for couples. Communicate, preserve memories, and feel emotionally connected without the distractions of social media.

## Design Philosophy

- Minimal UI
- Soft color palette
- Lots of whitespace
- Smooth animations
- Premium typography
- No clutter, no ads, no public profiles

Think: Apple + Notion + Pinterest + Calm

## Tech Stack

**Frontend**: React Native + Expo + TypeScript + NativeWind
**Backend**: NestJS + Prisma + PostgreSQL + Redis + Socket.IO
**Storage**: AWS S3 or Cloudflare R2
**Auth**: JWT + OTP
**Notifications**: Firebase Cloud Messaging
**Deployment**: Docker + GitHub Actions

## Project Structure

```
duet/
├── apps/
│   ├── backend/          # NestJS server
│   └── mobile/           # React Native + Expo app
├── packages/
│   ├── shared/           # Shared types & utilities
│   └── ui/               # Reusable UI components
├── docs/                 # Documentation
└── scripts/              # Build & deploy scripts
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- Expo CLI (for mobile development)

### Install Dependencies

```bash
pnpm install
```

### Start Local Services

```bash
docker-compose up -d
```

### Development

```bash
# Backend
pnpm dev:backend

# Mobile
pnpm dev:mobile
```

## MVP Features

- ✅ Authentication (Login, Register, OTP)
- ✅ Couple Invite System
- ✅ Home Screen (Days together, Anniversary, Memories)
- ✅ Real-time Chat with Read Receipts
- ✅ Image Sharing & Gallery
- ✅ Love Notes (Scheduled Unlock)
- ✅ Relationship Timeline
- ✅ Mood Sharing
- ✅ Settings

## Architecture

This project follows **Clean Architecture** with a modular monolith structure.

Each module is independent and handles:
- Controllers/Routes
- Business Logic (Services)
- Data Access (Repositories)
- Domain Models

No microservices. Simple, focused, maintainable.

## Contributing

This is a private project. All code follows:
- TypeScript Strict Mode
- ESLint + Prettier
- Conventional Commits
- Husky pre-commit hooks

## License

Private - For use by authorized users only.

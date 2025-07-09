# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo using Turborepo containing full-stack web applications. The primary project is a Todo List application built with Next.js 15 (frontend) and Ktor (Kotlin backend).

## Architecture

- **Monorepo**: Turborepo-based structure with shared configurations
- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Ktor framework with Kotlin, REST API, in-memory storage
- **Package Manager**: pnpm

## Key Commands

### Root Level Commands
- `pnpm fullstack` - Start both frontend and backend servers concurrently
- `pnpm frontend` - Start only frontend dev server (localhost:3000)
- `pnpm backend` - Start only backend server (localhost:8080)
- `pnpm backend:dev` - Start backend with automatic process cleanup and build
- `pnpm backend:kill` - Kill all backend processes
- `pnpm build` - Build all projects using Turborepo
- `pnpm dev` - Start all projects in development mode
- `pnpm lint` - Run linting across all projects
- `pnpm type-check` - Run TypeScript type checking

### Frontend Commands (from projects/01-todo-list/frontend/)
- `pnpm dev` - Start Next.js development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run Jest tests

### Backend Commands (from projects/01-todo-list/backend/)
- `./gradlew run` - Run the application
- `./gradlew build` - Build the project
- `./gradlew test` - Run tests
- `./gradlew buildFatJar` - Build deployable JAR file
- `./gradlew compileKotlin` - Compile Kotlin code
- `./start.sh` - Quick start script (recommended)
- `./dev.sh` - Development script with auto-cleanup

## Development Workflow

### Starting Development
1. Always run `pnpm fullstack` from root for full-stack development
2. Use `pnpm backend:dev` for backend development with auto-cleanup
3. Frontend runs on localhost:3000, backend on localhost:8080

### Backend Development
- The backend uses in-memory storage for development
- Auto-restart scripts handle process cleanup and rebuilding
- Backend serves at localhost:8080 with CORS enabled for frontend

### Frontend Development
- Uses Next.js 15 App Router structure
- API calls are made to localhost:8080
- Jest testing environment configured with React Testing Library

## Important Files and Directories

### Project Structure
```
projects/01-todo-list/
├── frontend/          # Next.js application
│   ├── src/app/       # App Router pages
│   ├── src/components/ # React components
│   ├── src/lib/       # API utilities
│   └── src/types/     # TypeScript types
└── backend/           # Ktor application
    ├── src/main/kotlin/ # Kotlin source code
    ├── start.sh       # Quick start script
    └── dev.sh         # Development script
```

### Key Configuration Files
- `turbo.json` - Turborepo configuration
- `projects/01-todo-list/frontend/next.config.ts` - Next.js configuration
- `projects/01-todo-list/backend/build.gradle.kts` - Gradle build configuration
- `projects/01-todo-list/frontend/jest.config.mjs` - Jest testing configuration

## Development Guidelines

### Code Style
- Use Korean comments for complex logic explanations
- Follow TypeScript and Kotlin best practices
- Use conventional commit messages: `type(scope): description`

### Testing
- Frontend uses Jest with React Testing Library
- Test files should be in `__tests__` directories or use `.test.ts` suffix
- Backend uses JUnit 5 with Kotlin test utilities

### API Development
- Backend provides REST API endpoints at `/api/*`
- Uses kotlinx.serialization for JSON handling
- CORS is configured for frontend development

### Port Usage
- Frontend: localhost:3000
- Backend: localhost:8080
- Check port usage with `lsof -i :8080` or `lsof -i :3000`

## Troubleshooting

### Backend Issues
- If backend fails to start, use `pnpm backend:kill` then `pnpm backend:dev`
- Check for port conflicts with `lsof -i :8080`
- Gradle build issues can be resolved by running `./gradlew clean build`

### Frontend Issues
- Clear Next.js cache with `rm -rf .next`
- Check for port conflicts with `lsof -i :3000`
- Restart development server if hot reload stops working

## Cursor AI Rules Integration

This project includes specific Cursor AI rules that emphasize:
- Incremental development with user approval for each step
- UI development should be done one section at a time
- Frequent commits and pushes for backup and collaboration
- Comprehensive problem resolution documentation
- Reading project status documents before starting work

When working on this project, always check the project status documents first:
- `projects/01-todo-list/QUICK_START.md`
- `projects/01-todo-list/PROJECT_STATUS.md`
- `projects/01-todo-list/WORK_LOG.md`
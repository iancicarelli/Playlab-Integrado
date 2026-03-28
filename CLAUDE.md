# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Playlab-Integrado is a full-stack educational game platform featuring four gesture/voice-controlled browser games. The frontend is a Vue 3 SPA, and the backend is a Spring Boot REST API with JWT auth and MySQL storage.

## Repository Structure

- `Playlab/` — Vue 3 frontend (Vite, TailwindCSS, Phaser, MediaPipe)
- `backend-playlab/` — Spring Boot backend (Java 17, Maven, MySQL, JWT)

## Common Commands

### Frontend (`Playlab/`)

```bash
cd Playlab
npm install              # Install dependencies
npm run dev              # Dev server with hot reload (localhost:5173)
npm run build            # Production build
npm run lint             # ESLint with --fix and --cache
npm run format           # Prettier formatting for src/
```

### Backend (`backend-playlab/`)

```bash
cd backend-playlab
./mvnw spring-boot:run              # Run locally (requires MySQL + .env)
./mvnw clean package                # Build JAR
docker compose up --build           # Run MySQL + app via Docker
docker compose down -v              # Stop and remove volumes
```

Backend requires a `.env` file based on `.env.example` (MySQL credentials, JWT secret).

## Architecture

### Frontend

- **Entry**: `Playlab/src/main.js` → Vue app with router and AudioStore
- **Router** (`src/router/index.js`): 14 routes — landing → login/register → game selection → play → game over → leaderboard
- **Games** (`src/games/`): Each game has its own directory with dedicated logic, scenes, and controllers:
  - **Simon Gesture** — pattern recognition using hand gestures/postures
  - **Snake Eater** — Phaser-based snake game with keyboard, gesture (MediaPipe), and voice controllers
  - **Dino Rush** — gesture-controlled dinosaur runner
  - **UFO Evader** — avoidance game
- **Services** (`src/services/api.js`): Single API client handling auth, scores, and leaderboards. Game IDs: DINO_RUSH=1, SNAKE=2, SIMON_GESTURE=3, UFO_EVADER=4
- **Path alias**: `@/*` maps to `./src/*` (configured in `jsconfig.json`)

### Backend

- **Controllers**: `AuthenticationController`, `ScoreController`, `GameController`, `ProfileController`
- **Security**: Stateless JWT auth (HS256) via Spring Security. CORS allowed for `localhost:5173`. `JwtTokenValidator` filter on requests.
- **Persistence**: JPA entities (User, Score, Game, Role, Permission) with MySQL. Tables auto-generated from annotations. `data.sql` seeds initial data; `Application.java` seeds a default "tester/123" user.
- **Exception handling**: Global `RestExceptionHandler` with custom exceptions (BadRequest, Forbidden, ResourceNotFound)

### API Endpoints

- `POST /auth/log-in`, `/auth/sign-up`, `/auth/validate-token` — Auth (public)
- `POST /api/scores` — Submit score (authenticated)
- `GET /api/scores/leaderboard` — Top scores (authenticated)
- `GET /api/profile` — Player profile stats (authenticated)
- `GET /api/games` — List games (authenticated)
